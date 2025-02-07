import { inscricaoModel } from '@/models/inscricao';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body: any = await request.json();
    const novoUsuario = await inscricaoModel.createInscricao(body);
    return new NextResponse(JSON.stringify(novoUsuario), { status: 200 });
  } catch (error: any) {
    console.log(error);
    return new NextResponse(JSON.stringify(error), { status: 500 });
  }
}
