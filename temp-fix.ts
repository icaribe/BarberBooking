// Código a ser substituído para o endpoint de agendamentos do dia
            // Retornar agendamento com dados complementares
            return {
              ...appointment,
              client_name: client?.name || client?.username || 'Cliente',
              client_email: client?.email,
              professional_name: professional?.name || 'Profissional',
              service_names: serviceDetails.map(s => s?.name || 'Serviço').filter(Boolean),
              service_prices: serviceDetails.map(s => s?.price || 0),
              totalValue: serviceDetails.reduce((sum, service) => sum + (service?.price || 0), 0)
            };