
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useProfessionals } from "@/lib/hooks/useProfessionals";

interface ProfessionalsManagementProps {
  canEdit: boolean;
}

export default function ProfessionalsManagement({ canEdit }: ProfessionalsManagementProps) {
  const { professionals, isLoadingProfessionals } = useProfessionals();

  if (isLoadingProfessionals) {
    return <div>Carregando profissionais...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Profissionais</h2>
        {canEdit && (
          <Button>Adicionar Profissional</Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Especialidade</TableHead>
            <TableHead>Status</TableHead>
            {canEdit && <TableHead>Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {professionals.map((professional) => (
            <TableRow key={professional.id}>
              <TableCell>{professional.name}</TableCell>
              <TableCell>{professional.specialty}</TableCell>
              <TableCell>{professional.status || 'Ativo'}</TableCell>
              {canEdit && (
                <TableCell>
                  <Button variant="ghost" size="sm">Editar</Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
