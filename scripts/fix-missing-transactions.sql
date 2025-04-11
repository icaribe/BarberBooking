
-- Script para validar e criar transações financeiras ausentes
-- para agendamentos concluídos

-- Função para criar transações ausentes
CREATE OR REPLACE FUNCTION fix_missing_transactions()
RETURNS void AS $$
DECLARE
    appointment_record RECORD;
    service_record RECORD;
    total_amount DECIMAL := 0;
    service_names TEXT := '';
BEGIN
    -- Iterar sobre agendamentos concluídos sem transação
    FOR appointment_record IN 
        SELECT a.* FROM appointments a
        LEFT JOIN cash_flow c ON c.appointment_id = a.id
        WHERE a.status = 'completed' 
        AND c.id IS NULL
    LOOP
        -- Resetar valores para cada agendamento
        total_amount := 0;
        service_names := '';
        
        -- Calcular valor total e nomes dos serviços
        FOR service_record IN 
            SELECT s.name, s.price 
            FROM appointment_services aps
            JOIN services s ON s.id = aps.service_id
            WHERE aps.appointment_id = appointment_record.id
        LOOP
            total_amount := total_amount + service_record.price;
            service_names := service_names || service_record.name || ', ';
        END LOOP;
        
        -- Remover última vírgula
        IF LENGTH(service_names) > 0 THEN
            service_names := LEFT(service_names, LENGTH(service_names) - 2);
        END IF;
        
        -- Criar transação se houver valor
        IF total_amount > 0 THEN
            INSERT INTO cash_flow (
                date,
                appointment_id,
                amount,
                type,
                description
            ) VALUES (
                appointment_record.date,
                appointment_record.id,
                total_amount / 100, -- Converter centavos para reais
                'INCOME',
                'Pagamento de serviço - Agendamento #' || appointment_record.id || ' (' || service_names || ')'
            );
            
            RAISE NOTICE 'Criada transação para agendamento #%, valor R$ %', 
                appointment_record.id, 
                total_amount / 100;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Executar a função
SELECT fix_missing_transactions();
