PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS wallet_transactions;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS parking_tickets;
DROP TABLE IF EXISTS parking_spots;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS personal_access_tokens;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified_at TEXT NULL,
    password TEXT NOT NULL,
    remember_token TEXT NULL,
    created_at TEXT NULL,
    updated_at TEXT NULL
);

CREATE TABLE personal_access_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tokenable_type TEXT NOT NULL,
    tokenable_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    abilities TEXT NULL,
    last_used_at TEXT NULL,
    expires_at TEXT NULL,
    created_at TEXT NULL,
    updated_at TEXT NULL
);

CREATE INDEX idx_personal_access_tokens_tokenable
ON personal_access_tokens (tokenable_type, tokenable_id);

CREATE TABLE vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NULL,
    placa TEXT NOT NULL UNIQUE,
    modelo TEXT NOT NULL,
    cor TEXT NULL,
    created_at TEXT NULL,
    updated_at TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE parking_spots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT NULL,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    ativa INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NULL,
    updated_at TEXT NULL
);

CREATE TABLE parking_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    vehicle_id INTEGER NULL,
    parking_spot_id INTEGER NULL,
    started_at TEXT NOT NULL,
    ended_at TEXT NULL,
    minutes_used INTEGER NOT NULL DEFAULT 0,
    amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NULL,
    updated_at TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    FOREIGN KEY (parking_spot_id) REFERENCES parking_spots(id) ON DELETE SET NULL
);

CREATE TABLE wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    balance NUMERIC NOT NULL DEFAULT 0,
    created_at TEXT NULL,
    updated_at TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE wallet_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    method TEXT NULL,
    description TEXT NULL,
    reference TEXT NULL,
    created_at TEXT NULL,
    updated_at TEXT NULL,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
);

INSERT INTO users (id, name, email, password, created_at, updated_at)
VALUES (
    1,
    'Usuario Demo',
    'demo@onpark.com',
    '$2y$12$JvW.9U7Vj3jJ8w9GJm0GpOwT7U0mW0uM4uT0H2lJ0m0lC9W5mFf6K',
    '2026-03-16 00:00:00',
    '2026-03-16 00:00:00'
);

INSERT INTO wallets (id, user_id, balance, created_at, updated_at)
VALUES (
    1,
    1,
    150.00,
    '2026-03-16 00:00:00',
    '2026-03-16 00:00:00'
);

INSERT INTO wallet_transactions (wallet_id, type, amount, method, description, reference, created_at, updated_at)
VALUES (
    1,
    'credit',
    150.00,
    'seed',
    'Carga inicial da carteira demo',
    'SEED-WALLET-1',
    '2026-03-16 00:00:00',
    '2026-03-16 00:00:00'
);

INSERT INTO vehicles (id, user_id, placa, modelo, cor, created_at, updated_at)
VALUES (
    1,
    1,
    'ABC1D23',
    'Gol 1.0',
    'Prata',
    '2026-03-16 00:00:00',
    '2026-03-16 00:00:00'
);

INSERT INTO parking_spots (id, titulo, descricao, latitude, longitude, ativa, created_at, updated_at)
VALUES
    (1, 'Vaga Quadra Unimar', 'Vaga disponivel', -22.2328, -49.9762, 1, '2026-03-16 00:00:00', '2026-03-16 00:00:00'),
    (2, 'Vaga Refeitorio', 'Vaga disponivel', -22.2336, -49.9770, 1, '2026-03-16 00:00:00', '2026-03-16 00:00:00'),
    (3, 'Vaga Campo Futebol', 'Vaga disponivel', -22.2340, -49.9768, 1, '2026-03-16 00:00:00', '2026-03-16 00:00:00');

INSERT INTO parking_tickets (user_id, vehicle_id, parking_spot_id, started_at, ended_at, minutes_used, amount, status, created_at, updated_at)
VALUES (
    1,
    1,
    1,
    '2026-03-16 08:00:00',
    '2026-03-16 08:30:00',
    30,
    3.00,
    'closed',
    '2026-03-16 08:00:00',
    '2026-03-16 08:30:00'
);