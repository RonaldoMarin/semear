import { Usuarios } from "./usuarios"

export interface Responsavel {
  id: number
  nome_responsavel: string
  telefone_responsavel: string
  dependente_id: number
  usuario: Usuarios[]
}
