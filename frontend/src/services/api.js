import axios from "axios";

const API = "http://127.0.0.1:8000";

export const logAIInteraction = async (input) => {
  const res = await axios.post(`${API}/ai/agent`, {
    input,
  });
  return res.data;
};

export const getInteractions = async () => {
  const res = await axios.get(`${API}/interaction/list`);
  return res.data;
};