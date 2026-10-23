from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class ToolCallDetail(BaseModel):
    tool_name: str
    arguments: Dict[str, Any] = Field(default_factory=dict)
    execution_result_summary: str

class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: Optional[str] = "default-session"

class ChatMessageResponse(BaseModel):
    reply: str
    session_id: str
    tools_called: List[ToolCallDetail] = Field(default_factory=list)
    suggested_followups: List[str] = Field(default_factory=list)
    source_attribution: str = "TCS WorkforceGuard Analytics Engine & Trained Models"
