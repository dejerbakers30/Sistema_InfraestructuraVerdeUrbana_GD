"""
Langflow AI Agent Service for Urban Green Infrastructure Digital Twin.
Connects with Langflow server (http://localhost:7860) to run workflows and agents.
"""

import os
import json
import logging
import gzip
import asyncio
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.core.config import settings

logger = logging.getLogger(__name__)


class LangflowService:
    def __init__(self):
        self.base_url = (settings.LANGFLOW_URL or "http://localhost:7860").rstrip("/")
        self.username = settings.LANGFLOW_USERNAME or "langflow"
        self.password = settings.LANGFLOW_PASSWORD or "CambiaEstaClave123"
        self.api_key = settings.LANGFLOW_API_KEY or "sk-2BkMQeosmoYUIMHmMkoTli4x3VgaOQFyEFnpHzlkcmo"
        self.flow_id = settings.LANGFLOW_FLOW_ID or "311bf9f2-f7e5-41bb-8d34-dcf73ba2d176"
        self.flow_name = settings.LANGFLOW_FLOW_NAME or "Agente Gemelo Digital Urbano"
        self._cached_token: Optional[str] = None

    def _get_headers(self, custom_api_key: Optional[str] = None) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "GemeloDigital-Backend/1.0"
        }
        key = custom_api_key or self.api_key
        if key:
            headers["x-api-key"] = key
        elif self._cached_token:
            headers["Authorization"] = f"Bearer {self._cached_token}"
        return headers

    def _sync_request(
        self,
        endpoint: str,
        method: str = "GET",
        data: Optional[Dict[str, Any]] = None,
        custom_api_key: Optional[str] = None,
        timeout: float = 30.0
    ) -> Dict[str, Any]:
        """Synchronous HTTP request to Langflow with gzip decompression handling."""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = self._get_headers(custom_api_key)
        
        encoded_data = json.dumps(data).encode("utf-8") if data is not None else None
        req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
        
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                raw = resp.read()
                try:
                    raw = gzip.decompress(raw)
                except Exception:
                    pass
                return json.loads(raw.decode("utf-8")) if raw else {}
        except urllib.error.HTTPError as e:
            raw_err = e.read()
            try:
                raw_err = gzip.decompress(raw_err)
            except Exception:
                pass
            err_text = raw_err.decode("utf-8", errors="ignore")
            logger.error(f"Langflow HTTP error {e.code} on {endpoint}: {err_text}")
            raise RuntimeError(f"Langflow returned HTTP {e.code}: {err_text}")
        except Exception as e:
            logger.error(f"Langflow connection error on {endpoint}: {str(e)}")
            raise

    async def get_status(self) -> Dict[str, Any]:
        """Check if Langflow is online and accessible."""
        try:
            # Check basic health
            health_res = await asyncio.to_thread(self._sync_request, "/health", "GET", timeout=5.0)
            
            # List flows to find target agent
            flows = await asyncio.to_thread(self._sync_request, "/api/v1/flows/", "GET", timeout=10.0)
            target_flow = None
            for f in flows if isinstance(flows, list) else []:
                if f.get("id") == self.flow_id or f.get("name") == self.flow_name:
                    target_flow = f
                    break

            return {
                "status": "connected",
                "server_url": self.base_url,
                "flow_id": target_flow.get("id") if target_flow else self.flow_id,
                "flow_name": target_flow.get("name") if target_flow else self.flow_name,
                "agent_ready": bool(target_flow),
                "total_flows": len(flows) if isinstance(flows, list) else 0,
                "checked_at": datetime.utcnow().isoformat() + "Z"
            }
        except Exception as e:
            return {
                "status": "offline",
                "server_url": self.base_url,
                "error": str(e),
                "agent_ready": False,
                "checked_at": datetime.utcnow().isoformat() + "Z"
            }

    async def list_flows(self) -> List[Dict[str, Any]]:
        """List all flows available in the Langflow instance."""
        try:
            res = await asyncio.to_thread(self._sync_request, "/api/v1/flows/", "GET")
            return res if isinstance(res, list) else []
        except Exception as e:
            logger.error(f"Error fetching Langflow flows: {e}")
            return []

    async def run_agent(
        self,
        message: str,
        session_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        custom_flow_id: Optional[str] = None,
        custom_api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Execute an agent query in Langflow and parse the generated response.
        """
        flow_target = custom_flow_id or self.flow_id
        endpoint = f"/api/v1/run/{flow_target}"

        payload: Dict[str, Any] = {
            "input_value": message,
            "input_type": "chat",
            "output_type": "chat"
        }
        if session_id:
            payload["session_id"] = session_id
        if context:
            payload["context"] = context

        logger.info(f"Running Langflow agent query on flow '{flow_target}'...")
        try:
            raw_result = await asyncio.to_thread(
                self._sync_request,
                endpoint=endpoint,
                method="POST",
                data=payload,
                custom_api_key=custom_api_key,
                timeout=60.0
            )

            # Extract output message from Langflow response hierarchy
            extracted_text = ""
            outputs = raw_result.get("outputs", [])
            for out in outputs:
                for sub_out in out.get("outputs", []):
                    results = sub_out.get("results", {})
                    msg = results.get("message", {})
                    if isinstance(msg, dict) and "text" in msg:
                        extracted_text = msg["text"]
                        break
                    elif isinstance(msg, str):
                        extracted_text = msg
                        break
                if extracted_text:
                    break

            if not extracted_text:
                extracted_text = "El Agente de Langflow procesó la solicitud pero no generó texto visible."

            return {
                "success": True,
                "content": extracted_text,
                "role": "assistant",
                "provider": "Langflow Agent",
                "flow_id": flow_target,
                "flow_name": self.flow_name,
                "session_id": session_id,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "raw_response": raw_result
            }
        except Exception as e:
            logger.error(f"Error executing Langflow agent: {str(e)}")
            raise RuntimeError(f"Error ejecutando el agente en Langflow: {str(e)}")


langflow_service = LangflowService()
