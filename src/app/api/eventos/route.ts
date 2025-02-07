export const dynamic = 'force-dynamic';

import { eventoModel } from '@/models/evento';

export async function GET(request: Request) {
  try {
    const usuarios = await eventoModel.getAllEventos();
    return Response.json(usuarios, { status: 200 });
  } catch (error: any) {
    return Response.json(error, { status: 500 });
  }
}
