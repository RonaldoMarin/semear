import { Responsavel } from '@/interfaces/responsavel';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getResponsavelByUsuarioId = async (usuario_id: number) => {
  return await prisma.responsavel.findMany({
    where: { usuario_id },
  });
};

const getResponsavelById = async (responsavel_id: number) => {
  return await prisma.responsavel.findUnique({
    where: { id: responsavel_id },
  });
};

const createResponsavel = async (
  usuario_id: number,
  nome_responsavel: string,
  telefone_responsavel: string
) => {
  return await prisma.responsavel.create({
    data: {
      usuario_id,
      nome_responsavel,
      telefone_responsavel,
    },
  });
};

const updateResponsavel = async (data: Partial<Responsavel>) => {
  return await prisma.responsavel.update({
    where: {
      id: data.id,
    },
    data: {
      nome_responsavel: data?.nome_responsavel,
      telefone_responsavel: data?.telefone_responsavel,
    },
  });
};

const deleteResponsavelByUsuarioId = async (responsavel_id: number) => {
  return await prisma.responsavel.delete({
    where: { id: responsavel_id },
  });
};

export const responsavelModel = {
  getResponsavelByUsuarioId,
  getResponsavelById,
  createResponsavel,
  updateResponsavel,
  deleteResponsavelByUsuarioId,
};
