import { Evento } from '@/interfaces/evento';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAllEventos = async (searchParams?: { [key: string]: any }) => {
  return await prisma.evento.findMany({
    where: {
      ...(searchParams && {
        ...searchParams,
      }),
    },
    include: {
      inscricoes: {
        include: {
          usuario: {
            include: {
              Responsaveis: true,
            },
          },
        },
      }, // Inclui inscrições associadas ao evento
    },
  });
};

const getEventoById = async (id: number) => {
  return await prisma.evento.findUnique({
    where: { id },
    include: {
      inscricoes: {
        include: {
          usuario: {
            include: {
              Responsaveis: true,
            },
          },
        },
      }, // Inclui inscrições associadas ao evento
    },
  });
};

const createEvento = async (data: Evento) => {
  return await prisma.evento.create({
    data,
  });
};

const updateEvento = async (id: number, data: Partial<Evento>) => {
  return await prisma.evento.update({
    where: { id },
    data: {
      nome_evento: data?.data_evento,
      data_evento: data?.data_evento,
      local_evento: data?.data_evento,
    },
  });
};

const deleteEvento = async (id: number) => {
  return await prisma.evento.delete({
    where: { id },
  });
};

export const eventoModel = {
  getAllEventos,
  getEventoById,
  createEvento,
  updateEvento,
  deleteEvento,
};
