-- Função para criar a tabela cash_flow
CREATE OR REPLACE FUNCTION create_cash_flow_table()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se a tabela já existe
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'cash_flow'
  ) THEN
    -- Criar a tabela cash_flow
    CREATE TABLE public.cash_flow (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      appointment_id INTEGER REFERENCES public.appointments(id) ON DELETE SET NULL,
      amount DECIMAL(10, 2) NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Criar índices para melhorar desempenho
    CREATE INDEX cash_flow_date_idx ON public.cash_flow(date);
    CREATE INDEX cash_flow_type_idx ON public.cash_flow(type);
    CREATE INDEX cash_flow_appointment_id_idx ON public.cash_flow(appointment_id);
    
    -- Comentários da tabela
    COMMENT ON TABLE public.cash_flow IS 'Registros do fluxo de caixa da barbearia';
    COMMENT ON COLUMN public.cash_flow.id IS 'ID único da transação';
    COMMENT ON COLUMN public.cash_flow.date IS 'Data da transação';
    COMMENT ON COLUMN public.cash_flow.appointment_id IS 'ID do agendamento relacionado (se aplicável)';
    COMMENT ON COLUMN public.cash_flow.amount IS 'Valor da transação em Reais (não em centavos)';
    COMMENT ON COLUMN public.cash_flow.type IS 'Tipo da transação: INCOME, EXPENSE, REFUND, ADJUSTMENT, PRODUCT_SALE';
    COMMENT ON COLUMN public.cash_flow.description IS 'Descrição ou observação sobre a transação';
    
    -- Ativar RLS (Row Level Security)
    ALTER TABLE public.cash_flow ENABLE ROW LEVEL SECURITY;
    
    -- Criar política para administradores (acesso completo)
    CREATE POLICY cash_flow_admin_policy ON public.cash_flow
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.users
          WHERE users.auth_id = auth.uid()
          AND users.role = 'admin'
        )
      );
      
    -- Criar política para todos (sem acesso)
    CREATE POLICY cash_flow_all_policy ON public.cash_flow
      FOR SELECT
      TO authenticated
      USING (false);
      
    RAISE NOTICE 'Tabela cash_flow criada com sucesso';
  ELSE
    RAISE NOTICE 'Tabela cash_flow já existe';
  END IF;
END;
$$;

-- Conceder permissão para invocar a função
GRANT EXECUTE ON FUNCTION create_cash_flow_table() TO authenticated;
GRANT EXECUTE ON FUNCTION create_cash_flow_table() TO anon;
GRANT EXECUTE ON FUNCTION create_cash_flow_table() TO service_role;