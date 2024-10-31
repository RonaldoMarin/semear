import { NextResponse } from 'next/server';
import { usuarioModel } from '@/models/usuarios';

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = await context.params;

  try {
    await usuarioModel.deleteUsuario(parseInt(id));

    return NextResponse.json(
      { message: 'Usuário deletado com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
