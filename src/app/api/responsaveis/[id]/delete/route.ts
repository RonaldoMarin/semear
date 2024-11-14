import { NextResponse } from 'next/server';
import { responsavelModel } from '@/models/responsaveis';

// TODO Resolver isso aqui depois
// https://chatgpt.com/share/673608c2-95f0-800a-b49b-5b0a475321cd
export async function DELETE(
  _request: Request,
  context: { params: { id: string } }
) {
  const { id } = await context.params;

  try {
    await responsavelModel.deleteResponsavelByUsuarioIdAndId(parseInt(id));

    return NextResponse.json(
      { message: 'Responsável deletado com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
