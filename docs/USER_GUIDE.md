# User Guide

## Gemelo Digital de Infraestructura Verde Urbana

Welcome to the Gemelo Digital user guide. This document will help you get started with the platform.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating a Project](#creating-a-project)
3. [Setting Up Scenarios](#setting-up-scenarios)
4. [Running Simulations](#running-simulations)
5. [Analyzing Results](#analyzing-results)
6. [Generating Reports](#generating-reports)
7. [Dashboard Features](#dashboard-features)

## Getting Started

### Registration

1. Navigate to the registration page
2. Fill in your email, password, full name, and institution
3. Click "Registrarse" to create your account
4. Check your email for verification (if required)

### Login

1. Go to the login page
2. Enter your email and password
3. Click "Iniciar Sesión"

### First Steps

After logging in, you'll be directed to the dashboard. Here you can:
- View your existing projects
- Create new projects
- Access simulation results
- Generate reports

## Creating a Project

### Step 1: Create Project

1. Click "New Project" button
2. Fill in the project details:
   - **Name**: Descriptive name for your study
   - **Description**: Brief description of the project
   - **Location**: Geographic location name
3. Define the study area by:
   - Drawing on the map
   - Uploading a GeoJSON file
   - Entering coordinates manually
4. Click "Create Project"

### Step 2: Upload Data (Optional)

You can upload spatial data for your project:
- **GeoJSON**: Urban boundaries, green infrastructure locations
- **Shapefile**: Detailed spatial data
- **CSV**: Tabular data with coordinates

Supported file formats:
- GeoJSON (.geojson, .json)
- Shapefile (.shp, .shx, .dbf, .prj)
- CSV with coordinates

## Setting Up Scenarios

### What is a Scenario?

A scenario represents a specific configuration of urban green infrastructure and environmental conditions. You can create multiple scenarios to compare different interventions.

### Creating a Scenario

1. Select your project
2. Click "Add Scenario"
3. Configure the scenario parameters:

#### Vegetation Configuration
- **Type**: Tree, shrub, grass, green roof, vertical garden, rain garden
- **Species**: Plant species name
- **Height**: Vegetation height in meters
- **Crown Diameter**: Tree crown diameter in meters
- **Leaf Area Index (LAI)**: Vegetation density

#### Surfaces Configuration
- **Material**: Asphalt, concrete, grass, soil, water
- **Albedo**: Surface reflectivity (0-1)
- **Emissivity**: Thermal emissivity (0-1)
- **Permeability**: Water permeability (0-1)

#### Buildings Configuration
- **Height**: Building height in meters
- **Footprint**: Building footprint area
- **Material**: Building material type
- **Green Roof**: Whether building has green roof

#### Climate Data
- **Temperature**: Air temperature (°C)
- **Humidity**: Relative humidity (%)
- **Wind Speed**: Wind speed (m/s)
- **Wind Direction**: Wind direction (degrees)
- **Solar Radiation**: Solar radiation (W/m²)

4. Save the scenario

### Example Scenarios

**Baseline Scenario**: Current state without interventions
**Green Roof Scenario**: Add green roofs to 50% of buildings
**Urban Forest Scenario**: Increase tree coverage by 30%
**Permeable Surfaces**: Replace 40% of impervious surfaces with permeable materials

## Running Simulations

### Starting a Simulation

1. Select a scenario from your project
2. Click "Run Simulation"
3. Configure simulation parameters:
   - **Duration**: Simulation duration in hours (typically 24-48 hours)
   - **Time Step**: Output interval (default: 1 hour)
4. Click "Start Simulation"

### Monitoring Progress

The simulation status page shows:
- **Status**: Pending, Running, Completed, Failed, Cancelled
- **Progress**: Percentage complete
- **Estimated Time**: Time remaining
- **Log**: Real-time simulation log

### Simulation Duration

Typical simulation times:
- Small area (< 1 km²): 10-30 minutes
- Medium area (1-10 km²): 30-120 minutes
- Large area (> 10 km²): 2-6 hours

### Canceling a Simulation

You can cancel a running simulation at any time by clicking "Cancel".

## Analyzing Results

### Dashboard Overview

The dashboard provides multiple visualization tools:

#### KPI Panel
Key performance indicators:
- **PET (Physiological Equivalent Temperature)**: Thermal comfort index
- **Green Area**: Total green infrastructure area in hectares
- **Runoff Coefficient**: Water runoff coefficient
- **Temperature Reduction**: Cooling effect of green infrastructure
- **Biodiversity Index**: Estimated biodiversity impact

#### Interactive Map
- Spatial visualization of simulation results
- Heatmaps for temperature, humidity, PET
- Layer controls for different variables
- Time slider to view changes over time

#### Time Series Charts
- Temperature over time
- Humidity trends
- Wind patterns
- PET variations

#### Comparison View
- Compare multiple scenarios side-by-side
- Difference maps
- Statistical comparisons

### Data Export

Export results in various formats:
- **CSV**: Tabular data for analysis
- **GeoJSON**: Spatial data for GIS
- **NetCDF**: Scientific data format
- **JSON**: Raw data format

## Generating Reports

### Report Types

The platform supports three report formats:

#### PDF Report
- Professional document format
- Includes charts, maps, and tables
- Suitable for printing and sharing

#### Word Report
- Editable document format
- Customizable templates
- Easy to modify and extend

#### Excel Report
- Spreadsheet format
- Raw data and calculations
- Suitable for further analysis

### Creating a Report

1. Select a completed simulation
2. Click "Generate Report"
3. Configure report options:
   - **Format**: PDF, Word, or Excel
   - **Sections to include**:
     - Executive Summary
     - Methodology
     - Results Tables
     - Charts and Graphs
     - Maps
   - **Data Selection**:
     - Variables to include
     - Time range
     - Spatial extent
   - **Comparison**: Select another scenario for comparison
4. Click "Generate"

### Report Contents

#### Executive Summary
- Overview of simulation objectives
- Key findings
- Recommendations

#### Methodology
- Simulation parameters
- Input data description
- Model assumptions

#### Results
- Statistical summary
- Time series data
- Spatial analysis
- Scenario comparison

#### Visualizations
- Temperature maps
- Heatmaps
- Time series charts
- Comparison graphs

### Downloading Reports

Once generated, reports can be downloaded from the Reports section. Reports are stored for 30 days.

## Dashboard Features

### Scenario Selector
- Quickly switch between scenarios
- Compare multiple scenarios
- Filter by project or date

### Real-time Updates
- Live simulation progress
- Auto-refreshing data
- WebSocket notifications

### Custom Views
- Save custom dashboard layouts
- Create favorite views
- Share views with team members

### Data Filters
- Filter by time range
- Filter by variable
- Filter by spatial extent

### Export Options
- Export current view as image
- Export data as CSV
- Export map as GeoJSON

## Tips and Best Practices

### Simulation Setup
- Start with a baseline scenario for comparison
- Use realistic vegetation parameters
- Validate input data before simulation
- Test with shorter durations first

### Performance
- Large simulations may take considerable time
- Run simulations during off-peak hours
- Monitor system resources
- Use appropriate time steps

### Data Management
- Regularly export important results
- Clean up old simulations
- Organize projects with clear naming
- Document scenario configurations

### Collaboration
- Share projects with team members
- Use descriptive scenario names
- Add notes to simulations
- Generate reports for stakeholders

## Troubleshooting

### Simulation Fails
- Check input data validity
- Verify file formats
- Review error logs
- Contact support if issue persists

### Map Not Loading
- Check internet connection
- Clear browser cache
- Disable ad blockers
- Try different browser

### Report Generation Fails
- Ensure simulation is complete
- Check available disk space
- Verify selected data exists
- Try with fewer variables

## Support

For additional help:
- Email: support@gemelodigital.com
- Documentation: [docs.gemelodigital.com](http://docs.gemelodigital.com)
- Issue Tracker: [github.com/gemelodigital/issues](http://github.com/gemelodigital/issues)

## Glossary

- **PET**: Physiological Equivalent Temperature - thermal comfort index
- **LAI**: Leaf Area Index - measure of vegetation density
- **Albedo**: Surface reflectivity - how much sunlight is reflected
- **Runoff Coefficient**: Fraction of rainfall that becomes surface runoff
- **ENVI-met**: Microclimate simulation software
- **GeoJSON**: Format for encoding geographic data structures
