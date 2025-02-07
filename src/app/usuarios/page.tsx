'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Usuarios } from '@/interfaces/usuarios';

export default function UsuariosPage() {
  const columns: ColumnDef<Usuarios>[] = [
    { accessorKey: 'nome', header: 'Nome' },
  ];
}
