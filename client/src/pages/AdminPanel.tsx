
import { useAuth } from "@/lib/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { Redirect } from "wouter";

// Componentes específicos do admin panel
import ProfessionalsManagement from "@/components/admin/ProfessionalsManagement";
import AppointmentsManagement from "@/components/admin/AppointmentsManagement";
import FinancialManagement from "@/components/admin/FinancialManagement";
import ProductsManagement from "@/components/admin/ProductsManagement";
import ServicesManagement from "@/components/admin/ServicesManagement";

export default function AdminPanel() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!user || !["admin", "secretary", "professional"].includes(user.role)) {
    return <Redirect to="/" />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Painel Administrativo</h1>
      
      <Tabs defaultValue="appointments">
        <TabsList className="mb-4">
          <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
          {(user.role === "admin" || user.role === "secretary") && (
            <>
              <TabsTrigger value="professionals">Profissionais</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
              <TabsTrigger value="products">Produtos</TabsTrigger>
              <TabsTrigger value="services">Serviços</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="appointments">
          <AppointmentsManagement userRole={user.role} userId={user.id} />
        </TabsContent>

        {(user.role === "admin" || user.role === "secretary") && (
          <>
            <TabsContent value="professionals">
              <ProfessionalsManagement canEdit={user.role === "admin"} />
            </TabsContent>
            
            <TabsContent value="financial">
              <FinancialManagement />
            </TabsContent>

            <TabsContent value="products">
              <ProductsManagement canEdit={user.role === "admin"} />
            </TabsContent>

            <TabsContent value="services">
              <ServicesManagement canEdit={user.role === "admin"} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
