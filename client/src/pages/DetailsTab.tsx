import { Store, CreditCard, ClipboardList } from 'lucide-react';

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
