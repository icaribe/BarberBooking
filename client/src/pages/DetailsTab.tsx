import { Store, CreditCard, ClipboardList, MapPin, Phone, Instagram, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DetailsTab = () => {
  return (
    <div className="px-4 py-4 space-y-5">
      <div className="bg-card rounded-lg p-5">
        <div className="flex items-center mb-4">
          <Store className="text-primary text-2xl mr-3" />
          <h2 className="font-montserrat font-semibold text-xl">Sobre Nós</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Los Barbeiros CBS é uma barbearia moderna localizada em Brasília/DF, oferecendo um ambiente sofisticado para quem busca serviços de qualidade para cabelo e barba.
        </p>
        <div className="mb-4">
          <h3 className="font-montserrat font-medium text-primary mb-2">Localização</h3>
          <p className="text-muted-foreground flex items-center">
            <span className="mr-2">📍</span>
            Quadra 5 lote 48, 48 - 71693-006 Vila São José
          </p>
          <a 
            href="https://www.google.com/maps/search/?api=1&query=-15.91295338%2C-47.76993942" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-primary text-sm mt-2 hover:underline"
          >
            <MapPin className="w-4 h-4 mr-1" /> Ver no Google Maps
          </a>
        </div>
        <div className="mb-4">
          <h3 className="font-montserrat font-medium text-primary mb-2">Horário de Funcionamento</h3>
          <ul className="text-muted-foreground">
            <li className="flex justify-between mb-1">
              <span>Segunda a Sábado:</span>
              <span>9:00 - 19:30</span>
            </li>
            <li className="flex justify-between mb-1">
              <span>Intervalo para almoço:</span>
              <span>13:00 - 14:30</span>
            </li>
            <li className="flex justify-between">
              <span>Domingos e feriados:</span>
              <span>Verificar disponibilidade</span>
            </li>
          </ul>
        </div>
        
        <div className="mb-4">
          <h3 className="font-montserrat font-medium text-primary mb-2">Entre em Contato</h3>
          <div className="space-y-2">
            <a 
              href="https://api.whatsapp.com/send?phone=5561985533103" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-muted-foreground text-sm hover:text-primary"
            >
              <Phone className="w-4 h-4 mr-2" /> (61) 98553-3103
            </a>
          </div>
        </div>
        
        <div>
          <h3 className="font-montserrat font-medium text-primary mb-2">Redes Sociais</h3>
          <div className="flex flex-wrap gap-2">
            <a 
              href="https://www.instagram.com/losbarbeiroscbs/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              <Button variant="outline" size="sm" className="flex items-center">
                <Instagram className="w-4 h-4 mr-1" /> Instagram
              </Button>
            </a>
            <a 
              href="https://www.facebook.com/losbarbeirosdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              <Button variant="outline" size="sm" className="flex items-center">
                <Facebook className="w-4 h-4 mr-1" /> Facebook
              </Button>
            </a>
            <a 
              href="https://api.whatsapp.com/send?phone=5561985533103" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              <Button variant="outline" size="sm" className="flex items-center">
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.4 14.25c-.2-.1-1.2-.6-1.4-.65-.2-.05-.35-.1-.5.1-.15.2-.55.65-.7.8-.15.15-.25.15-.45.05-.2-.1-.85-.3-1.6-.95-.6-.55-1-1.2-1.15-1.4-.15-.2-.02-.3.1-.4.1-.1.25-.25.35-.4.1-.1.2-.2.25-.35.05-.15.05-.3-.05-.4-.1-.1-.5-1.15-.7-1.6-.2-.4-.35-.35-.5-.35-.15 0-.3-.05-.45-.05-.15 0-.4.1-.6.3-.2.2-.75.75-.75 1.8s.75 2.1.85 2.2c.1.1 1.35 2.05 3.3 2.85 1.95.8 1.95.55 2.3.5.35-.05 1.15-.45 1.3-.9.15-.45.15-.8.1-.9-.05-.1-.2-.15-.4-.25m-3.9 5.25a9.81 9.81 0 0 1-5-1.4l-.35-.2-3.7 1 1-3.65-.25-.35a9.63 9.63 0 0 1-1.5-5.15c0-5.3 4.3-9.65 9.65-9.65a9.58 9.58 0 0 1 6.8 2.8 9.59 9.59 0 0 1 2.85 6.75c0 5.35-4.35 9.65-9.65 9.65m8.2-18a11.5 11.5 0 0 0-8.2-3.4C7.75.5 2 6.25 2 13.05c0 2.5.75 4.9 2.15 7l-2.25 8.3 8.5-2.2a11.68 11.68 0 0 0 5.6 1.45c5.8 0 10.6-4.7 10.6-10.55 0-2.8-1.1-5.5-3.1-7.45"></path>
                </svg> WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg p-5">
        <div className="flex items-center mb-4">
          <CreditCard className="text-primary text-2xl mr-3" />
          <h2 className="font-montserrat font-semibold text-xl">Formas de Pagamento</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center">
            <span className="mr-2">💵</span>
            <span>Dinheiro</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">💳</span>
            <span>Cartão de Crédito</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">💳</span>
            <span>Cartão de Débito</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">📱</span>
            <span>Pix</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">🔄</span>
            <span>Permuta</span>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg p-5">
        <div className="flex items-center mb-4">
          <ClipboardList className="text-primary text-2xl mr-3" />
          <h2 className="font-montserrat font-semibold text-xl">Comodidades</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center">
            <span className="mr-2">📶</span>
            <span>Wi-Fi Grátis</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">♿</span>
            <span>Acessibilidade</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">🅿️</span>
            <span>Estacionamento</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">🍺</span>
            <span>Bebidas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsTab;
