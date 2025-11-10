
import LoginForm from '@/components/login-form'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Scissors } from 'lucide-react'

export const dynamic = "force-dynamic"

export default async function LoginPage() {
  const session = await auth()

  if (session?.user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <Scissors className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">THE BARBER</h1>
            <p className="text-gray-600 mt-2">Controle de Caixa</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
