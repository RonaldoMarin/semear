import { NextResponse } from 'next/server';
import { responsavelModel } from '@/models/responsaveis';

export async function PATCH(
  request: Request,
  context: { params: { usuario_id: string; responsavel_id: string } }
) {
  const responsavel_id = parseInt(context.params.responsavel_id);
  try {
    const body = await request.json();

    const responsavelAtualizado = await responsavelModel.updateResponsavel({
      id: body.id,
      nome_responsavel: body.nome_responsavel,
      telefone_responsavel: body.telefone_responsavel,
    });

    return new NextResponse(JSON.stringify(responsavelAtualizado), {
      status: 200,
    });
  } catch (error: any) {
    console.error(error);
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}
