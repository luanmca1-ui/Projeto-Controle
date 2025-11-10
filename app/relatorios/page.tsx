
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import dynamicImport from 'next/dynamic'

const RelatoriosClient = dynamicImport(() => import('@/components/relatorios-client'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50">
      <div className="animate-pulse">
        <div className="h-16 bg-white shadow-sm border-b"></div>
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        </div>
      </div>
    </div>
  )
})

export const dynamic = "force-dynamic"

// Helper para converter Decimal para number
function serializeRegistro(registro: any) {
  return {
    ...registro,
    debito: Number(registro.debito),
    credito: Number(registro.credito),
    pix: Number(registro.pix),
    dinheiro: Number(registro.dinheiro),
    totalEntradas: Number(registro.totalEntradas),
    totalSaidas: Number(registro.totalSaidas),
    saldoAnterior: Number(registro.saldoAnterior),
    saldoFinal: Number(registro.saldoFinal)
  }
}

export default async function RelatoriosPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
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

  const unidades = await prisma.unidade.findMany({
    where: { ativa: true },
    orderBy: { nome: 'asc' }
  })

  // Serializar registros convertendo Decimal para number
  const registrosSerializados = registros.map(serializeRegistro)

  return <RelatoriosClient registros={registrosSerializados} unidades={unidades} />
}
