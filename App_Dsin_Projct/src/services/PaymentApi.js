import { request } from './Api';

// Simula pagamento da sessão
export const payParkingSession = async (userId, amount, method = "balance") => {
  const payload = {
    userId,
    amount,
    method,
  };

  return request('/api/payments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// Busca carteira do usuário
export const getWallet = async (userId) => {
  return request(`/api/wallet/${userId}`, { method: 'GET' });
};

// Atualiza carteira (saldo)
export const updateWallet = async (userId, newBalance) => {
  return request(`/api/wallet/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ balance: newBalance }),
  });
};

// Adicionar créditos (se não existir a carteira, cria)
export const addBalance = async (userId, amount) => {
  try {
    const wallet = await getWallet(userId);
    const newBalance = Math.round((Number(wallet.balance || 0) + amount) * 100) / 100;
    return await updateWallet(userId, newBalance);
  } catch (err) {
    return request('/api/wallet', {
      method: 'POST',
      body: JSON.stringify({
      userId,
      balance: amount,
      }),
    });
  }
};
