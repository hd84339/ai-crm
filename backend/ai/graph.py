from typing import TypedDict, Optional, Any

from langgraph.graph import StateGraph
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq

from ai.tools import (
    log_interaction_tool,
    edit_interaction_tool,
    fetch_interactions_tool
)

# -------------------------
# LLM
# -------------------------
llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0)

# -------------------------
# STRUCTURED OUTPUT
# -------------------------
class InteractionSchema(BaseModel):
    action: str = Field(description="log | edit | fetch")
    doctor_name: Optional[str] = None
    notes: Optional[str] = None
    sentiment: Optional[str] = Field(description="Positive | Negative | Neutral")
    follow_up: Optional[str] = None


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

    if any(word in text for word in ["met", "discussed", "follow"]):
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
    - sentiment must be Positive, Negative, or Neutral
    - always fill sentiment
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

    # LOG FLOW
    if data.action == "log":
        result = log_interaction_tool({
            "doctor_name": data.doctor_name or "Unknown",
            "notes": data.notes or state["input"],
            "sentiment": data.sentiment or "Neutral",
            "follow_up": data.follow_up
        })

        return {
            **state,
            "output": result
        }

    # EDIT FLOW
    elif data.action == "edit":
        result = edit_interaction_tool(1, {
            "notes": data.notes
        })

        return {
            **state,
            "output": result
        }

    # FETCH FLOW
    else:
        result = fetch_interactions_tool()

        return {
            **state,
            "output": result
        }


# -------------------------
# GRAPH BUILD
# -------------------------
graph = StateGraph(State)

graph.add_node("router", router)
graph.add_node("extractor", extractor)
graph.add_node("tools", tool_executor)

graph.set_entry_point("router")

graph.add_edge("router", "extractor")
graph.add_edge("extractor", "tools")

graph.set_finish_point("tools")

app_graph = graph.compile()