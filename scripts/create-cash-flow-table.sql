
CREATE TABLE IF NOT EXISTS cash_flow (
  id SERIAL PRIMARY KEY,
  date TIMESTAMP NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  category TEXT NOT NULL,
  appointment_id INTEGER REFERENCES appointments(id),
  professional_id INTEGER REFERENCES professionals(id),
  created_by_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
