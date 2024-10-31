import { usuarioModel } from '@/models/usuarios';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body: any = await request.json();
    console.log(body);
    const novoUsuario = await usuarioModel.createUsuario(body);
    return new NextResponse(JSON.stringify(novoUsuario), { status: 200 });
  } catch (error: any) {
    return new NextResponse(JSON.stringify(error), { status: 500 });
  }
}
