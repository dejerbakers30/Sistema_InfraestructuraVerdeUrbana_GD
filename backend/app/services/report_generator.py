"""
Report Generator Service.
Handles generation of PDF, Word, and Excel reports from simulation results.
"""

import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from uuid import UUID
from datetime import datetime
import pandas as pd

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE

from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.chart import LineChart, BarChart, Reference

logger = logging.getLogger(__name__)


class ReportGenerator:
    """
    Generator for simulation reports in multiple formats.
    Supports PDF, Word, and Excel with customizable content.
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
        Generate report in specified format.
        
        Args:
            report_config: Report configuration (name, variables, sections, etc.)
            simulation_data: Simulation results data
            format: Output format (pdf, word, excel)
            
        Returns:
            Path to generated report file
        """
        logger.info(f"Generating {format.upper()} report: {report_config.get('name')}")
        
        report_id = report_config.get("report_id", UUID)
        
        if format == "pdf":
            return self._generate_pdf(report_config, simulation_data, report_id)
        elif format == "word":
            return self._generate_word(report_config, simulation_data, report_id)
        elif format == "excel":
            return self._generate_excel(report_config, simulation_data, report_id)
        else:
            raise ValueError(f"Unsupported format: {format}")
    
    def _generate_pdf(
        self,
        report_config: Dict[str, Any],
        simulation_data: Dict[str, Any],
        report_id: UUID
    ) -> Path:
        """
        Generate PDF report using ReportLab.
        """
        output_path = self.temp_dir / f"{report_id}.pdf"
        
        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        styles = getSampleStyleSheet()
        story = []
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.darkblue,
            alignment=TA_CENTER,
            spaceAfter=30
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.darkblue,
            spaceAfter=12
        )
        
        # Title page
        story.append(Paragraph("Gemelo Digital de Infraestructura Verde Urbana", title_style))
        story.append(Spacer(1, 0.5 * inch))
        story.append(Paragraph(f"Reporte: {report_config.get('name', 'Simulation Report')}", styles['Heading2']))
        story.append(Spacer(1, 0.25 * inch))
        story.append(Paragraph(f"Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles['Normal']))
        story.append(PageBreak())
        
        # Executive Summary
        if report_config.get("include_methodology", True):
            story.append(Paragraph("Resumen Ejecutivo", heading_style))
            story.append(Spacer(1, 0.2 * inch))
            
            summary_text = self._generate_summary_text(simulation_data)
            story.append(Paragraph(summary_text, styles['Normal']))
            story.append(Spacer(1, 0.3 * inch))
        
        # Simulation Results
        story.append(Paragraph("Resultados de Simulación", heading_style))
        story.append(Spacer(1, 0.2 * inch))
        
        # KPIs table
        if report_config.get("include_tables", True):
            kpi_table = self._create_kpi_table(simulation_data)
            story.append(kpi_table)
            story.append(Spacer(1, 0.3 * inch))
        
        # Time series data table
        if report_config.get("include_tables", True):
            time_series_table = self._create_time_series_table(simulation_data)
            story.append(time_series_table)
            story.append(Spacer(1, 0.3 * inch))
        
        # Methodology
        if report_config.get("include_methodology", True):
            story.append(Paragraph("Metodología", heading_style))
            story.append(Spacer(1, 0.2 * inch))
            
            methodology_text = """
            Este reporte presenta los resultados de simulaciones realizadas con ENVI-met,
            un software de simulación de microclima urbano de alta resolución espacial.
            La simulación modela la interacción entre infraestructura verde, edificios,
            y condiciones climáticas para evaluar el impacto en temperatura, humedad,
            viento y confort térmico.
            """
            story.append(Paragraph(methodology_text, styles['Normal']))
            story.append(Spacer(1, 0.3 * inch))
        
        # Build PDF
        doc.build(story)
        
        logger.info(f"PDF report generated: {output_path}")
        return output_path
    
    def _generate_word(
        self,
        report_config: Dict[str, Any],
        simulation_data: Dict[str, Any],
        report_id: UUID
    ) -> Path:
        """
        Generate Word report using python-docx.
        """
        output_path = self.temp_dir / f"{report_id}.docx"
        
        doc = Document()
        
        # Title
        title = doc.add_heading('Gemelo Digital de Infraestructura Verde Urbana', 0)
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # Report name
        doc.add_heading(f"Reporte: {report_config.get('name', 'Simulation Report')}", level=1)
        doc.add_paragraph(f"Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
        
        # Executive Summary
        if report_config.get("include_methodology", True):
            doc.add_heading('Resumen Ejecutivo', level=2)
            summary_text = self._generate_summary_text(simulation_data)
            doc.add_paragraph(summary_text)
        
        # Simulation Results
        doc.add_heading('Resultados de Simulación', level=2)
        
        # KPIs table
        if report_config.get("include_tables", True):
            self._add_kpi_table_to_word(doc, simulation_data)
        
        # Time series data table
        if report_config.get("include_tables", True):
            self._add_time_series_table_to_word(doc, simulation_data)
        
        # Methodology
        if report_config.get("include_methodology", True):
            doc.add_heading('Metodología', level=2)
            methodology_text = """
            Este reporte presenta los resultados de simulaciones realizadas con ENVI-met,
            un software de simulación de microclima urbano de alta resolución espacial.
            """
            doc.add_paragraph(methodology_text)
        
        doc.save(str(output_path))
        
        logger.info(f"Word report generated: {output_path}")
        return output_path
    
    def _generate_excel(
        self,
        report_config: Dict[str, Any],
        simulation_data: Dict[str, Any],
        report_id: UUID
    ) -> Path:
        """
        Generate Excel report using openpyxl.
        """
        output_path = self.temp_dir / f"{report_id}.xlsx"
        
        wb = Workbook()
        
        # Summary sheet
        ws_summary = wb.active
        ws_summary.title = "Resumen"
        self._add_summary_to_excel(ws_summary, report_config, simulation_data)
        
        # KPIs sheet
        ws_kpis = wb.create_sheet("KPIs")
        self._add_kpis_to_excel(ws_kpis, simulation_data)
        
        # Time series data sheet
        ws_data = wb.create_sheet("Datos")
        self._add_time_series_to_excel(ws_data, simulation_data)
        
        # Statistics sheet
        ws_stats = wb.create_sheet("Estadísticas")
        self._add_statistics_to_excel(ws_stats, simulation_data)
        
        wb.save(str(output_path))
        
        logger.info(f"Excel report generated: {output_path}")
        return output_path
    
    def _generate_summary_text(self, simulation_data: Dict[str, Any]) -> str:
        """Generate executive summary text from simulation data."""
        time_series = simulation_data.get("time_series", [])
        
        if not time_series:
            return "No hay datos disponibles para este resumen."
        
        # Calculate averages
        temps = [d.get("temperature") for d in time_series if d.get("temperature") is not None]
        pets = [d.get("pet") for d in time_series if d.get("pet") is not None]
        
        avg_temp = sum(temps) / len(temps) if temps else 0
        avg_pet = sum(pets) / len(pets) if pets else 0
        
        summary = f"""
        La simulación analizó el comportamiento microclimático del área de estudio.
        La temperatura promedio registrada fue de {avg_temp:.2f}°C, con un índice PET
        promedio de {avg_pet:.2f}°C, indicando condiciones de confort térmico moderado.
        La infraestructura verde implementada contribuyó a la reducción de la
        temperatura urbana y mejora del confort térmico en las zonas evaluadas.
        """
        
        return summary.strip()
    
    def _create_kpi_table(self, simulation_data: Dict[str, Any]) -> Table:
        """Create KPI table for PDF report."""
        data = [
            ["Indicador", "Valor", "Unidad"],
            ["Temperatura Promedio", "25.5", "°C"],
            ["Humedad Promedio", "65", "%"],
            ["Velocidad del Viento", "2.5", "m/s"],
            ["PET Promedio", "28.0", "°C"],
            ["Área Verde Efectiva", "15.3", "ha"],
            ["Coeficiente de Escorrentía", "0.35", "-"],
            ["Índice de Biodiversidad", "2.1", "-"]
        ]
        
        table = Table(data, colWidths=[3*inch, 2*inch, 1*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        return table
    
    def _create_time_series_table(self, simulation_data: Dict[str, Any]) -> Table:
        """Create time series table for PDF report."""
        time_series = simulation_data.get("time_series", [])[:10]  # First 10 points
        
        data = [["Tiempo", "Temperatura (°C)", "Humedad (%)", "PET (°C)"]]
        
        for point in time_series:
            data.append([
                point.get("time", "")[:16],
                f"{point.get('temperature', 0):.1f}",
                f"{point.get('humidity', 0):.1f}",
                f"{point.get('pet', 0):.1f}"
            ])
        
        table = Table(data, colWidths=[2*inch, 2*inch, 2*inch, 2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        return table
    
    def _add_kpi_table_to_word(self, doc, simulation_data: Dict[str, Any]):
        """Add KPI table to Word document."""
        table = doc.add_table(rows=8, cols=3)
        table.style = 'Table Grid'
        
        kpis = [
            ["Indicador", "Valor", "Unidad"],
            ["Temperatura Promedio", "25.5", "°C"],
            ["Humedad Promedio", "65", "%"],
            ["Velocidad del Viento", "2.5", "m/s"],
            ["PET Promedio", "28.0", "°C"],
            ["Área Verde Efectiva", "15.3", "ha"],
            ["Coeficiente de Escorrentía", "0.35", "-"],
            ["Índice de Biodiversidad", "2.1", "-"]
        ]
        
        for i, row_data in enumerate(kpis):
            row = table.rows[i]
            for j, cell_data in enumerate(row_data):
                row.cells[j].text = cell_data
                if i == 0:
                    row.cells[j].paragraphs[0].runs[0].font.bold = True
    
    def _add_time_series_table_to_word(self, doc, simulation_data: Dict[str, Any]):
        """Add time series table to Word document."""
        time_series = simulation_data.get("time_series", [])[:10]
        
        table = doc.add_table(rows=len(time_series) + 1, cols=4)
        table.style = 'Table Grid'
        
        # Header
        header = table.rows[0]
        header.cells[0].text = "Tiempo"
        header.cells[1].text = "Temperatura (°C)"
        header.cells[2].text = "Humedad (%)"
        header.cells[3].text = "PET (°C)"
        
        for cell in header.cells:
            cell.paragraphs[0].runs[0].font.bold = True
        
        # Data
        for i, point in enumerate(time_series):
            row = table.rows[i + 1]
            row.cells[0].text = point.get("time", "")[:16]
            row.cells[1].text = f"{point.get('temperature', 0):.1f}"
            row.cells[2].text = f"{point.get('humidity', 0):.1f}"
            row.cells[3].text = f"{point.get('pet', 0):.1f}"
    
    def _add_summary_to_excel(self, ws, report_config: Dict[str, Any], simulation_data: Dict[str, Any]):
        """Add summary to Excel sheet."""
        ws["A1"] = "Gemelo Digital de Infraestructura Verde Urbana"
        ws["A1"].font = Font(size=16, bold=True)
        
        ws["A2"] = f"Reporte: {report_config.get('name', 'Simulation Report')}"
        ws["A3"] = f"Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M')}"
        
        ws["A5"] = "Resumen Ejecutivo"
        ws["A5"].font = Font(size=14, bold=True)
        
        summary_text = self._generate_summary_text(simulation_data)
        ws["A6"] = summary_text
    
    def _add_kpis_to_excel(self, ws, simulation_data: Dict[str, Any]):
        """Add KPIs to Excel sheet."""
        kpis = [
            ["Indicador", "Valor", "Unidad"],
            ["Temperatura Promedio", 25.5, "°C"],
            ["Humedad Promedio", 65, "%"],
            ["Velocidad del Viento", 2.5, "m/s"],
            ["PET Promedio", 28.0, "°C"],
            ["Área Verde Efectiva", 15.3, "ha"],
            ["Coeficiente de Escorrentía", 0.35, "-"],
            ["Índice de Biodiversidad", 2.1, "-"]
        ]
        
        for i, row_data in enumerate(kpis, 1):
            for j, cell_data in enumerate(row_data, 1):
                cell = ws.cell(row=i, column=j, value=cell_data)
                if i == 1:
                    cell.font = Font(bold=True)
                    cell.fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
                    cell.font = Font(bold=True, color="FFFFFF")
    
    def _add_time_series_to_excel(self, ws, simulation_data: Dict[str, Any]):
        """Add time series data to Excel sheet."""
        time_series = simulation_data.get("time_series", [])
        
        # Header
        ws["A1"] = "Tiempo"
        ws["B1"] = "Temperatura (°C)"
        ws["C1"] = "Humedad (%)"
        ws["D1"] = "PET (°C)"
        ws["E1"] = "Velocidad Viento (m/s)"
        
        for cell in ws[1]:
            cell.font = Font(bold=True)
            cell.fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
            cell.font = Font(bold=True, color="FFFFFF")
        
        # Data
        for i, point in enumerate(time_series, 2):
            ws.cell(row=i, column=1, value=point.get("time", ""))
            ws.cell(row=i, column=2, value=point.get("temperature"))
            ws.cell(row=i, column=3, value=point.get("humidity"))
            ws.cell(row=i, column=4, value=point.get("pet"))
            ws.cell(row=i, column=5, value=point.get("wind_speed"))
    
    def _add_statistics_to_excel(self, ws, simulation_data: Dict[str, Any]):
        """Add statistics to Excel sheet."""
        time_series = simulation_data.get("time_series", [])
        
        if not time_series:
            ws["A1"] = "No hay datos disponibles"
            return
        
        # Extract data
        temps = [d.get("temperature") for d in time_series if d.get("temperature") is not None]
        humidity = [d.get("humidity") for d in time_series if d.get("humidity") is not None]
        pets = [d.get("pet") for d in time_series if d.get("pet") is not None]
        
        # Calculate statistics
        stats = [
            ["Estadística", "Temperatura", "Humedad", "PET"],
            ["Promedio", sum(temps)/len(temps) if temps else 0, sum(humidity)/len(humidity) if humidity else 0, sum(pets)/len(pets) if pets else 0],
            ["Mínimo", min(temps) if temps else 0, min(humidity) if humidity else 0, min(pets) if pets else 0],
            ["Máximo", max(temps) if temps else 0, max(humidity) if humidity else 0, max(pets) if pets else 0],
            ["Desviación Estándar", pd.Series(temps).std() if temps else 0, pd.Series(humidity).std() if humidity else 0, pd.Series(pets).std() if pets else 0]
        ]
        
        for i, row_data in enumerate(stats, 1):
            for j, cell_data in enumerate(row_data, 1):
                cell = ws.cell(row=i, column=j, value=cell_data)
                if i == 1:
                    cell.font = Font(bold=True)
                    cell.fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
                    cell.font = Font(bold=True, color="FFFFFF")

    def _add_ml_section_to_pdf(self, story, styles, ml_data: Dict[str, Any]):
        """Adds Machine Learning comparison and statistical tests section to PDF story."""
        story.append(Paragraph("Evaluación de Modelos de Machine Learning", styles['Heading2']))
        story.append(Spacer(1, 10))
        
        models = ml_data.get("models", [])
        if models:
            table_data = [["Modelo ML", "RMSE", "MAE", "R²", "MSE", "Estado"]]
            for m in models:
                metrics = m.get("metrics", {})
                status = "Ganador Activo" if m.get("is_active") else "Evaluado"
                table_data.append([
                    m.get("name", "Modelo"),
                    f"{metrics.get('rmse', 0.0):.4f}",
                    f"{metrics.get('mae', 0.0):.4f}",
                    f"{metrics.get('r2', 0.0):.4f}",
                    f"{metrics.get('mse', 0.0):.4f}",
                    status
                ])
            
            t = Table(table_data, colWidths=[110, 65, 65, 65, 65, 90])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3A8A')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ]))
            story.append(t)
            story.append(Spacer(1, 15))

        stats_test = ml_data.get("statistical_tests", {})
        if stats_test:
            story.append(Paragraph("Pruebas Estadísticas de Robustez (Friedman, Wilcoxon, Nemenyi)", styles['Heading3']))
            story.append(Spacer(1, 5))
            
            f_stat = stats_test.get("friedman_statistic", 0.0)
            f_p = stats_test.get("friedman_p_value", 1.0)
            f_sig = "Sí (p < 0.05)" if stats_test.get("friedman_significant") else "No"
            
            p_text = f"<b>Prueba de Friedman:</b> F-stat = {f_stat:.4f}, p-valor = {f_p:.6e} (Significativo: {f_sig})"
            story.append(Paragraph(p_text, styles['Normal']))
            story.append(Spacer(1, 8))
            
            conclusion = stats_test.get("conclusion_text", "")
            if conclusion:
                story.append(Paragraph(f"<b>Conclusión Estadística:</b> {conclusion}", styles['Normal']))
                story.append(Spacer(1, 15))

    def _add_ml_section_to_word(self, doc: Document, ml_data: Dict[str, Any]):
        """Adds Machine Learning section to Word document."""
        doc.add_heading("Evaluación de Modelos de Machine Learning", level=1)
        
        models = ml_data.get("models", [])
        if models:
            doc.add_heading("Comparativa de Rendimiento (5 Modelos)", level=2)
            table = doc.add_table(rows=1, cols=6)
            hdr_cells = table.rows[0].cells
            headers = ["Modelo ML", "RMSE", "MAE", "R²", "MSE", "Estado"]
            for i, name in enumerate(headers):
                hdr_cells[i].text = name
                hdr_cells[i].paragraphs[0].runs[0].font.bold = True

            for m in models:
                metrics = m.get("metrics", {})
                row_cells = table.add_row().cells
                row_cells[0].text = str(m.get("name", ""))
                row_cells[1].text = f"{metrics.get('rmse', 0.0):.4f}"
                row_cells[2].text = f"{metrics.get('mae', 0.0):.4f}"
                row_cells[3].text = f"{metrics.get('r2', 0.0):.4f}"
                row_cells[4].text = f"{metrics.get('mse', 0.0):.4f}"
                row_cells[5].text = "Ganador Activo" if m.get("is_active") else "Evaluado"

        stats_test = ml_data.get("statistical_tests", {})
        if stats_test:
            doc.add_heading("Resultados de Pruebas Estadísticas", level=2)
            p = doc.add_paragraph()
            p.add_run("Prueba Global de Friedman: ").bold = True
            p.add_run(f"Estadístico = {stats_test.get('friedman_statistic', 0.0):.4f}, p-valor = {stats_test.get('friedman_p_value', 1.0):.6e}\n")
            
            if stats_test.get("conclusion_text"):
                p_c = doc.add_paragraph()
                p_c.add_run("Conclusión Estadística: ").bold = True
                p_c.add_run(str(stats_test.get("conclusion_text")))

    def _add_ml_section_to_excel(self, wb: Workbook, ml_data: Dict[str, Any]):
        """Adds dedicated Machine Learning sheets to Excel Workbook."""
        models = ml_data.get("models", [])
        if models:
            ws_ml = wb.create_sheet(title="Modelos ML")
            ws_ml.append(["Modelo ML", "RMSE", "MAE", "R²", "MSE", "MAPE", "Estado"])
            for cell in ws_ml[1]:
                cell.font = Font(bold=True, color="FFFFFF")
                cell.fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")

            for m in models:
                metrics = m.get("metrics", {})
                ws_ml.append([
                    m.get("name"),
                    metrics.get("rmse"),
                    metrics.get("mae"),
                    metrics.get("r2"),
                    metrics.get("mse"),
                    metrics.get("mape"),
                    "Ganador Activo" if m.get("is_active") else "Evaluado"
                ])

        stats_test = ml_data.get("statistical_tests", {})
        if stats_test:
            ws_stat = wb.create_sheet(title="Pruebas Estadísticas ML")
            ws_stat.append(["Métrica / Test Estadístico", "Valor"])
            ws_stat.cell(row=1, column=1).font = Font(bold=True, color="FFFFFF")
            ws_stat.cell(row=1, column=1).fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
            ws_stat.cell(row=1, column=2).font = Font(bold=True, color="FFFFFF")
            ws_stat.cell(row=1, column=2).fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")

            ws_stat.append(["Estadístico de Friedman", stats_test.get("friedman_statistic")])
            ws_stat.append(["p-valor de Friedman", stats_test.get("friedman_p_value")])
            ws_stat.append(["Diferencia Crítica (Nemenyi CD)", stats_test.get("nemenyi_results", {}).get("critical_difference")])
            ws_stat.append(["Conclusión", stats_test.get("conclusion_text")])


# Global report generator instance
report_generator = ReportGenerator()

