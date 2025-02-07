import { Inscricao } from '@/interfaces/inscricao';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAllInscricoes = async (searchParams?: { [key: string]: any }) => {
  return await prisma.inscricao.findMany({
    where: {
      ...(searchParams && {
        ...searchParams,
      }),
    },
    include: {
      usuario: true, // Traz os dados do usuário que fez a inscrição
      evento: true, // Traz os dados do evento no qual foi inscrito
    },
  });
};

const getInscricaoById = async (id: number) => {
  return await prisma.inscricao.findUnique({
    where: { id },
    include: {
      usuario: true,
      evento: true,
    },
  });
};

const createInscricao = async (data: Inscricao) => {
  return await prisma.inscricao.create({
    data,
  });
};

const updateInscricao = async (
  id: number,
  data: Partial<typeof createInscricao>
) => {
  return await prisma.inscricao.update({
    where: { id },
    data,
  });
};

const deleteInscricao = async (id: number) => {
  return await prisma.inscricao.delete({
    where: { id },
  });
};

export const inscricaoModel = {
  getAllInscricoes,
  getInscricaoById,
  createInscricao,
  updateInscricao,
  deleteInscricao,
};
