from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.assistant import ChatMessageRequest, ChatMessageResponse
from app.agent.workforce_agent import WorkforceAgent
from app.db.models import ChatHistoryRecord

router = APIRouter()

@router.post("/chat", response_model=ChatMessageResponse)
def chat_with_workforce_assistant(req: ChatMessageRequest, db: Session = Depends(get_db)):
    """Conversational assistant querying real workforce intelligence tools with deterministic fallback."""
    response = WorkforceAgent.answer_query(
        query=req.message,
        session_id=req.session_id or "default-session",
        db=db
    )
    
    # Audit log entry
    try:
        log_entry = ChatHistoryRecord(
            session_id=req.session_id or "default-session",
            user_query=req.message,
            assistant_response=response.reply,
            tools_executed=[t.model_dump() for t in response.tools_called]
        )
        db.add(log_entry)
        db.commit()
    except Exception:
        pass

    return response
