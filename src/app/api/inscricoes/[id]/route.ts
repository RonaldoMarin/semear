import { inscricaoModel } from '@/models/inscricao';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  try {
    const inscricao = await inscricaoModel.getInscricaoById(parseInt(id));
    return Response.json(inscricao, { status: 200 });
  } catch (error: any) {
    return Response.json(error, { status: 500 });
  }
}
