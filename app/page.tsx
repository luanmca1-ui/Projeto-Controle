
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import dynamicImport from 'next/dynamic'

const DashboardClient = dynamicImport(() => import('@/components/dashboard-client'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50">
      <div className="animate-pulse">
        <div className="h-16 bg-white shadow-sm border-b"></div>
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
})

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const unidades = await prisma.unidade.findMany({
    where: { ativa: true },
    orderBy: { nome: 'asc' }
  })

  return <DashboardClient unidades={unidades} />
}
