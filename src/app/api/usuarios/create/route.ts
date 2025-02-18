import { usuarioModel } from '@/models/usuarios';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body: any = await request.json();

    console.log('ESSE É O RETORNO DA API', body);
    const novoUsuario = await usuarioModel.createUsuario(body);
    return new NextResponse(JSON.stringify(novoUsuario), { status: 200 });
  } catch (error: any) {
    console.log(error);
    return new NextResponse(JSON.stringify(error), { status: 500 });
  }
}
