import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ServiceCard from '@/components/services/ServiceCard';
import ServiceCategoryFilter from '@/components/services/ServiceCategoryFilter';
import AppointmentModal from '@/components/appointment/AppointmentModal';
import { useServices } from '@/lib/hooks/useServices';
import { useProfessionals } from '@/lib/hooks/useProfessionals';
import type { Service } from '@/lib/types';

const ServicesTab = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  
  const { 
    services, 
    categories, 
    isLoadingServices, 
    isLoadingCategories 
  } = useServices();
  
  const { professionals, isLoadingProfessionals } = useProfessionals();

  // Filter services by category and search term
  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategoryId === null || service.categoryId === selectedCategoryId;
    const matchesSearch = searchTerm === '' || 
      service.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const handleScheduleService = (service: Service) => {
    setSelectedService(service);
    setIsAppointmentModalOpen(true);
  };

  const handleCloseAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
    setSelectedService(null);
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="px-4 py-3 bg-secondary">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Pesquisar serviço..."
            className="w-full bg-card text-foreground pl-10 focus-visible:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Filter */}
      {isLoadingCategories ? (
        <div className="px-4 py-3 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : (
        <ServiceCategoryFilter
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
      )}

      {/* Services List */}
      <div className="px-4 py-2">
        {isLoadingServices ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 
              `Nenhum serviço encontrado para "${searchTerm}"` : 
              'Nenhum serviço disponível nesta categoria'}
          </div>
        ) : (
          filteredServices.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onSchedule={handleScheduleService}
            />
          ))
        )}
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={handleCloseAppointmentModal}
        service={selectedService}
        professionals={professionals}
      />
    </div>
  );
};

export default ServicesTab;
