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

const TermsOfUse = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header showBackButton title="Termos de Uso" />
      
      <main className="flex-1 p-4 space-y-6 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>Termos de Uso</CardTitle>
            <CardDescription>Atualizado em 01 de Abril, 2025</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h3>1. Aceitação dos Termos</h3>
            <p>
              Ao acessar e utilizar o aplicativo Los Barbeiros CBS, você concorda com estes Termos de Uso e 
              com nossa Política de Privacidade. Se você não concordar com estes termos, por favor, não utilize nosso aplicativo.
            </p>
            
            <h3>2. Descrição do Serviço</h3>
            <p>
              O aplicativo Los Barbeiros CBS permite aos usuários agendar serviços de barbearia, visualizar produtos disponíveis 
              e acessar informações sobre nossa empresa. Os agendamentos estão sujeitos à disponibilidade dos profissionais.
            </p>
            
            <h3>3. Cadastro e Conta de Usuário</h3>
            <p>
              Para utilizar todas as funcionalidades do aplicativo, é necessário criar uma conta. Você é responsável por manter 
              a confidencialidade de suas informações de login e por todas as atividades realizadas com sua conta.
            </p>
            
            <h3>4. Agendamentos e Cancelamentos</h3>
            <p>
              Agendamentos podem ser realizados com pelo menos 2 horas de antecedência. Cancelamentos devem ser feitos com, 
              no mínimo, 2 horas de antecedência do horário agendado. Cancelamentos tardios ou não comparecimento podem 
              resultar em penalidades conforme nossa política de cancelamento.
            </p>
            
            <h3>5. Programa de Fidelidade</h3>
            <p>
              Nosso programa de fidelidade permite acumular pontos a cada serviço realizado. Os pontos podem ser trocados 
              por descontos e serviços gratuitos conforme as regras do programa vigentes no momento da troca.
            </p>
            
            <h3>6. Limitação de Responsabilidade</h3>
            <p>
              O aplicativo Los Barbeiros CBS é fornecido "como está", sem garantias de qualquer tipo. Não nos responsabilizamos 
              por quaisquer danos diretos, indiretos, incidentais ou consequenciais resultantes do uso ou incapacidade de usar 
              nosso aplicativo.
            </p>
            
            <h3>7. Produtos e Serviços</h3>
            <p>
              As descrições e imagens de produtos e serviços no aplicativo são apenas para fins informativos. Reservamo-nos o 
              direito de modificar, descontinuar ou atualizar produtos e serviços a qualquer momento sem aviso prévio.
            </p>
            
            <h3>8. Propriedade Intelectual</h3>
            <p>
              Todo o conteúdo disponível no aplicativo, incluindo mas não limitado a texto, gráficos, logotipos, ícones, 
              imagens, clipes de áudio, downloads digitais e compilações de dados, é propriedade exclusiva de Los Barbeiros CBS 
              ou de seus fornecedores de conteúdo e é protegido pelas leis de direitos autorais.
            </p>
            
            <h3>9. Alterações nos Termos</h3>
            <p>
              Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento, e tais modificações terão efeito 
              imediato após a publicação no aplicativo. Ao continuar utilizando o aplicativo após a publicação das alterações, 
              você aceita e concorda com os novos termos.
            </p>
            
            <h3>10. Legislação Aplicável</h3>
            <p>
              Estes Termos de Uso são regidos e interpretados de acordo com as leis do Brasil. Qualquer disputa decorrente 
              destes Termos será submetida à jurisdição exclusiva dos tribunais da comarca onde está localizada nossa 
              sede principal.
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

export default TermsOfUse;