
import { API_BASE_URL } from '../config/api';

const DEFAULT_BASE = API_BASE_URL;

let BASE_URL = DEFAULT_BASE;

export function setBaseUrl(url) { BASE_URL = url; }

const normalizeVeiculo = (item) => ({
  IdVeiculo: String(item?.id ?? item?.IdVeiculo ?? ''),
  Placa: item?.placa ?? item?.Placa ?? '',
  Modelo: item?.modelo ?? item?.Modelo ?? '',
  Cor: item?.cor ?? item?.Cor ?? '',
  userId: item?.user_id ?? item?.userId ?? null,
});

const toVeiculoPayload = (dto = {}) => ({
  user_id: dto.user_id ?? dto.userId ?? null,
  placa: dto.placa ?? dto.Placa ?? '',
  modelo: dto.modelo ?? dto.Modelo ?? '',
  cor: dto.cor ?? dto.Cor ?? '',
});

const normalizeVaga = (item) => ({
  id: item?.id,
  title: item?.titulo ?? item?.title ?? '',
  description: item?.descricao ?? item?.description ?? '',
  latitude: Number(item?.latitude),
  longitude: Number(item?.longitude),
  ativa: item?.ativa ?? true,
});

const toVagaPayload = (dto = {}) => ({
  titulo: dto.titulo ?? dto.title ?? '',
  descricao: dto.descricao ?? dto.description ?? '',
  latitude: Number(dto.latitude),
  longitude: Number(dto.longitude),
  ativa: dto.ativa ?? true,
});

const normalizeTicket = (item) => ({
  id: item?.id,
  userId: item?.user_id ?? item?.userId,
  vehicleId: item?.vehicle_id ?? item?.vehicleId ?? null,
  parkingSpotId: item?.parking_spot_id ?? item?.parkingSpotId ?? null,
  startedAt: item?.started_at ?? item?.startedAt ?? null,
  endedAt: item?.ended_at ?? item?.endedAt ?? null,
  minutesUsed: item?.minutes_used ?? item?.minutesUsed ?? 0,
  amount: Number(item?.amount ?? 0),
  status: item?.status ?? 'open',
});

const toTicketPayload = (dto = {}) => ({
  user_id: dto.user_id ?? dto.userId,
  vehicle_id: dto.vehicle_id ?? dto.vehicleId ?? null,
  parking_spot_id: dto.parking_spot_id ?? dto.parkingSpotId ?? null,
  started_at: dto.started_at ?? dto.startedAt ?? null,
  ended_at: dto.ended_at ?? dto.endedAt ?? null,
  minutes_used: dto.minutes_used ?? dto.minutesUsed ?? 0,
  amount: dto.amount ?? 0,
  status: dto.status ?? 'open',
});

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

    if (__DEV__) console.log('[API] Erro na requisição:', err.message || err);
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
export const listVagas = async () => {
  const data = await request('/api/Vaga', { method: 'GET' });
  return Array.isArray(data) ? data.map(normalizeVaga) : [];
};
export const createVaga = async (dto) => {
  const data = await request('/api/Vaga', { method: 'POST', body: JSON.stringify(toVagaPayload(dto)) });
  return normalizeVaga(data);
};
export const editVaga = async (id, dto) => {
  const data = await request(`/api/Vaga/${id}`, { method: 'PUT', body: JSON.stringify(toVagaPayload(dto)) });
  return normalizeVaga(data);
};
export const deleteVaga = (id) => request(`/api/Vaga/${id}`, { method: 'DELETE' });

// Veiculo
export const listVeiculos = async (userId = null) => {
  const suffix = userId ? `?user_id=${userId}` : '';
  const data = await request(`/api/Veiculo${suffix}`, { method: 'GET' });
  return Array.isArray(data) ? data.map(normalizeVeiculo) : [];
};
export const createVeiculo = async (dto) => {
  const data = await request('/api/Veiculo', { method: 'POST', body: JSON.stringify(toVeiculoPayload(dto)) });
  return normalizeVeiculo(data);
};
export const editVeiculo = async (id, dto) => {
  const data = await request(`/api/Veiculo/${id}`, { method: 'PUT', body: JSON.stringify(toVeiculoPayload(dto)) });
  return normalizeVeiculo(data);
};
export const deleteVeiculo = (id) => request(`/api/Veiculo/${id}`, { method: 'DELETE' });

// Ticket
export const listTickets = async (userId = null) => {
  const suffix = userId ? `?user_id=${userId}` : '';
  const data = await request(`/api/Ticket${suffix}`, { method: 'GET' });
  return Array.isArray(data) ? data.map(normalizeTicket) : [];
};
export const createTicket = async (dto) => {
  const data = await request('/api/Ticket', { method: 'POST', body: JSON.stringify(toTicketPayload(dto)) });
  return normalizeTicket(data);
};
export const editTicket = async (id, dto) => {
  const data = await request(`/api/Ticket/${id}`, { method: 'PUT', body: JSON.stringify(toTicketPayload(dto)) });
  return normalizeTicket(data);
};
export const deleteTicket = (id) => request(`/api/Ticket/${id}`, { method: 'DELETE' });

// Helpers autenticados (retorna funções que incluem Authorization)
export function authRequest(token) {
  const hdr = { Authorization: `Bearer ${token}` };
  return {
    getVagas: () => request('/api/Vaga', { method: 'GET', headers: hdr }),
    createTicket: (dto) => request('/api/Ticket', { method: 'POST', body: JSON.stringify(dto), headers: hdr }),
  };
}
