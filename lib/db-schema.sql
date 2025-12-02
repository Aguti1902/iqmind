-- Schema para base de datos PostgreSQL de MindMetric

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  iq INTEGER DEFAULT 0,
  subscription_status VARCHAR(50) DEFAULT 'trial',
  subscription_id VARCHAR(255),
  trial_end_date TIMESTAMP,
  access_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Tabla de resultados de tests
CREATE TABLE IF NOT EXISTS test_results (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  iq INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_elapsed INTEGER NOT NULL,
  answers JSONB,
  category_scores JSONB,
  completed_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de tokens de reseteo de contraseña
CREATE TABLE IF NOT EXISTS password_resets (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración del sitio
CREATE TABLE IF NOT EXISTS site_config (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(255)
);

-- Insertar valores por defecto
INSERT INTO site_config (key, value, description) VALUES
  -- Configuración general de pagos
  ('payment_mode', 'test', 'Modo de pago: test o production'),
  
  -- Configuración de Stripe
  ('stripe_test_publishable_key', '', 'Clave pública de Stripe (test)'),
  ('stripe_test_secret_key', '', 'Clave secreta de Stripe (test)'),
  ('stripe_test_webhook_secret', '', 'Webhook secret de Stripe (test)'),
  ('stripe_live_publishable_key', '', 'Clave pública de Stripe (live)'),
  ('stripe_live_secret_key', '', 'Clave secreta de Stripe (live)'),
  ('stripe_live_webhook_secret', '', 'Webhook secret de Stripe (live)'),
  ('stripe_test_price_id', '', 'Price ID del producto (test)'),
  ('stripe_live_price_id', '', 'Price ID del producto (live)'),
  
  -- Configuración de precios y suscripción
  ('subscription_price', '9.99', 'Precio de la suscripción mensual'),
  ('trial_days', '2', 'Días de prueba gratuita'),
  ('initial_payment', '1.00', 'Pago inicial para acceder al resultado'),
  ('admin_emails', '', 'Emails de administradores separados por coma')
ON CONFLICT (key) DO NOTHING;

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_completed_at ON test_results(completed_at);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
CREATE INDEX IF NOT EXISTS idx_site_config_key ON site_config(key);

