#!/usr/bin/env python3
"""
Script para inicializar y poblar la Base de Datos en Supabase para el Gemelo Digital.
Crea la extensión PostGIS, inicializa las tablas del ORM e inserta el usuario administrador por defecto.
"""

import sys
import os
import asyncio
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from sqlalchemy import text, select
from app.core.database import engine, AsyncSessionLocal, Base
from app.core.config import settings
import app.models  # Ensures all SQLAlchemy models are registered in Base.metadata
from app.models.user import User
from app.core.security import get_password_hash

async def seed_supabase():
    print("=" * 65)
    print("  🌿 GEMELO DIGITAL - INICIALIZADOR DE SUPABASE (POSTGIS)")
    print("=" * 65)
    print(f"\n[1/4] Probando conexión a la Base de Datos:")
    print(f"      Host: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else 'local'}")
    
    try:
        async with engine.begin() as conn:
            # 1. PostGIS Extension
            print("\n[2/4] Verificando extensión PostGIS en Supabase...")
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            postgis_ver = await conn.execute(text("SELECT PostGIS_Version();"))
            ver_str = postgis_ver.scalar()
            print(f"      ✓ PostGIS activo: v{ver_str}")

            # 2. Create Tables
            print("\n[3/4] Creando tablas del Gemelo Digital...")
            await conn.run_sync(Base.metadata.create_all)
            try:
                await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;"))
            except Exception:
                pass
            print("      ✓ Tablas verificadas y creadas correctamente.")

        # 3. Create Default Admin User
        print("\n[4/4] Verificando usuario administrador predeterminado...")
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(User).where(User.email == "admin@gemelodigital.com")
            )
            admin_user = result.scalar_one_or_none()

            if not admin_user:
                hashed = get_password_hash("admin123")
                new_admin = User(
                    email="admin@gemelodigital.com",
                    hashed_password=hashed,
                    full_name="Administrador Gemelo Digital",
                    role="admin",
                    is_active=True,
                    is_verified=True
                )
                session.add(new_admin)
                await session.commit()
                print("      ✓ Usuario administrador CREADO con éxito:")
                print("        • Email: admin@gemelodigital.com")
                print("        • Clave: admin123")
            else:
                print("      ✓ El usuario administrador ya existe en la base de datos.")

        print("\n" + "=" * 65)
        print("  🎉 ¡SUPABASE LISTO PARA EL GEMELO DIGITAL!")
        print("=" * 65 + "\n")

    except Exception as e:
        print(f"\n❌ ERROR durante la inicialización: {e}")
        print("\n💡 Tips para solucionar el error:")
        print(" 1. Verifica que la contraseña en DATABASE_URL sea correcta.")
        print(" 2. Asegúrate de usar el formato: postgresql+asyncpg://postgres:[PASS]@[HOST]:5432/postgres?ssl=require")
        print(" 3. En Supabase, revisa en 'Project Settings' -> 'Database' que el proyecto esté activo.")
        sys.exit(1)
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed_supabase())
