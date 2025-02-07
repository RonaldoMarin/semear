import { NextResponse } from 'next/server';
import { eventoModel } from '@/models/evento';

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const usuario = await eventoModel.updateEvento(parseInt(id), body);

    return new NextResponse(JSON.stringify(usuario), { status: 200 });
  } catch (error: any) {
    console.error(error);
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}
