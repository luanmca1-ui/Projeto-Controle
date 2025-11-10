
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: { unidadeId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const ultimoRegistro = await prisma.registroDiario.findFirst({
      where: {
        unidadeId: params.unidadeId
      },
      orderBy: {
        data: 'desc'
      }
    })

    const saldoAnterior = ultimoRegistro?.saldoFinal || 0

    return NextResponse.json({ 
      saldoAnterior: Number(saldoAnterior) 
    })
  } catch (error) {
    console.error('Erro ao buscar saldo anterior:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
