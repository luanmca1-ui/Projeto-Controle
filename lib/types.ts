
import { Decimal } from '@prisma/client/runtime/library'
import { JsonValue } from '@prisma/client/runtime/library'

declare module "next-auth" {
  interface User {
    id: string
    name?: string | null
    email: string
    role: string
  }
  
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
  }
}

export interface User {
  id: string
  name?: string | null
  email: string
  role: string
}

export interface Unidade {
  id: string
  nome: string
  endereco?: string | null
  ativa: boolean
}

export interface VendaBebida {
  item: string
  quantidade: number
  valor: number
}

export interface Saida {
  descricao: string
  valor: number
}

export interface RegistroDiario {
  id: string
  data: Date
  horarioFechamento: string
  unidadeId: string
  responsavelId: string
  clientes: number
  cortes: number
  corteInfantil: number
  corteFeminino: number
  barbas: number
  barbaTerapia: number
  sobrancelha: number
  desenho: number
  pezinho: number
  freestyle: number
  esfoliacao: number
  limpezaPele: number
  vendaProdutos?: string | null
  vendasBebidas?: JsonValue | null
  estoqueAgua: number
  estoqueRefri: number
  estoqueCerveja: number
  debito: Decimal
  credito: Decimal
  pix: Decimal
  dinheiro: Decimal
  totalEntradas: Decimal
  saidas?: JsonValue | null
  totalSaidas: Decimal
  saldoAnterior: Decimal
  saldoFinal: Decimal
  unidade: Unidade
  responsavel: User
  createdAt: Date
  updatedAt: Date
}

export interface FormRegistroDiario {
  unidadeId: string
  horarioFechamento: string
  clientes: number
  cortes: number
  corteInfantil: number
  corteFeminino: number
  barbas: number
  barbaTerapia: number
  sobrancelha: number
  desenho: number
  pezinho: number
  freestyle: number
  esfoliacao: number
  limpezaPele: number
  vendaProdutos: string
  vendasBebidas: VendaBebida[]
  estoqueAgua: number
  estoqueRefri: number
  estoqueCerveja: number
  debito: number
  credito: number
  pix: number
  dinheiro: number
  saidas: Saida[]
}
