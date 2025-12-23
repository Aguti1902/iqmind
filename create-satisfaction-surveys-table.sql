-- Tabla para almacenar encuestas de satisfacción de usuarios que cancelan
CREATE TABLE IF NOT EXISTS satisfaction_surveys (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_email (email),
  INDEX idx_score (score),
  INDEX idx_created_at (created_at)
);

-- Comentarios para documentación
COMMENT ON TABLE satisfaction_surveys IS 'Encuestas de satisfacción de usuarios que cancelan su suscripción';
COMMENT ON COLUMN satisfaction_surveys.email IS 'Email del usuario que cancela';
COMMENT ON COLUMN satisfaction_surveys.score IS 'Puntuación de satisfacción de 0 a 10';
COMMENT ON COLUMN satisfaction_surveys.timestamp IS 'Fecha y hora cuando se realizó la encuesta';
COMMENT ON COLUMN satisfaction_surveys.created_at IS 'Fecha de creación del registro';

