import { Usuarios } from './usuarios';
import { Evento } from './evento';

export interface Inscricao {
  id: number;
  usuario_id: number;
  evento_id: number;
  data_inscricao: string;

  usuario: Usuarios[];
  evento: Evento[];

  quantidade_camisas?: number;
  observacoes?: string;

  experiencia_missionaria?: string;
  experiencia_evangelistica?: string;

  nome_pastor: string;
  telefone_pastor: string;

  area_atuacao_igreja?: string;
  tamanho_camisa?: string;
}
