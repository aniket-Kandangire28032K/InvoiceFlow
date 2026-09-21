import api from "./axios.js";

export const getClients = async (search = "") => {
  const response = await api.get("/clients", {
    params: search ? { search } : {},
  });
  return response.data;
};

export const getClientById = async (id) => {
  const response = await api.get(`/clients/${id}`);
  return response.data;
};

export const createClient = async (clientData) => {
  const response = await api.post("/clients", clientData);
  return response.data;
};

export const updateClient = async (id, clientData) => {
  const response = await api.put(`/clients/${id}`, clientData);
  return response.data;
};

export const deleteClient = async (id) => {
  const response = await api.delete(`/clients/${id}`);
  return response.data;
};