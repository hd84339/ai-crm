import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// API Instances
export const api = axios.create({
  baseURL: API,
});

export const getDashboardStats = async () => {
  const res = await api.get('/analytics/dashboard');
  return res.data;
};

export const getHcps = async (search = '', page = 1) => {
  const res = await api.get(`/hcps?search=${search}&page=${page}`);
  return res.data;
};

export const createHcp = async (data) => {
  const res = await api.post(`/hcps`, data);
  return res.data;
};

export const getHcpProfile = async (id) => {
  const res = await api.get(`/hcps/${id}`);
  return res.data;
};

export const updateHcp = async (id, data) => {
  const res = await api.put(`/hcps/${id}`, data);
  return res.data;
};

export const deleteHcp = async (id) => {
  const res = await api.delete(`/hcps/${id}`);
  return res.data;
};

export const logInteraction = async (data) => {
  const res = await api.post(`/interaction/log`, data);
  return res.data;
};

export const getInteractions = async (page = 1, sentiment = '', engagement = '') => {
  const res = await api.get(`/interactions?page=${page}&sentiment=${sentiment}&engagement=${engagement}`);
  return res.data;
};

export const getFollowUps = async (status = '') => {
  const res = await api.get(`/followups?status=${status}`);
  return res.data;
};

export const updateFollowUp = async (id, data) => {
  const res = await api.put(`/followups/${id}`, data);
  return res.data;
};

export const deleteFollowUp = async (id) => {
  const res = await api.delete(`/followups/${id}`);
  return res.data;
};

export const logAIInteraction = async (input) => {
  const res = await api.post(`/ai/agent`, { input });
  return res.data;
};