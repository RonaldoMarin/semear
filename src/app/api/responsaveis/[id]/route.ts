import { responsavelModel } from '@/models/responsaveis';

export async function GET(
  _request: Request,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  try {
    const responsavelPorUsuario =
      await responsavelModel.getResponsavelByUsuarioId(parseInt(id));
    return Response.json(responsavelPorUsuario, { status: 200 });
  } catch (error: any) {
    return Response.json(error, { status: 500 });
  }
}
