export const dynamic = 'force-dynamic';

import { usuarioModel } from '@/models/usuarios';

export async function GET(request: Request) {
  try {
    const usuarios = await usuarioModel.getAllUsuarios();
    return Response.json(usuarios, { status: 200 });
  } catch (error: any) {
    return Response.json(error, { status: 500 });
  }
}
