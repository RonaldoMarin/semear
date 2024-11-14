import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getResponsavelByUsuarioId = async (usuario_id: number) => {
  return await prisma.responsavel.findMany({
    where: {
      usuario_id,
    },
  });
};

const deleteResponsavelByUsuarioIdAndId = async (
  usuario_id: number,
  responsavel_id: number
) => {
  return await prisma.responsavel.delete({
    where: {
      id: responsavel_id, // Deleta o responsável pelo ID
      usuario_id, // Verifica se o responsável pertence ao usuário com o usuario_id
    },
  });
};

const updateResponsavel = async () => {};

export const responsavelModel = {
  getResponsavelByUsuarioId,
  deleteResponsavelByUsuarioIdAndId,
};
