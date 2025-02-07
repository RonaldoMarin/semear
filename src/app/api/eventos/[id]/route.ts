import { eventoModel } from '@/models/evento';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  try {
    const usuario = await eventoModel.getEventoById(parseInt(id));
    return Response.json(usuario, { status: 200 });
  } catch (error: any) {
    return Response.json(error, { status: 500 });
  }
}
