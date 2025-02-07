export interface Evento {
  id: number;
  nome_evento: string;
  data_evento: string; // ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)
  local_evento: string;
  data_cadastro: string;
  data_atualizacao: string;
}
