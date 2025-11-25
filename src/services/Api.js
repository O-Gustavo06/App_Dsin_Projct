// apiService.js
const DEFAULT_BASE = 'http://localhost:7133'; // ajuste aqui conforme ambiente

// Dicas:
// - No Android emulator (AVD) use: 'http://10.0.2.2:7133'
// - No Genymotion: 'http://10.0.3.2:7133'
// - No iOS simulator: 'http://localhost:7133'
// - Em produção use a URL real do backend (https).

export let BASE_URL = DEFAULT_BASE;

// helper para trocar dinamicamente (útil em dev)
export const setBaseUrl = (url) => {
  BASE_URL = url;
};

const defaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

// util: parseia corpo apenas se for JSON
const parseJsonSafe = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (err) {
      // corpo inválido
      return null;
    }
  }
  return null;
};

// util: requisição centralizada
const request = async (path, options = {}) => {
  const url = `${BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const headers = { ...defaultHeaders, ...(options.headers || {}) };
  const opts = { ...options, headers };

  try {
    const res = await fetch(url, opts);

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      // tenta enviar mensagem de erro útil
      const message = (data && (data.message || data.error)) || `HTTP ${res.status} - ${res.statusText}`;
      const err = new Error(message);
      err.status = res.status;
      err.body = data;
      throw err;
    }

    return data;
  } catch (error) {
    // log útil para desenvolvimento
    console.error(`API request error: ${options.method || 'GET'} ${url}`, error);
    throw error;
  }
};

/* -------------------------
  Endpoints
   ------------------------- */

export const login = async (email, password) => {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const register = async (name, email, password) => {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
};

export const purchaseCredits = async (amount, authToken) => {
  if (!authToken) throw new Error('Auth token required');

  return request('/credits/purchase', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ amount }),
  });
};
