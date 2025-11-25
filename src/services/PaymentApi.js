// src/services/PaymentApi.js
import axios from "axios";

const BASE_URL = "https://SEU_PROJETO.mockapi.io"; // <-- coloque aqui sua URL do MockAPI

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Simula pagamento da sessão
export const payParkingSession = async (userId, amount, method = "balance") => {
  const payload = {
    userId,
    amount,
    method,
    createdAt: new Date().toISOString(),
  };

  const response = await api.post("/payments", payload);
  return response.data;
};

// Busca carteira do usuário
export const getWallet = async (userId) => {
  const response = await api.get(`/wallet/${userId}`);
  return response.data;
};

// Atualiza carteira (saldo)
export const updateWallet = async (userId, newBalance) => {
  const response = await api.put(`/wallet/${userId}`, {
    balance: newBalance,
  });
  return response.data;
};

// Adicionar créditos (se não existir a carteira, cria)
export const addBalance = async (userId, amount) => {
  try {
    const wallet = await getWallet(userId);
    const newBalance = Math.round((Number(wallet.balance || 0) + amount) * 100) / 100;
    return await updateWallet(userId, newBalance);
  } catch (err) {
    const response = await api.post("/wallet", {
      userId,
      balance: amount,
      createdAt: new Date().toISOString(),
    });
    return response.data;
  }
};

export default api;
