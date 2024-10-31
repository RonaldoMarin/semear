import { NextResponse } from 'next/server';

import { usuarioModel } from '@/models/usuarios';

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  try {
    console.log(id);
    const body = await request.json();
    const usuario = await usuarioModel.updateUsuario(parseInt(id), body);

    return new NextResponse(JSON.stringify(usuario), { status: 200 });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}
