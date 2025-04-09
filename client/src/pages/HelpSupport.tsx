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
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Mail, Phone, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const HelpSupport = () => {
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Mensagem enviada",
      description: "Entraremos em contato em breve!",
    });
    // Aqui seria integrado com um sistema real de suporte
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header showBackButton title="Ajuda & Suporte" />
      
      <main className="flex-1 p-4 space-y-6 pb-20">
        {/* Perguntas Frequentes */}
        <Card>
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
            <CardDescription>Respostas para as dúvidas mais comuns</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Como faço para agendar um serviço?</AccordionTrigger>
                <AccordionContent>
                  Para agendar um serviço, acesse a aba "Agenda" no menu inferior, selecione o serviço 
                  desejado, escolha o profissional, data e horário disponíveis e confirme seu agendamento.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>Como posso cancelar ou reagendar?</AccordionTrigger>
                <AccordionContent>
                  Acesse "Perfil" no menu inferior e vá para "Meus Agendamentos". Encontre o agendamento 
                  que deseja alterar e selecione a opção de cancelar ou reagendar. Lembre-se que 
                  cancelamentos devem ser feitos com pelo menos 2 horas de antecedência.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Como funciona o programa de fidelidade?</AccordionTrigger>
                <AccordionContent>
                  A cada serviço realizado, você acumula pontos que podem ser trocados por 
                  recompensas, como descontos e serviços gratuitos. Você pode verificar seu 
                  saldo de pontos na página de perfil.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>Como recupero minha senha?</AccordionTrigger>
                <AccordionContent>
                  Na tela de login, clique em "Esqueci minha senha". Digite seu e-mail cadastrado 
                  e enviaremos um link para redefinição da senha. Verifique também sua pasta de spam.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>Os produtos estão disponíveis para compra online?</AccordionTrigger>
                <AccordionContent>
                  Atualmente, os produtos exibidos no aplicativo estão disponíveis apenas para 
                  compra presencial em nossa loja física. Em breve teremos a opção de compra online.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        
        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle>Entre em Contato</CardTitle>
            <CardDescription>Preencha o formulário abaixo ou utilize outros canais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Nome</label>
                    <Input id="name" required placeholder="Seu nome completo" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input id="email" type="email" required placeholder="seu.email@exemplo.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">Assunto</label>
                    <Input id="subject" required placeholder="Qual o motivo do contato?" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">Mensagem</label>
                    <Textarea 
                      id="message" 
                      required 
                      placeholder="Descreva sua dúvida ou solicitação" 
                      rows={4}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">Enviar Mensagem</Button>
                </form>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-4">Outros Canais</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Telefone</p>
                      <p className="text-muted-foreground">(61) 3333-4444</p>
                      <p className="text-sm text-muted-foreground">Seg-Sáb, 9h às 20h</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">contato@losbarbeiroscbs.com.br</p>
                      <p className="text-sm text-muted-foreground">Respondemos em até 24h</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">WhatsApp</p>
                      <p className="text-muted-foreground">(61) 99999-8888</p>
                      <p className="text-sm text-muted-foreground">Atendimento instantâneo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

export default HelpSupport;