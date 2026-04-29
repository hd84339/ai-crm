import { useState } from "react";
import { logAIInteraction } from "../services/api";

export default function LogInteraction() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);

  const handleSubmit = async () => {
    const res = await logAIInteraction(input);
    setResponse(res);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Inter" }}>
      <h2>AI Log Interaction</h2>

      <textarea
        rows={5}
        style={{ width: "100%" }}
        placeholder="Type interaction..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button onClick={handleSubmit}>
        Send to AI
      </button>

      {response && (
        <pre style={{ marginTop: "20px" }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}