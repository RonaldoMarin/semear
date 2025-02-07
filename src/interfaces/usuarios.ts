import { Responsavel } from './responsavel';

export interface Usuarios {
  id: number;
  nome: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  email: string;
  igreja: string;
  data_cadastro: string;
  data_atualizacao: string;
  Responsavel: Responsavel[];
}

// import { Responsavel } from './responsavel';

// export interface Usuarios {
//   id: number;
//   nome: string;
//   cpf: string;
//   data_nascimento: string;
//   telefone: string;
//   igreja: string;
//   data_cadastro: string;
//   data_atualizacao: string;
//   Responsavel: Responsavel | Responsavel[] | undefined;
// }
