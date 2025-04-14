-- Adicionar coluna completed_at à tabela appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
AND column_name = 'completed_at';