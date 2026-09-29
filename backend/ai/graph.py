from typing import TypedDict, Optional, Any

from langgraph.graph import StateGraph
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq

from ai.tools import (
    log_interaction_tool,
    edit_interaction_tool,
    fetch_interactions_tool,
    delete_interaction_tool
)

# -------------------------
# LLM
# -------------------------
llm = ChatGroq(model="openai/gpt-oss-120b", temperature=0)

# -------------------------
# STRUCTURED OUTPUT
# -------------------------
class InteractionSchema(BaseModel):
    action: str = Field(description="log | edit | fetch | delete")
    interaction_id: Optional[int] = Field(default=None, description="ID of the interaction to edit or delete")
    doctor_name: Optional[str] = None
    notes: Optional[str] = None
    sentiment: Optional[str] = Field(default=None, description="Positive | Negative | Neutral")
    follow_up: Optional[str] = None
    interaction_type: Optional[str] = Field(default=None, description="Type of interaction e.g., Product Discussion, Follow-up")
    engagement_level: Optional[str] = Field(default=None, description="High | Medium | Low")
    summary: Optional[str] = Field(default=None, description="A 1-2 sentence concise summary of the interaction")


structured_llm = llm.with_structured_output(InteractionSchema)


# -------------------------
# STATE
# -------------------------
class State(TypedDict):
    input: str
    action: Optional[str]
    extracted_data: Optional[InteractionSchema]
    output: Optional[Any]


# -------------------------
# ROUTER NODE (decides flow)
# -------------------------
def router(state: State):
    text = state["input"].lower()

    if "delete" in text or "remove" in text:
        action = "delete"
    elif any(word in text for word in ["met", "discussed", "follow", "call", "saw"]):
        action = "log"
    elif "edit" in text or "update" in text:
        action = "edit"
    else:
        action = "fetch"

    return {
        **state,
        "action": action
    }


# -------------------------
# AI EXTRACTOR NODE
# -------------------------
def extractor(state: State):
    text = state["input"]

    prompt = f"""
    Extract CRM structured data from this text:

    Text: {text}

    Rules:
    - For FETCH/QUERY actions: sentiment and engagement_level are optional and should normally be null. Do not invent CRM data.
    - For LOG actions: try to extract sentiment (Positive, Negative, or Neutral) and engagement_level (High, Medium, or Low).
    - If it's a log action and you can't determine it, just leave it null.
    - For EDIT or DELETE actions: try to extract the interaction_id if mentioned (e.g. "Delete interaction 9").
    """

    result = structured_llm.invoke(prompt)

    return {
        **state,
        "extracted_data": result
    }


# -------------------------
# TOOL EXECUTOR NODE
# -------------------------
def tool_executor(state: State):
    data = state.get("extracted_data")

    if not data:
        return {
            **state,
            "output": "No extracted data found"
        }

    action_lower = data.action.lower()

    # LOG FLOW
    if action_lower == "log":
        result = log_interaction_tool({
            "doctor_name": data.doctor_name or "Unknown",
            "notes": data.notes or state["input"],
            "sentiment": data.sentiment or "Neutral",
            "follow_up": data.follow_up,
            "type": data.interaction_type,
            "summary": data.summary,
            "engagement": data.engagement_level
        })

        return {
            **state,
            "output": result
        }

    # EDIT FLOW
    elif action_lower == "edit":
        # Fallback to 1 if no ID is provided for now
        int_id = data.interaction_id if data.interaction_id else 1
        result = edit_interaction_tool(int_id, {
            "notes": data.notes
        })

        return {
            **state,
            "output": result
        }
        
    # DELETE FLOW
    elif action_lower == "delete":
        if not data.interaction_id:
            return {
                **state,
                "output": {"status": "error", "message": "I need an interaction ID to delete. Please specify which interaction to delete (e.g. 'Delete interaction 5')."}
            }
        result = delete_interaction_tool(data.interaction_id)
        return {
            **state,
            "output": result
        }

    # FETCH FLOW
    else:
        filters = {}
        if data.doctor_name:
            filters["doctor_name"] = data.doctor_name
        if data.sentiment:
            filters["sentiment"] = data.sentiment
        if data.engagement_level:
            filters["engagement_level"] = data.engagement_level
        if data.interaction_type:
            filters["interaction_type"] = data.interaction_type
            
        result = fetch_interactions_tool(filters)

        return {
            **state,
            "output": result
        }


# -------------------------
# FORMATTER NODE
# -------------------------
from langchain_core.messages import HumanMessage

def formatter(state: State):
    data = state.get("extracted_data")
    
    # Only format if it's a fetch action
    if data and data.action.lower() == "fetch":
        raw_output = state.get("output")
        prompt = f"""
        You are a CRM AI assistant. The user asked: "{state['input']}"
        Here is the raw database data returned for their query: {raw_output}
        
        Please format this into a helpful, human-readable response. 
        Don't output JSON. Summarize the interactions nicely. 
        Example: "You had 9 interactions today..."
        Use bullet points and be concise.
        """
        response = llm.invoke([HumanMessage(content=prompt)])
        return {
            **state,
            "output": response.content
        }
    return state


# -------------------------
# GRAPH BUILD
# -------------------------
graph = StateGraph(State)

graph.add_node("router", router)
graph.add_node("extractor", extractor)
graph.add_node("tools", tool_executor)
graph.add_node("formatter", formatter)

graph.set_entry_point("router")

graph.add_edge("router", "extractor")
graph.add_edge("extractor", "tools")
graph.add_edge("tools", "formatter")

graph.set_finish_point("formatter")

app_graph = graph.compile()