import { NextResponse } from 'next/server';
import { eventoModel } from '@/models/evento';

export async function DELETE(
  _request: Request,
  context: { params: { id: string } }
) {
  const { id } = await context.params;

  try {
    await eventoModel.deleteEvento(parseInt(id));

    return NextResponse.json(
      { message: 'Evento deletado com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
