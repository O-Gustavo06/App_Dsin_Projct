const DEFAULT_BASE = __DEV__ ? 'http://10.0.2.2:7133' : 'https://localhost:7133/swagger';
export let BASE_URL = DEFAULT_BASE;

// função util para trocar base em runtime (útil para testes)
export function setBaseUrl(url) { BASE_URL = url; }

// cabeçalhos padrão
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// parse JSON com segurança (caso resposta seja vazia ou HTML)
async function safeParseJSON(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch (e) {
    // se for HTML (ex.: você deixou /swagger) retornará erro controlado
    const err = new Error('Invalid JSON response from server');
    err.raw = text;
    throw err;
  }
}

// request wrapper
export async function request(path, { method = 'GET', headers = {}, body = null, timeout = 10000 } = {}) {
  const url = `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
  const hdrs = { ...DEFAULT_HEADERS, ...headers };

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const init = { method, headers: hdrs, signal: controller.signal };
    // só adicionar body para métodos que aceitam body
    if (method !== 'GET' && method !== 'HEAD' && body != null) init.body = body;

    const res = await fetch(url, init);
    clearTimeout(id);

    // parse seguro
    const data = await safeParseJSON(res);

    if (!res.ok) {
      const err = new Error((data && data.message) || `HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timeout');
    throw err;
  }
}

/* =====================
   Endpoints principais
   ===================== */

// Wrapper para login (tenta endpoints comuns)
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

// Usuários
export const listUsuarios = () => request('/api/Usuario', { method: 'GET' });
export const getUsuario = (id) => request(`/api/Usuario/${id}`, { method: 'GET' });
export const createUsuario = (dto) => request('/api/Usuario', { method: 'POST', body: JSON.stringify(dto) });

// Vagas
export const listVagas = () => request('/api/Vaga', { method: 'GET' });
export const createVaga = (dto) => request('/api/Vaga', { method: 'POST', body: JSON.stringify(dto) });

// Veículos
export const listVeiculos = () => request('/api/Veiculo', { method: 'GET' });
export const createVeiculo = (dto) => request('/api/Veiculo', { method: 'POST', body: JSON.stringify(dto) });

// Tickets
export const listTickets = () => request('/api/Ticket', { method: 'GET' });
export const createTicket = (dto) => request('/api/Ticket', { method: 'POST', body: JSON.stringify(dto) });

// Authenticated helpers
export function authRequest(token) {
  const hdr = { Authorization: `Bearer ${token}` };
  return {
    getVagas: () => request('/api/Vaga', { method: 'GET', headers: hdr }),
    createTicket: (dto) => request('/api/Ticket', { method: 'POST', body: JSON.stringify(dto), headers: hdr }),
    // adicione outros endpoints autenticados aqui
  };
}
