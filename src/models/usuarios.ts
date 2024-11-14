import { Usuarios } from '@/interfaces/usuarios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAllUsuarios = async (searchParams?: { [key: string]: any }) => {
  return await prisma.usuario.findMany({
    where: {
      ...(searchParams && {
        ...searchParams,
      }),
    },
    include: {
      Responsaveis: true,
    },
  });
};

const getUsuarioById = async (id: number) => {
  return await prisma.usuario.findUnique({
    where: {
      id: id,
    },
    include: {
      Responsaveis: true,
    },
  });
};

const createUsuario = async (data: Usuarios) => {
  return await prisma.usuario.create({
    data: {
      nome: data.nome,
      cpf: data.cpf,
      data_nascimento: data.data_nascimento,
      telefone: data.telefone,
      igreja: data.igreja,
      Responsaveis: {
        create: data.Responsavel.map((responsavel) => ({
          nome_responsavel: responsavel.nome_responsavel,
          telefone_responsavel: responsavel.telefone_responsavel,
        })),
      },
    },
  });
};

const updateUsuario = async (id: number, data: Partial<Usuarios>) => {
  return await prisma.usuario.update({
    where: { id },
    data: {
      nome: data.nome,
      cpf: data.cpf,
      data_nascimento: data.data_nascimento
        ? new Date(data.data_nascimento)
        : undefined,
      telefone: data.telefone,
      igreja: data.igreja,
    },
  });
};

const deleteUsuario = async (id: number) => {
  return await prisma.usuario.delete({
    where: {
      id: id,
    },
  });
};

export const usuarioModel = {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
};
