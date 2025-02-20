export const dynamic = 'force-dynamic';

import { inscricaoModel } from '@/models/inscricao';

export async function GET(request: Request) {
  try {
    const usuarios = await inscricaoModel.getAllInscricoes();
    return Response.json(usuarios, { status: 200 });
  } catch (error: any) {
    return Response.json(error, { status: 500 });
  }
}
