
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const data = await request.json()

    const registro = await prisma.registroDiario.create({
      data: {
        data: new Date(),
        horarioFechamento: data.horarioFechamento,
        unidadeId: data.unidadeId,
        responsavelId: data.responsavelId,
        clientes: data.clientes,
        cortes: data.cortes,
        corteInfantil: data.corteInfantil,
        corteFeminino: data.corteFeminino,
        barbas: data.barbas,
        barbaTerapia: data.barbaTerapia,
        sobrancelha: data.sobrancelha,
        desenho: data.desenho,
        pezinho: data.pezinho,
        freestyle: data.freestyle,
        esfoliacao: data.esfoliacao,
        limpezaPele: data.limpezaPele,
        vendaProdutos: data.vendaProdutos || null,
        vendasBebidas: data.vendasBebidas || [],
        estoqueAgua: data.estoqueAgua,
        estoqueRefri: data.estoqueRefri,
        estoqueCerveja: data.estoqueCerveja,
        debito: data.debito,
        credito: data.credito,
        pix: data.pix,
        dinheiro: data.dinheiro,
        totalEntradas: data.totalEntradas,
        saidas: data.saidas || [],
        totalSaidas: data.totalSaidas,
        saldoAnterior: data.saldoAnterior,
        saldoFinal: data.saldoFinal,
      },
      include: {
        unidade: true,
        responsavel: true
      }
    })

    return NextResponse.json(registro, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar registro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const registros = await prisma.registroDiario.findMany({
      include: {
        unidade: true,
        responsavel: true
      },
      orderBy: {
        data: 'desc'
      }
    })

    return NextResponse.json(registros)
  } catch (error) {
    console.error('Erro ao buscar registros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
