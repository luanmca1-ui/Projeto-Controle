
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import dynamicImport from 'next/dynamic'

const ResumoClient = dynamicImport(() => import('@/components/resumo-client'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50">
      <div className="animate-pulse">
        <div className="h-16 bg-white shadow-sm border-b"></div>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="bg-gray-200 rounded h-96"></div>
        </div>
      </div>
    </div>
  )
})

export const dynamic = "force-dynamic"

interface PageProps {
  params: { id: string }
}

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

export default async function ResumoPage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const registro = await prisma.registroDiario.findUnique({
    where: { id: params.id },
    include: {
      unidade: true,
      responsavel: true
    }
  })

  if (!registro) {
    notFound()
  }

  // Serializar registro convertendo Decimal para number
  const registroSerializado = serializeRegistro(registro)

  return <ResumoClient registro={registroSerializado} />
}
