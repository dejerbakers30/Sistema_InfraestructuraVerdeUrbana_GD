"""
AI Assistant Endpoints for Groq LLM integration and scientific reasoning.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.core.config import settings
from app.services.groq_service import groq_service
from app.services.langflow_service import langflow_service

router = APIRouter()


class LangflowChatRequest(BaseModel):
    message: str = Field(..., description="User message for Langflow agent")
    session_id: Optional[str] = Field(None, description="Optional persistent session identifier")
    context: Optional[Dict[str, Any]] = Field(None, description="Current digital twin context and KPIs")
    flow_id: Optional[str] = Field(None, description="Specific flow ID to run, or defaults to configured agent")
    api_key: Optional[str] = Field(None, description="Optional custom Langflow API key")


class MessageItem(BaseModel):
    role: str = Field(..., description="Role: 'user', 'assistant', or 'system'")
    content: str = Field(..., description="Message text")


class ChatRequest(BaseModel):
    messages: List[MessageItem]
    context: Optional[Dict[str, Any]] = None
    api_key: Optional[str] = None
    temperature: float = 0.4
    max_tokens: int = 1024


class JustifyRequest(BaseModel):
    metric_name: str
    value: Any
    unit: str = ""
    scenario_name: Optional[str] = None
    api_key: Optional[str] = None


class PredictRequest(BaseModel):
    case_id: str
    custom_params: Optional[Dict[str, Any]] = None
    api_key: Optional[str] = None


@router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    """
    Interact with Groq LLM assistant for urban microclimate and green infrastructure queries.
    """
    try:
        dict_messages = [{"role": m.role, "content": m.content} for m in request.messages]
        result = await groq_service.chat_completion(
            messages=dict_messages,
            context=request.context,
            client_api_key=request.api_key,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing AI chat: {str(e)}"
        )


@router.post("/justify")
async def justify_metric(request: JustifyRequest):
    """
    Get scientific and thermodynamic AI reasoning for a specific microclimate chart or metric.
    """
    try:
        result = await groq_service.explain_metric(
            metric_name=request.metric_name,
            value=request.value,
            unit=request.unit,
            scenario_name=request.scenario_name,
            client_api_key=request.api_key,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating metric justification: {str(e)}"
        )


@router.post("/predict-recommend")
async def predict_case_recommendations(request: PredictRequest):
    """
    Predict impacts and recommend green infrastructure interventions for critical urban cases.
    """
    try:
        result = await groq_service.predict_and_recommend(
            case_id=request.case_id,
            custom_params=request.custom_params,
            client_api_key=request.api_key,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating predictive recommendations: {str(e)}"
        )


@router.post("/langflow/chat")
async def chat_with_langflow_agent(request: LangflowChatRequest):
    """
    Chat with the specialized Langflow Urban Green Infrastructure Agent.
    """
    try:
        result = await langflow_service.run_agent(
            message=request.message,
            session_id=request.session_id,
            context=request.context,
            custom_flow_id=request.flow_id,
            custom_api_key=request.api_key,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error comunicando con el Agente de Langflow: {str(e)}"
        )


@router.get("/langflow/status")
async def get_langflow_status():
    """
    Check connectivity, health, and active flow status for Langflow.
    """
    return await langflow_service.get_status()


@router.get("/langflow/flows")
async def get_langflow_flows():
    """
    List all workflows and agents available in the Langflow instance.
    """
    flows = await langflow_service.list_flows()
    return {"total": len(flows), "flows": flows}


@router.get("/status")
async def get_ai_status():
    """
    Check AI Assistant provider status and active configuration.
    """
    has_key = bool(settings.GROQ_API_KEY)
    langflow_info = await langflow_service.get_status()
    
    return {
        "status": "ready",
        "primary_provider": "Langflow Agent (Local)" if langflow_info.get("agent_ready") else ("Groq Cloud" if has_key else "Built-in Scientific Engine"),
        "groq": {
            "model": settings.GROQ_MODEL,
            "has_server_api_key": has_key,
        },
        "langflow": langflow_info,
        "supported_features": [
            "chat_interaction",
            "langflow_agent_interaction",
            "metric_justification",
            "predictive_cases",
            "urban_heat_island_reasoning",
            "pet_comfort_analysis"
        ]
    }

