import { useState } from 'react';
import ProfessionalCard from '@/components/professionals/ProfessionalCard';
import AppointmentModal from '@/components/appointment/AppointmentModal';
import { useProfessionals } from '@/lib/hooks/useProfessionals';
import { useServices } from '@/lib/hooks/useServices';
import type { Service } from '@/lib/types';

const ProfessionalsTab = () => {
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const { professionals, isLoadingProfessionals } = useProfessionals();
  const { services, isLoadingServices } = useServices();

  const handleViewSchedule = (professionalId: number) => {
    setSelectedProfessionalId(professionalId);
    
    // Select a default service (Corte Masculino) for now
    const defaultService = services.find(s => s.name === 'Corte Masculino') || services[0];
    if (defaultService) {
      setSelectedService(defaultService);
      setIsAppointmentModalOpen(true);
    }
  };

  const handleCloseAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
    setSelectedService(null);
    setSelectedProfessionalId(null);
  };

  return (
    <div className="px-4 py-4">
      <h2 className="font-montserrat font-semibold text-xl mb-4">Escolha o seu barbeiro</h2>
      
      {isLoadingProfessionals ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : professionals.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum profissional disponível no momento
        </div>
      ) : (
        professionals.map(professional => (
          <ProfessionalCard
            key={professional.id}
            professional={professional}
            onViewSchedule={handleViewSchedule}
          />
        ))
      )}
      
      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={handleCloseAppointmentModal}
        service={selectedService}
        professionals={selectedProfessionalId 
          ? professionals.filter(p => p.id === selectedProfessionalId) 
          : professionals}
      />
    </div>
  );
};

export default ProfessionalsTab;
