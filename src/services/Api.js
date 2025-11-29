
const DEFAULT_BASE = __DEV__
  ? 'https://192.168.1.105:7133' 
  : 'https://localhost:7133';

let BASE_URL = DEFAULT_BASE;

export function setBaseUrl(url) { BASE_URL = url; }

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  accept: '*/*',
};

async function safeParseJSON(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch (e) {
    const err = new Error('Invalid JSON response from server');
    err.raw = text;
    throw err;
  }
}

export async function request(path, { method = 'GET', headers = {}, body = null, timeout = 15000 } = {}) {
  const url = `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
  const hdrs = { ...DEFAULT_HEADERS, ...headers };

  if (__DEV__) {
    console.log(`[API] ${method} ${url}`);
    if (body) console.log('[API] Body:', typeof body === 'string' ? body : JSON.stringify(body));
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const init = {
      method,
      headers: hdrs,
      signal: controller.signal,
    };

    if (method !== 'GET' && method !== 'HEAD' && body != null) {
      init.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const res = await fetch(url, init);
    clearTimeout(id);

    if (__DEV__) {
      console.log(`[API] Response: ${res.status} ${res.statusText}`);
    }

    const data = await safeParseJSON(res);

    if (!res.ok) {
      const err = new Error((data && data.message) || `HTTP ${res.status}: ${res.statusText}`);
      err.status = res.status;
      err.data = data;
      err.url = url;
      throw err;
    }

    return data;
  } catch (err) {
    clearTimeout(id);

    if (err.name === 'AbortError') {
      const timeoutErr = new Error(`Request timeout após ${timeout}ms: ${url}`);
      timeoutErr.name = 'TimeoutError';
      timeoutErr.url = url;
      throw timeoutErr;
    }

    if (err.message && (
      err.message.includes('Network request failed') ||
      err.message.includes('Failed to fetch') ||
      err.message.includes('NetworkError')
    )) {
      const networkErr = new Error(`Erro de rede: Não foi possível conectar ao servidor ${BASE_URL}. Verifique se o servidor está rodando e acessível.`);
      networkErr.name = 'NetworkError';
      networkErr.url = url;
      networkErr.originalError = err;
      throw networkErr;
    }

    if (err.message && err.message.toLowerCase().includes('certificate')) {
      const sslErr = new Error(`Erro de certificado SSL: O servidor pode estar usando um certificado auto-assinado. Em desenvolvimento, considere usar HTTP, ou configurar o dispositivo/emulador para confiar no certificado.`);
      sslErr.name = 'SSLError';
      sslErr.url = url;
      sslErr.originalError = err;
      throw sslErr;
    }

    if (__DEV__) console.error('[API] Erro na requisição:', err);
    throw err;
  }
}

export async function login(email, password) {
  const payload = JSON.stringify({ email, password });
  const tries = [
    { path: '/api/Auth/login', method: 'POST' },
    { path: '/api/Usuario/login', method: 'POST' },
    { path: '/api/Usuario', method: 'POST' },
  ];

  for (const t of tries) {
    try {
      return await request(t.path, { method: t.method, body: payload });
    } catch (err) {
      if (err.status === 404 || err.status === 405) continue;
      throw err;
    }
  }
  throw new Error('Nenhum endpoint de login disponível. Verifique BASE_URL.');
}

// Usuario
export const listUsuarios = () => request('/api/Usuario', { method: 'GET' });
export const getUsuario = (id) => request(`/api/Usuario/${id}`, { method: 'GET' });
export const createUsuario = (dto) => request('/api/Usuario', { method: 'POST', body: JSON.stringify(dto) });

// Vaga
export const listVagas = () => request('/api/Vaga', { method: 'GET' });
export const createVaga = (dto) => request('/api/Vaga', { method: 'POST', body: JSON.stringify(dto) });
export const editVaga = (id, dto) => request(`/api/Vaga/${id}`, { method: 'PUT', body: JSON.stringify(dto) });
export const deleteVaga = (id) => request(`/api/Vaga/${id}`, { method: 'DELETE' });

// Veiculo
export const listVeiculos = () => request('/api/Veiculo', { method: 'GET' });
export const createVeiculo = (dto) => request('/api/Veiculo', { method: 'POST', body: JSON.stringify(dto) });
export const editVeiculo = (id, dto) => request(`/api/Veiculo/${id}`, { method: 'PUT', body: JSON.stringify(dto) });
export const deleteVeiculo = (id) => request(`/api/Veiculo/${id}`, { method: 'DELETE' });

// Ticket
export const listTickets = () => request('/api/Ticket', { method: 'GET' });
export const createTicket = (dto) => request('/api/Ticket', { method: 'POST', body: JSON.stringify(dto) });
export const editTicket = (id, dto) => request(`/api/Ticket/${id}`, { method: 'PUT', body: JSON.stringify(dto) });
export const deleteTicket = (id) => request(`/api/Ticket/${id}`, { method: 'DELETE' });

// Helpers autenticados (retorna funções que incluem Authorization)
export function authRequest(token) {
  const hdr = { Authorization: `Bearer ${token}` };
  return {
    getVagas: () => request('/api/Vaga', { method: 'GET', headers: hdr }),
    createTicket: (dto) => request('/api/Ticket', { method: 'POST', body: JSON.stringify(dto), headers: hdr }),
  };
}
