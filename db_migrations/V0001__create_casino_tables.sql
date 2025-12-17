CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    balance INTEGER DEFAULT 10,
    ip_address VARCHAR(50),
    banned BOOLEAN DEFAULT FALSE,
    lucky_mode BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promo_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount INTEGER DEFAULT 0,
    activations_left INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS code_activations (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bets (
    id SERIAL PRIMARY KEY,
    creator VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    type VARCHAR(100) NOT NULL,
    amount INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_ip ON users(ip_address);
CREATE INDEX idx_promo_code ON promo_codes(code);
CREATE INDEX idx_bets_active ON bets(active);
