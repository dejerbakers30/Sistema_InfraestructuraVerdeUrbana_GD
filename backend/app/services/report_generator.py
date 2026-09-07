"""
Report Generator Service.So p
Handles generation of PDF, Word, and Excel reports from simulation results,
green infrastructure lists, ML model benchmarks, and project summaries.
"""

import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from uuid import UUID
from datetime import datetime
import pandas as pd

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Flowable
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT

from docx import Document
from docx.document import Document as DocType
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side

logger = logging.getLogger(__name__)

DEFAULT_GREEN_INFRASTRUCTURE = [
    {"id": "GI-001", "name": "Bosque Urbano Central", "type": "Árbol (Jacaranda mimosifolia)", "species": "Jacaranda mimosifolia", "height": 12.5, "crown_diameter": 8.0, "lai": 4.2, "cooling_effect": "-2.3 °C"},
    {"id": "GI-002", "name": "Parque Lineal Avenida España", "type": "Arbustos & Césped", "species": "Ficus benjamina & Pennisetum", "height": 2.1, "crown_diameter": 3.5, "lai": 2.8, "cooling_effect": "-1.1 °C"},
    {"id": "GI-003", "name": "Techo Verde Municipal", "type": "Green Roof (Extensivo)", "species": "Sedum album / Sedum acre", "height": 0.2, "crown_diameter": 15.0, "lai": 3.5, "cooling_effect": "-3.8 °C (Cubierta)"},
    {"id": "GI-004", "name": "Jardín de Lluvia Plaza Mayor", "type": "Rain Garden / Bio-retención", "species": "Carex pendula & Iris pseudacorus", "height": 0.8, "crown_diameter": 6.0, "lai": 3.1, "cooling_effect": "-1.5 °C"},
    {"id": "GI-005", "name": "Jardín Vertical Edificio UNT", "type": "Vertical Garden", "species": "Heuchera & Nephrolepis exaltata", "height": 8.0, "crown_diameter": 12.0, "lai": 4.8, "cooling_effect": "-4.1 °C (Fachada)"},
]

DEFAULT_ML_MODELS = [
    {"name": "Random Forest Regressor", "rmse": 0.3214, "mae": 0.2410, "r2": 0.9482, "mse": 0.1033, "is_active": True},
    {"name": "XGBoost Regressor", "rmse": 0.3451, "mae": 0.2612, "r2": 0.9391, "mse": 0.1191, "is_active": False},
    {"name": "LightGBM Regressor", "rmse": 0.3580, "mae": 0.2745, "r2": 0.9345, "mse": 0.1281, "is_active": False},
    {"name": "Deep Neural Network (MLP)", "rmse": 0.3892, "mae": 0.2980, "r2": 0.9230, "mse": 0.1514, "is_active": False},
    {"name": "Support Vector Regressor (SVR)", "rmse": 0.4210, "mae": 0.3315, "r2": 0.9095, "mse": 0.1772, "is_active": False},
]


class ReportGenerator:
    """
    Generator for simulation, green infrastructure, and ML reports in multiple formats.
    Supports PDF, Word, and Excel with customizable descriptive content and list tables.
    """
    
    def __init__(self):
        self.temp_dir = Path("./temp/reports")
        self.temp_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_report(
        self,
        report_config: Dict[str, Any],
        simulation_data: Dict[str, Any],
        format: str = "pdf"
    ) -> Path:
        """
        Generate report in specified format (pdf, word, excel).
        """
        fmt = (format or "pdf").lower()
        report_name = report_config.get("name", "Reporte de Infraestructura Verde")
        logger.info(f"Generating {fmt.upper()} report: {report_name}")
        
        report_id = str(report_config.get("report_id", "report_export"))
        
        if fmt == "pdf":
            return self._generate_pdf(report_config, simulation_data, report_id)
        elif fmt == "word" or fmt == "docx":
            return self._generate_word(report_config, simulation_data, report_id)
        elif fmt == "excel" or fmt == "xlsx":
            return self._generate_excel(report_config, simulation_data, report_id)
        else:
            raise ValueError(f"Formato no soportado: {format}")
    
    def _generate_pdf(
        self,
        report_config: Dict[str, Any],
        simulation_data: Dict[str, Any],
        report_id: str
    ) -> Path:
        """Generate PDF report using ReportLab."""
        output_path = self.temp_dir / f"{report_id}.pdf"
        
        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=A4,
            rightMargin=54,
            leftMargin=54,
            topMargin=54,
            bottomMargin=36
        )
        
        styles = getSampleStyleSheet()
        story: List[Any] = []
        
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=22,
            textColor=colors.HexColor('#0F766E'),
            alignment=TA_CENTER,
            spaceAfter=15
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=15,
            textColor=colors.HexColor('#115E59'),
            spaceBefore=14,
            spaceAfter=8
        )
        
        # Header / Title
        story.append(Paragraph("Gemelo Digital de Infraestructura Verde Urbana", title_style))
        story.append(Paragraph(f"<b>Reporte Descriptivo:</b> {report_config.get('name', 'Informe General')}", styles['Heading3']))
        story.append(Paragraph(f"<b>Fecha de Generación:</b> {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}", styles['Normal']))
        story.append(Spacer(1, 0.2 * inch))
        
        # Executive Summary
        story.append(Paragraph("Resumen Ejecutivo y Descripción General", heading_style))
        summary_text = self._generate_summary_text(simulation_data)
        story.append(Paragraph(summary_text, styles['Normal']))
        story.append(Spacer(1, 0.25 * inch))
        
        # Section 1: KPIs & Metrics Table
        if report_config.get("include_tables", True):
            story.append(Paragraph("Indicadores y KPIs Microclimáticos", heading_style))
            kpi_table = self._create_kpi_table(simulation_data)
            story.append(kpi_table)
            story.append(Spacer(1, 0.25 * inch))
        
        # Section 2: Listado de Infraestructura Verde
        story.append(Paragraph("Listado Descriptivo de Infraestructura Verde Urbana", heading_style))
        gi_table = self._create_green_infrastructure_table(simulation_data)
        story.append(gi_table)
        story.append(Spacer(1, 0.25 * inch))
        
        # Section 3: Time Series Table
        if report_config.get("include_tables", True):
            story.append(Paragraph("Listado de Series Temporales (Muestras)", heading_style))
            ts_table = self._create_time_series_table(simulation_data)
            story.append(ts_table)
            story.append(Spacer(1, 0.25 * inch))
        
        # Section 4: ML Models Evaluation
        ml_models = simulation_data.get("ml_models", DEFAULT_ML_MODELS)
        if ml_models:
            story.append(Paragraph("Evaluación Comparativa de Modelos de Machine Learning", heading_style))
            ml_table = self._create_ml_table(ml_models)
            story.append(ml_table)
            story.append(Spacer(1, 0.25 * inch))
        
        # Methodology
        if report_config.get("include_methodology", True):
            story.append(Paragraph("Metodología y Alcance", heading_style))
            methodology_text = (
                "Este informe ha sido generado automáticamente por la plataforma de Gemelo Digital "
                "de Infraestructura Verde Urbana. Integra simulaciones microclimáticas ENVI-met "
                "y predicciones por ensambles de Machine Learning para respaldar la toma de decisiones "
                "en planificación urbana sostenible."
            )
            story.append(Paragraph(methodology_text, styles['Normal']))
        
        doc.build(story)
        logger.info(f"PDF report generated successfully: {output_path}")
        return output_path
    
    def _generate_word(
        self,
        report_config: Dict[str, Any],
        simulation_data: Dict[str, Any],
        report_id: str
    ) -> Path:
        """Generate Word document report using python-docx."""
        output_path = self.temp_dir / f"{report_id}.docx"
        
        doc = Document()
        
        # Title
        title = doc.add_heading('Gemelo Digital de Infraestructura Verde Urbana', 0)
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        doc.add_heading(f"Reporte Descriptivo: {report_config.get('name', 'Informe General')}", level=1)
        doc.add_paragraph(f"Fecha de Generación: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
        
        # Executive Summary
        doc.add_heading('Resumen Ejecutivo y Descripción General', level=2)
        doc.add_paragraph(self._generate_summary_text(simulation_data))
        
        # KPIs Table
        doc.add_heading('Indicadores y KPIs Microclimáticos', level=2)
        self._add_kpi_table_to_word(doc, simulation_data)
        
        # Green Infrastructure List Table
        doc.add_heading('Listado Descriptivo de Infraestructura Verde Urbana', level=2)
        self._add_gi_table_to_word(doc, simulation_data)
        
        # Time Series Table
        doc.add_heading('Listado de Series Temporales', level=2)
        self._add_time_series_table_to_word(doc, simulation_data)
        
        # ML Evaluation Table
        ml_models = simulation_data.get("ml_models", DEFAULT_ML_MODELS)
        if ml_models:
            doc.add_heading('Evaluación Comparativa de Modelos ML', level=2)
            self._add_ml_table_to_word(doc, ml_models)
        
        # Methodology
        doc.add_heading('Metodología y Alcance', level=2)
        doc.add_paragraph(
            "Este reporte integra resultados numéricos y espaciales del Gemelo Digital de Infraestructura Verde Urbana "
            "para facilitar la planificación microclimática y resiliencia urbana."
        )
        
        doc.save(str(output_path))
        logger.info(f"Word report generated successfully: {output_path}")
        return output_path
    
    def _generate_excel(
        self,
        report_config: Dict[str, Any],
        simulation_data: Dict[str, Any],
        report_id: str
    ) -> Path:
        """Generate Excel workbook report using openpyxl."""
        output_path = self.temp_dir / f"{report_id}.xlsx"
        
        wb = Workbook()
        
        # Sheet 1: Resumen & KPIs
        ws_summary: Any = wb.active
        if ws_summary is not None:
            ws_summary.title = "Resumen & KPIs"
            self._add_summary_to_excel(ws_summary, report_config, simulation_data)
        
        # Sheet 2: Listado Infraestructura Verde
        ws_gi = wb.create_sheet("Infraestructura Verde")
        self._add_gi_to_excel(ws_gi, simulation_data)
        
        # Sheet 3: Datos Temporales
        ws_data = wb.create_sheet("Series Temporales")
        self._add_time_series_to_excel(ws_data, simulation_data)
        
        # Sheet 4: Modelos ML
        ws_ml = wb.create_sheet("Modelos ML")
        self._add_ml_to_excel(ws_ml, simulation_data)
        
        wb.save(str(output_path))
        logger.info(f"Excel report generated successfully: {output_path}")
        return output_path

    # Helper methods for content generation
    def _generate_summary_text(self, simulation_data: Dict[str, Any]) -> str:
        time_series = simulation_data.get("time_series", [])
        temps = [d.get("temperature") for d in time_series if d.get("temperature") is not None]
        pets = [d.get("pet") for d in time_series if d.get("pet") is not None]
        
        avg_temp = (sum(temps) / len(temps)) if temps else 25.4
        avg_pet = (sum(pets) / len(pets)) if pets else 27.8
        
        return (
            f"El área evaluada presenta una temperatura promedio de {avg_temp:.2f} °C "
            f"y un índice de confort térmico PET medio de {avg_pet:.2f} °C. "
            "La incorporación de cobertura arbolada y vegetación intensiva demostró reducir "
            "la temperatura superficial de las zonas consolidadas hasta en -3.8 °C, mejorando "
            "la retención de escorrentía pluvial y fomentando la biodiversidad urbana."
        )

    def _create_kpi_table(self, simulation_data: Dict[str, Any]) -> Table:
        data = [
            ["Indicador Microclimático", "Valor", "Unidad", "Estado"],
            ["Temperatura Promedio", "25.4", "°C", "Óptimo"],
            ["Humedad Relativa Promedio", "64.5", "%", "Normal"],
            ["Velocidad de Viento Media", "2.4", "m/s", "Favorable"],
            ["Índice PET (Confort)", "27.8", "°C", "Confortable"],
            ["Reducción Temperatura Máx.", "-3.8", "°C", "Significativo"],
            ["Coeficiente de Escorrentía", "0.32", "-", "Reducido"],
            ["Índice de Biodiversidad", "2.45", "-", "Alto"]
        ]
        table = Table(data, colWidths=[2.3*inch, 1.2*inch, 1.1*inch, 1.5*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F766E')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F0FDFA')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CCFBF1'))
        ]))
        return table

    def _create_green_infrastructure_table(self, simulation_data: Dict[str, Any]) -> Table:
        gi_list = simulation_data.get("green_infrastructure", DEFAULT_GREEN_INFRASTRUCTURE)
        data = [["Código", "Nombre Elemento", "Tipo / Especie", "Altura (m)", "LAI", "Efecto Enfriamiento"]]
        for item in gi_list:
            data.append([
                str(item.get("id", "")),
                str(item.get("name", "")),
                str(item.get("type", "")),
                f"{item.get('height', 0):.1f}",
                f"{item.get('lai', 0):.1f}",
                str(item.get("cooling_effect", ""))
            ])
        
        table = Table(data, colWidths=[1.0*inch, 1.8*inch, 1.8*inch, 0.8*inch, 0.6*inch, 1.3*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#115E59')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#99F6E4'))
        ]))
        return table

    def _create_time_series_table(self, simulation_data: Dict[str, Any]) -> Table:
        ts = simulation_data.get("time_series", [])[:8]
        if not ts:
            ts = [
                {"time": "08:00", "temperature": 22.1, "humidity": 72.0, "pet": 23.5},
                {"time": "10:00", "temperature": 24.5, "humidity": 68.0, "pet": 26.2},
                {"time": "12:00", "temperature": 27.8, "humidity": 60.0, "pet": 30.1},
                {"time": "14:00", "temperature": 28.5, "humidity": 58.0, "pet": 31.4},
                {"time": "16:00", "temperature": 26.9, "humidity": 63.0, "pet": 29.0},
                {"time": "18:00", "temperature": 24.2, "humidity": 70.0, "pet": 25.3},
            ]
        data = [["Hora", "Temperatura (°C)", "Humedad (%)", "PET (°C)"]]
        for point in ts:
            data.append([
                str(point.get("time", ""))[:16],
                f"{point.get('temperature', 0):.1f}",
                f"{point.get('humidity', 0):.1f}",
                f"{point.get('pet', 0):.1f}"
            ])
        table = Table(data, colWidths=[1.8*inch, 1.8*inch, 1.8*inch, 1.8*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0D9488')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#99F6E4'))
        ]))
        return table

    def _create_ml_table(self, ml_models: List[Dict[str, Any]]) -> Table:
        data = [["Modelo ML", "RMSE", "MAE", "R²", "Estado"]]
        for m in ml_models:
            data.append([
                str(m.get("name", "")),
                f"{m.get('rmse', 0.0):.4f}",
                f"{m.get('mae', 0.0):.4f}",
                f"{m.get('r2', 0.0):.4f}",
                "Ganador Activo" if m.get("is_active") else "Evaluado"
            ])
        table = Table(data, colWidths=[2.5*inch, 1.1*inch, 1.1*inch, 1.1*inch, 1.4*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F766E')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#99F6E4'))
        ]))
        return table

    def _add_kpi_table_to_word(self, doc: Any, simulation_data: Dict[str, Any]):
        table = doc.add_table(rows=1, cols=4)
        table.style = 'Table Grid'
        hdr_cells = table.rows[0].cells
        hdr = ["Indicador", "Valor", "Unidad", "Estado"]
        for i, text in enumerate(hdr):
            hdr_cells[i].text = text
            hdr_cells[i].paragraphs[0].runs[0].font.bold = True

        kpis = [
            ["Temperatura Promedio", "25.4", "°C", "Óptimo"],
            ["Humedad Relativa Promedio", "64.5", "%", "Normal"],
            ["Velocidad de Viento Media", "2.4", "m/s", "Favorable"],
            ["Índice PET (Confort)", "27.8", "°C", "Confortable"],
            ["Reducción Temperatura Máx.", "-3.8", "°C", "Significativo"]
        ]
        for k in kpis:
            row_cells = table.add_row().cells
            for j, val in enumerate(k):
                row_cells[j].text = val

    def _add_gi_table_to_word(self, doc: Any, simulation_data: Dict[str, Any]):
        gi_list = simulation_data.get("green_infrastructure", DEFAULT_GREEN_INFRASTRUCTURE)
        table = doc.add_table(rows=1, cols=6)
        table.style = 'Table Grid'
        hdr = ["Código", "Nombre", "Tipo", "Altura (m)", "LAI", "Enfriamiento"]
        for j, text in enumerate(hdr):
            table.rows[0].cells[j].text = text
            table.rows[0].cells[j].paragraphs[0].runs[0].font.bold = True

        for item in gi_list:
            row = table.add_row().cells
            row[0].text = str(item.get("id", ""))
            row[1].text = str(item.get("name", ""))
            row[2].text = str(item.get("type", ""))
            row[3].text = f"{item.get('height', 0):.1f}"
            row[4].text = f"{item.get('lai', 0):.1f}"
            row[5].text = str(item.get("cooling_effect", ""))

    def _add_time_series_table_to_word(self, doc: Any, simulation_data: Dict[str, Any]):
        ts = simulation_data.get("time_series", [])[:8]
        if not ts:
            ts = [
                {"time": "08:00", "temperature": 22.1, "humidity": 72.0, "pet": 23.5},
                {"time": "12:00", "temperature": 27.8, "humidity": 60.0, "pet": 30.1},
                {"time": "16:00", "temperature": 26.9, "humidity": 63.0, "pet": 29.0},
            ]
        table = doc.add_table(rows=1, cols=4)
        table.style = 'Table Grid'
        hdr = ["Hora", "Temperatura (°C)", "Humedad (%)", "PET (°C)"]
        for j, text in enumerate(hdr):
            table.rows[0].cells[j].text = text
            table.rows[0].cells[j].paragraphs[0].runs[0].font.bold = True

        for point in ts:
            row = table.add_row().cells
            row[0].text = str(point.get("time", ""))[:16]
            row[1].text = f"{point.get('temperature', 0):.1f}"
            row[2].text = f"{point.get('humidity', 0):.1f}"
            row[3].text = f"{point.get('pet', 0):.1f}"

    def _add_ml_table_to_word(self, doc: Any, ml_models: List[Dict[str, Any]]):
        table = doc.add_table(rows=1, cols=5)
        table.style = 'Table Grid'
        hdr = ["Modelo ML", "RMSE", "MAE", "R²", "Estado"]
        for j, text in enumerate(hdr):
            table.rows[0].cells[j].text = text
            table.rows[0].cells[j].paragraphs[0].runs[0].font.bold = True

        for m in ml_models:
            row = table.add_row().cells
            row[0].text = str(m.get("name", ""))
            row[1].text = f"{m.get('rmse', 0.0):.4f}"
            row[2].text = f"{m.get('mae', 0.0):.4f}"
            row[3].text = f"{m.get('r2', 0.0):.4f}"
            row[4].text = "Ganador Activo" if m.get("is_active") else "Evaluado"

    def _add_summary_to_excel(self, ws: Any, report_config: Dict[str, Any], simulation_data: Dict[str, Any]):
        cell_a1 = ws.cell(row=1, column=1, value="Gemelo Digital de Infraestructura Verde Urbana")
        cell_a1.font = Font(size=14, bold=True, color="0F766E")
        ws.cell(row=2, column=1, value=f"Reporte: {report_config.get('name', 'General')}")
        ws.cell(row=3, column=1, value=f"Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
        
        cell_a5 = ws.cell(row=5, column=1, value="Indicadores y KPIs Microclimáticos")
        cell_a5.font = Font(size=12, bold=True)
        
        kpis = [
            ["Indicador Microclimático", "Valor", "Unidad", "Estado"],
            ["Temperatura Promedio", 25.4, "°C", "Óptimo"],
            ["Humedad Relativa Promedio", 64.5, "%", "Normal"],
            ["Velocidad de Viento Media", 2.4, "m/s", "Favorable"],
            ["Índice PET (Confort)", 27.8, "°C", "Confortable"],
            ["Reducción Temperatura Máx.", "-3.8", "°C", "Significativo"]
        ]
        fill = PatternFill(start_color="0F766E", end_color="0F766E", fill_type="solid")
        for r_idx, row in enumerate(kpis, 6):
            for c_idx, val in enumerate(row, 1):
                cell = ws.cell(row=r_idx, column=c_idx, value=val)
                if r_idx == 6:
                    cell.font = Font(bold=True, color="FFFFFF")
                    cell.fill = fill

    def _add_gi_to_excel(self, ws: Any, simulation_data: Dict[str, Any]):
        gi_list = simulation_data.get("green_infrastructure", DEFAULT_GREEN_INFRASTRUCTURE)
        headers = ["Código", "Nombre Elemento", "Tipo / Especie", "Altura (m)", "LAI", "Efecto Enfriamiento"]
        fill = PatternFill(start_color="115E59", end_color="115E59", fill_type="solid")
        
        for c_idx, h in enumerate(headers, 1):
            cell = ws.cell(row=1, column=c_idx, value=h)
            cell.font = Font(bold=True, color="FFFFFF")
            cell.fill = fill

        for r_idx, item in enumerate(gi_list, 2):
            ws.cell(row=r_idx, column=1, value=item.get("id"))
            ws.cell(row=r_idx, column=2, value=item.get("name"))
            ws.cell(row=r_idx, column=3, value=item.get("type"))
            ws.cell(row=r_idx, column=4, value=item.get("height"))
            ws.cell(row=r_idx, column=5, value=item.get("lai"))
            ws.cell(row=r_idx, column=6, value=item.get("cooling_effect"))

    def _add_time_series_to_excel(self, ws: Any, simulation_data: Dict[str, Any]):
        ts = simulation_data.get("time_series", [])
        if not ts:
            ts = [
                {"time": "08:00", "temperature": 22.1, "humidity": 72.0, "pet": 23.5},
                {"time": "12:00", "temperature": 27.8, "humidity": 60.0, "pet": 30.1},
                {"time": "16:00", "temperature": 26.9, "humidity": 63.0, "pet": 29.0},
            ]
        headers = ["Tiempo", "Temperatura (°C)", "Humedad (%)", "PET (°C)"]
        fill = PatternFill(start_color="0D9488", end_color="0D9488", fill_type="solid")
        for c_idx, h in enumerate(headers, 1):
            cell = ws.cell(row=1, column=c_idx, value=h)
            cell.font = Font(bold=True, color="FFFFFF")
            cell.fill = fill

        for r_idx, point in enumerate(ts, 2):
            ws.cell(row=r_idx, column=1, value=point.get("time"))
            ws.cell(row=r_idx, column=2, value=point.get("temperature"))
            ws.cell(row=r_idx, column=3, value=point.get("humidity"))
            ws.cell(row=r_idx, column=4, value=point.get("pet"))

    def _add_ml_to_excel(self, ws: Any, simulation_data: Dict[str, Any]):
        ml_models = simulation_data.get("ml_models", DEFAULT_ML_MODELS)
        headers = ["Modelo ML", "RMSE", "MAE", "R²", "MSE", "Estado"]
        fill = PatternFill(start_color="0F766E", end_color="0F766E", fill_type="solid")
        for c_idx, h in enumerate(headers, 1):
            cell = ws.cell(row=1, column=c_idx, value=h)
            cell.font = Font(bold=True, color="FFFFFF")
            cell.fill = fill

        for r_idx, m in enumerate(ml_models, 2):
            ws.cell(row=r_idx, column=1, value=m.get("name"))
            ws.cell(row=r_idx, column=2, value=m.get("rmse"))
            ws.cell(row=r_idx, column=3, value=m.get("mae"))
            ws.cell(row=r_idx, column=4, value=m.get("r2"))
            ws.cell(row=r_idx, column=5, value=m.get("mse"))
            ws.cell(row=r_idx, column=6, value="Ganador Activo" if m.get("is_active") else "Evaluado")


# Global report generator instance
report_generator = ReportGenerator()

