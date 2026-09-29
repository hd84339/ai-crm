from ai.graph import app_graph
import traceback

try:
    res = app_graph.invoke({"input": "I met with Dr. Patel today."})
    print(res)
except Exception as e:
    traceback.print_exc()
