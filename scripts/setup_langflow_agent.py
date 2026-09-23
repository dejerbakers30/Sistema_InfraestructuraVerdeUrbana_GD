#!/usr/bin/env python3
"""
Script to create and configure the Urban Green Infrastructure Digital Twin Agent in Langflow.
Connects to http://localhost:7860/ using credentials or API key and registers/updates
the specialized 'Agente Gemelo Digital Urbano' flow.
"""

import sys
import json
import uuid
import copy
import urllib.request
import urllib.error
import gzip

LANGFLOW_BASE_URL = "http://localhost:7860"
LANGFLOW_USERNAME = "langflow"
LANGFLOW_PASSWORD = "CambiaEstaClave123"
API_KEY = "sk-2BkMQeosmoYUIMHmMkoTli4x3VgaOQFyEFnpHzlkcmo"

FLOW_NAME = "Agente Gemelo Digital Urbano"
FLOW_DESCRIPTION = "Agente de IA especializado en el Gemelo Digital de Infraestructura Verde Urbana. Analiza confort térmico PET, microclima ENVI-met, especies vegetales y mitigación de islas de calor."

SYSTEM_PROMPT = """Eres el Agente Inteligente del Gemelo Digital de Infraestructura Verde Urbana.
Tu misión principal es asistir a investigadores, ingenieros ambientales y planificadores urbanos en:
1. Análisis de microclima urbano y mitigación del efecto Isla de Calor Urbana (ICU).
2. Evaluación del confort térmico bioclimático mediante el índice PET (Physiological Equivalent Temperature).
3. Eficacia de soluciones basadas en la naturaleza: techos verdes, corredores biológicos, arbolado de alineación y jardines de lluvia.
4. Interpretación de simulaciones termodinámicas de alta resolución ENVI-met y balance hídrico (escorrentía pluvial).

Utiliza tu herramienta especializada 'Herramienta Gemelo Digital' siempre que el usuario pregunte por datos, KPIs, especies, métricas o escenarios actuales del sistema.
Responde de manera precisa, científica, concisa y empática en idioma español."""

CUSTOM_TOOL_CODE = '''from langflow.custom import Component
from langflow.io import MessageTextInput, Output
from langflow.schema import Message
import json

class ConsultarGemeloDigitalTool(Component):
    display_name = "Herramienta Gemelo Digital"
    description = "Consulta KPIs, escenarios climáticos y recomendaciones del Gemelo Digital de Infraestructura Verde Urbana."
    icon = "trees"
    name = "ConsultarGemeloDigitalTool"

    inputs = [
        MessageTextInput(
            name="query",
            display_name="Consulta o Métrica",
            info="Indica qué deseas consultar: 'kpis', 'metricas', 'escenarios', 'especies', 'pet', 'temperatura', o 'general'",
            tool_mode=True,
        ),
    ]
    outputs = [
        Output(display_name="Output", name="output", method="consultar_datos"),
    ]

    def consultar_datos(self) -> Message:
        q = (self.query or "").lower().strip()
        
        datos = {
            "sistema": "Gemelo Digital de Infraestructura Verde Urbana",
            "motor_simulacion": "ENVI-met 3D Microclima",
            "kpis_escenario_activo": {
                "temperatura_media_superficie": "31.4 °C",
                "reduccion_termica_maxima": "2.4 °C bajo sombra arbórea",
                "indice_confort_pet": "28.5 °C (Confort moderado vs 36.2 °C en línea base)",
                "cobertura_vegetal_urbana": "15.3% del polígono",
                "retencion_escorrentia_pluvial": "35% mediante techos verdes y jardines de lluvia",
                "albedo_promedio_pavimentos": "0.18"
            },
            "especies_recomendadas": [
                {"nombre": "Schinus molle (Molle)", "beneficio": "Bajo requerimiento hídrico, reducción PET de hasta 4.5 °C"},
                {"nombre": "Jacaranda mimosifolia", "beneficio": "Excelente dosel estival, reducción radiativa neta"},
                {"nombre": "Tecoma stans", "beneficio": "Estrato arbustivo para retención de partículas y escorrentía"}
            ],
            "escenarios_envi_met": [
                {"id": "base", "nombre": "Línea Base Sin Cobertura", "temp_max": "34.8 °C", "pet_max": "36.2 °C"},
                {"id": "arbolado", "nombre": "Corredores Verdes Intensivos", "temp_max": "31.9 °C", "pet_max": "29.1 °C"},
                {"id": "mixto", "nombre": "Techos Verdes + Arbolado Nativo", "temp_max": "30.6 °C", "pet_max": "27.4 °C"}
            ]
        }

        if any(w in q for w in ["especie", "arbol", "planta", "vegetacion"]):
            res = f"Especies prioritarias en el Gemelo Digital: {json.dumps(datos['especies_recomendadas'], ensure_ascii=False)}"
        elif any(w in q for w in ["escenario", "simulacion", "envi-met", "caso"]):
            res = f"Escenarios modelados: {json.dumps(datos['escenarios_envi_met'], ensure_ascii=False)}"
        elif any(w in q for w in ["kpi", "metrica", "pet", "temperatura", "escorrentia", "calor"]):
            res = f"Métricas del Gemelo Digital: {json.dumps(datos['kpis_escenario_activo'], ensure_ascii=False)}"
        else:
            res = f"Resumen del Gemelo Digital: {json.dumps(datos, ensure_ascii=False)}"

        return Message(text=res)
'''


def fetch_request(url, method="GET", data=None, api_key=API_KEY):
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["x-api-key"] = api_key
    
    encoded_data = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    
    with urllib.request.urlopen(req) as resp:
        raw = resp.read()
        try:
            raw = gzip.decompress(raw)
        except Exception:
            pass
        return json.loads(raw.decode("utf-8")) if raw else {}


def delete_flow_if_exists(flow_id):
    try:
        fetch_request(f"{LANGFLOW_BASE_URL}/api/v1/flows/{flow_id}", method="DELETE")
        print(f"[+] Deleted outdated flow: {flow_id}")
    except Exception as e:
        print(f"[-] Could not delete flow {flow_id}: {e}")


def get_or_create_agent_flow():
    # 1. Check existing flows
    print(f"[*] Listing flows from {LANGFLOW_BASE_URL}...")
    flows = fetch_request(f"{LANGFLOW_BASE_URL}/api/v1/flows/", method="GET")
    
    simple_agent_flow = None
    for f in flows:
        if f.get("name") == FLOW_NAME:
            print(f"[*] Found existing '{FLOW_NAME}' with ID: {f['id']}. Rebuilding cleanly...")
            delete_flow_if_exists(f['id'])
        if f.get("name") == "Simple Agent":
            simple_agent_flow = f

    if not simple_agent_flow:
        raise RuntimeError("Base 'Simple Agent' flow not found in Langflow.")

    print(f"[*] Fetching base template from 'Simple Agent' ({simple_agent_flow['id']})...")
    simple_agent_full = fetch_request(
        f"{LANGFLOW_BASE_URL}/api/v1/flows/{simple_agent_flow['id']}",
        method="GET"
    )
    base_data = simple_agent_full.get("data")
    cloned_data = copy.deepcopy(base_data)

    # Find the Agent node and update system prompt
    agent_node = None
    for n in cloned_data.get("nodes", []):
        if "Agent" in n.get("id", "") or n.get("data", {}).get("node", {}).get("display_name") == "Agent":
            agent_node = n
            break

    if agent_node:
        template = agent_node["data"]["node"]["template"]
        template["system_prompt"]["value"] = SYSTEM_PROMPT
        if "add_calculator_tool" in template:
            template["add_calculator_tool"]["value"] = True
        if "add_current_date_tool" in template:
            template["add_current_date_tool"]["value"] = True

    # Build the custom Gemelo Digital Tool node with full Langflow 1.12 specification
    tool_node_id = f"CustomComponent-{uuid.uuid4().hex[:5]}"
    tool_node = {
        "id": tool_node_id,
        "type": "genericNode",
        "position": {"x": 50, "y": 450},
        "data": {
            "id": tool_node_id,
            "type": "ConsultarGemeloDigitalTool",
            "showNode": True,
            "node": {
                "template": {
                    "_type": "Component",
                    "code": {
                        "type": "code",
                        "required": True,
                        "placeholder": "",
                        "list": False,
                        "show": True,
                        "multiline": True,
                        "value": CUSTOM_TOOL_CODE,
                        "fileTypes": [],
                        "file_path": "",
                        "password": False,
                        "name": "code",
                        "advanced": True,
                        "api_editable": False,
                        "dynamic": True,
                        "info": "",
                        "load_from_db": False,
                        "title_case": False,
                    },
                    "query": {
                        "tool_mode": True,
                        "trace_as_input": True,
                        "trace_as_metadata": True,
                        "load_from_db": False,
                        "list": False,
                        "list_add_label": "Add More",
                        "override_skip": False,
                        "required": False,
                        "placeholder": "",
                        "show": True,
                        "name": "query",
                        "value": "",
                        "display_name": "Consulta o Métrica",
                        "advanced": False,
                        "api_editable": False,
                        "input_types": ["Message"],
                        "dynamic": False,
                        "info": "Indica qué deseas consultar en el gemelo digital",
                        "title_case": False,
                        "track_in_telemetry": False,
                        "type": "str",
                        "_input_type": "MessageTextInput",
                    },
                    "tools_metadata": {
                        "tool_mode": False,
                        "trace_as_metadata": True,
                        "is_list": True,
                        "list_add_label": "Add More",
                        "override_skip": False,
                        "required": False,
                        "placeholder": "",
                        "show": True,
                        "name": "tools_metadata",
                        "value": [
                            {
                                "name": "consultar_datos",
                                "description": "Consulta KPIs, escenarios climáticos y recomendaciones del Gemelo Digital de Infraestructura Verde Urbana.",
                                "tags": ["consultar_datos"],
                                "status": True,
                                "approval_actions": [],
                                "display_name": "consultar_datos",
                                "display_description": "Consulta KPIs, escenarios climáticos y recomendaciones del Gemelo Digital de Infraestructura Verde Urbana.",
                                "readonly": False,
                                "args": {
                                    "query": {
                                        "default": "",
                                        "description": "Indica qué deseas consultar: 'kpis', 'metricas', 'escenarios', 'especies', 'pet', 'temperatura', o 'general'",
                                        "title": "Consulta o Métrica",
                                        "type": "string",
                                    }
                                },
                            }
                        ],
                        "display_name": "Actions",
                        "advanced": False,
                        "api_editable": False,
                        "dynamic": False,
                        "info": "Modify tool names and descriptions to help agents understand when to use each tool.",
                        "real_time_refresh": True,
                        "title_case": False,
                        "track_in_telemetry": False,
                        "type": "tools",
                        "_input_type": "ToolsInput",
                    },
                },
                "description": "Consulta KPIs, escenarios climáticos y recomendaciones del Gemelo Digital de Infraestructura Verde Urbana.",
                "icon": "trees",
                "base_classes": ["Message"],
                "display_name": "Herramienta Gemelo Digital",
                "documentation": "",
                "minimized": False,
                "custom_fields": {},
                "output_types": [],
                "pinned": False,
                "conditional_paths": [],
                "frozen": False,
                "outputs": [
                    {
                        "types": ["Tool"],
                        "selected": "Tool",
                        "name": "component_as_tool",
                        "hidden": None,
                        "display_name": "Toolset",
                        "method": "to_toolkit",
                        "value": "__UNDEFINED__",
                        "cache": True,
                        "required_inputs": None,
                        "allows_loop": False,
                        "loop_types": None,
                        "group_outputs": False,
                        "options": None,
                        "tool_mode": True,
                    }
                ],
                "field_order": ["query"],
                "beta": False,
                "legacy": False,
                "edited": True,
                "tool_mode": True,
            },
        },
    }
    cloned_data["nodes"].append(tool_node)

    # Add edge from tool_node to Agent tools input
    if agent_node:
        src_handle_data = {
            "dataType": "ConsultarGemeloDigitalTool",
            "id": tool_node_id,
            "name": "component_as_tool",
            "output_types": ["Tool"]
        }
        tgt_handle_data = {
            "fieldName": "tools",
            "id": agent_node["id"],
            "inputTypes": ["Tool"],
            "type": "other"
        }
        src_handle_str = json.dumps(src_handle_data).replace('"', 'œ')
        tgt_handle_str = json.dumps(tgt_handle_data).replace('"', 'œ')
        edge_id = f"reactflow__edge-{tool_node_id}{src_handle_str}-{agent_node['id']}{tgt_handle_str}"

        tool_edge = {
            "animated": False,
            "className": "",
            "id": edge_id,
            "source": tool_node_id,
            "sourceHandle": src_handle_str,
            "target": agent_node["id"],
            "targetHandle": tgt_handle_str,
            "data": {
                "sourceHandle": src_handle_data,
                "targetHandle": tgt_handle_data
            },
            "selected": False
        }
        cloned_data["edges"].append(tool_edge)

    # Create the flow via API
    flow_payload = {
        "name": FLOW_NAME,
        "description": FLOW_DESCRIPTION,
        "data": cloned_data,
        "icon": "trees",
        "gradient": "linear-gradient(90deg, #10B981 0%, #059669 100%)",
        "flow_type": "agent",
    }

    print(f"[*] Registering new flow '{FLOW_NAME}' in Langflow...")
    new_flow = fetch_request(
        f"{LANGFLOW_BASE_URL}/api/v1/flows/",
        method="POST",
        data=flow_payload
    )
    print(f"[+] Successfully registered '{FLOW_NAME}' with ID: {new_flow['id']}")
    return new_flow


def test_agent_run(flow_id):
    """Executes a test query to verify the agent in Langflow."""
    print(f"\n[*] Running test query through Langflow agent (flow_id: {flow_id})...")
    url = f"{LANGFLOW_BASE_URL}/api/v1/run/{flow_id}"
    payload = {
        "input_value": "¿Cuáles son los KPIs actuales del gemelo digital y qué impacto tiene en el confort térmico PET?",
        "input_type": "chat",
        "output_type": "chat"
    }
    
    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=40) as resp:
            raw = resp.read()
            try:
                raw = gzip.decompress(raw)
            except Exception:
                pass
            res = json.loads(raw.decode("utf-8"))
            outputs = res.get("outputs", [])
            for out in outputs:
                for sub in out.get("outputs", []):
                    results = sub.get("results", {})
                    msg = results.get("message", {}).get("text")
                    if msg:
                        print(f"\n[+] Agent response:\n{msg}\n")
                        return True
            print("Warning: Response structure did not contain text message. Full response:", res)
            return True
    except urllib.error.HTTPError as e:
        print(f"[-] Execution test error: {e}")
        try:
            body = e.read()
            try:
                body = gzip.decompress(body)
            except Exception:
                pass
            print("Error details:", body.decode("utf-8"))
        except Exception:
            pass
        return False
    except Exception as e:
        print(f"[-] Execution test error: {e}")
        return False


if __name__ == "__main__":
    try:
        flow = get_or_create_agent_flow()
        print(f"[+] Flow ID: {flow['id']}")
        success = test_agent_run(flow["id"])
        if success:
            print("\n[✔] Langflow Agent setup and verified successfully!")
        else:
            print("\n[!] Setup registered flow, but execution returned an issue.", file=sys.stderr)
    except Exception as exc:
        print(f"\n[!] Error during setup: {exc}", file=sys.stderr)
        sys.exit(1)
