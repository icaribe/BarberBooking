import React from 'react';
import { Link } from 'wouter';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header showBackButton title="Política de Privacidade" />
      
      <main className="flex-1 p-4 space-y-6 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>Política de Privacidade</CardTitle>
            <CardDescription>Atualizada em 01 de Abril, 2025</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h3>1. Introdução</h3>
            <p>
              A Los Barbeiros CBS valoriza a privacidade de seus usuários e se compromete a proteger as informações pessoais 
              que você compartilha conosco. Esta política descreve como coletamos, utilizamos, armazenamos e protegemos seus dados.
            </p>
            
            <h3>2. Informações Coletadas</h3>
            <p>
              Coletamos os seguintes tipos de informações:
            </p>
            <ul>
              <li><strong>Informações Pessoais:</strong> Nome, e-mail, telefone e endereço.</li>
              <li><strong>Informações de Conta:</strong> Nome de usuário, senha e preferências.</li>
              <li><strong>Informações de Uso:</strong> Dados sobre como você utiliza nosso aplicativo.</li>
              <li><strong>Informações de Dispositivo:</strong> Tipo de dispositivo, sistema operacional e versão.</li>
            </ul>
            
            <h3>3. Uso das Informações</h3>
            <p>
              Utilizamos suas informações para:
            </p>
            <ul>
              <li>Processar e gerenciar seus agendamentos.</li>
              <li>Personalizar sua experiência no aplicativo.</li>
              <li>Enviar notificações sobre agendamentos e promoções.</li>
              <li>Manter e aprimorar nossos serviços.</li>
              <li>Cumprir obrigações legais e resolver disputas.</li>
            </ul>
            
            <h3>4. Compartilhamento de Dados</h3>
            <p>
              Não vendemos ou alugamos suas informações pessoais para terceiros. Compartilhamos informações apenas:
            </p>
            <ul>
              <li>Com prestadores de serviços que nos ajudam a operar o aplicativo.</li>
              <li>Quando exigido por lei ou para proteger nossos direitos.</li>
              <li>Em caso de fusão, aquisição ou venda de ativos, onde os dados dos usuários podem ser transferidos.</li>
            </ul>
            
            <h3>5. Armazenamento e Segurança</h3>
            <p>
              Implementamos medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado, 
              alteração, divulgação ou destruição. Armazenamos seus dados apenas pelo tempo necessário para fornecer os 
              serviços solicitados, cumprir obrigações legais ou resolver disputas.
            </p>
            
            <h3>6. Seus Direitos</h3>
            <p>
              Você tem o direito de:
            </p>
            <ul>
              <li>Acessar, corrigir ou excluir seus dados pessoais.</li>
              <li>Restringir ou se opor ao processamento de seus dados.</li>
              <li>Solicitar a portabilidade de seus dados.</li>
              <li>Retirar seu consentimento a qualquer momento.</li>
            </ul>
            <p>
              Para exercer esses direitos, entre em contato conosco através dos canais disponíveis na seção "Contato".
            </p>
            
            <h3>7. Cookies e Tecnologias Semelhantes</h3>
            <p>
              Utilizamos cookies e tecnologias semelhantes para melhorar a experiência do usuário, analisar o uso do aplicativo 
              e personalizar conteúdos. Você pode configurar seu navegador para recusar todos os cookies ou para indicar quando 
              um cookie está sendo enviado.
            </p>
            
            <h3>8. Crianças</h3>
            <p>
              Nosso aplicativo não é destinado a menores de 18 anos. Não coletamos intencionalmente informações pessoais de 
              crianças menores de 18 anos. Se descobrirmos que coletamos inadvertidamente informações pessoais de uma criança 
              menor de 18 anos, excluiremos essas informações imediatamente.
            </p>
            
            <h3>9. Alterações na Política de Privacidade</h3>
            <p>
              Podemos atualizar esta política periodicamente. Notificaremos você sobre mudanças significativas através de um 
              aviso no aplicativo ou por e-mail. Recomendamos revisar esta política regularmente.
            </p>
            
            <h3>10. Contato</h3>
            <p>
              Se você tiver dúvidas ou preocupações sobre nossa Política de Privacidade ou sobre nossas práticas de tratamento 
              de dados, entre em contato conosco pelo e-mail privacy@losbarbeiroscbs.com.br ou pelo telefone (61) 3333-4444.
            </p>
          </CardContent>
        </Card>
        
        <div className="flex justify-center">
          <Link href="/settings" className="flex items-center text-primary hover:underline">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar para Configurações
          </Link>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default PrivacyPolicy;