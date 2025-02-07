import { NextResponse } from 'next/server';
import { inscricaoModel } from '@/models/inscricao';

export async function DELETE(
  _request: Request,
  context: { params: { id: string } }
) {
  const { id } = await context.params;

  try {
    await inscricaoModel.deleteInscricao(parseInt(id));

    return NextResponse.json(
      { message: 'Inscrição deletado com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
