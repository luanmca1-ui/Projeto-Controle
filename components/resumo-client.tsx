
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy, ArrowLeft, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { RegistroDiario, VendaBebida, Saida } from '@/lib/types'

interface ResumoClientProps {
  registro: RegistroDiario & {
    unidade: { nome: string }
    responsavel: { name: string }
  }
}

export default function ResumoClient({ registro }: ResumoClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isCopying, setIsCopying] = useState(false)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (value: any) => {
    const num = Number(value) || 0
    return num.toFixed(2).replace('.', ',')
  }

  const generateResumo = () => {
    const vendasBebidas = (Array.isArray(registro.vendasBebidas) ? registro.vendasBebidas : []) as unknown as VendaBebida[]
    const saidas = (Array.isArray(registro.saidas) ? registro.saidas : []) as unknown as Saida[]

    const vendasBebidasText = vendasBebidas.length > 0
      ? vendasBebidas.map(v => `${v.quantidade} ${v.item} ${formatCurrency(v.valor)}`).join('\n')
      : 'Nenhuma venda...'

    const saidasText = saidas.length > 0
      ? saidas.map(s => `• ${s.descricao} R$${formatCurrency(s.valor)}`).join('\n')
      : 'Nenhuma saída...'

    return `FECHAMENTO DAS ${registro.horarioFechamento}
${formatDate(registro.data)}

Responsável: ${registro.responsavel?.name}

${registro.unidade?.nome}

- Clientes: ${registro.clientes.toString().padStart(2, '0')}
- Cortes: ${registro.cortes.toString().padStart(2, '0')}
- Corte infantil: ${registro.corteInfantil.toString().padStart(2, '0')}
- Corte Feminino: ${registro.corteFeminino.toString().padStart(2, '0')}
- Barbas: ${registro.barbas.toString().padStart(2, '0')}
- Barba terapia: ${registro.barbaTerapia.toString().padStart(2, '0')}
- Sobrancelha: ${registro.sobrancelha.toString().padStart(2, '0')}
- Desenho (Risco): ${registro.desenho.toString().padStart(2, '0')}
- Pezinho: ${registro.pezinho.toString().padStart(2, '0')}
- Freestyle: ${registro.freestyle.toString().padStart(2, '0')}
- Esfoliação: ${registro.esfoliacao.toString().padStart(2, '0')}
- Limpeza de pele: ${registro.limpezaPele.toString().padStart(2, '0')}

VENDAS DE PRODUTOS
${registro.vendaProdutos || 'Nenhuma venda...'}

Vendas De Bebidas
${vendasBebidasText}

Estoque de bebida
• Água: ${registro.estoqueAgua.toString().padStart(2, '0')}
• Refri: ${registro.estoqueRefri.toString().padStart(2, '0')}
• Cerveja: ${registro.estoqueCerveja.toString().padStart(2, '0')}

ENTRADAS
- Débito: R$: ${formatCurrency(registro.debito)}
- Crédito: R$: ${formatCurrency(registro.credito)}
- PIX: R$: ${formatCurrency(registro.pix)}
- Dinheiro: R$: ${formatCurrency(registro.dinheiro)}
____________________
Total: ${formatCurrency(registro.totalEntradas)}

SAÍDA
${saidasText}

Saldo de caixa R$: ${formatCurrency(registro.saldoFinal)}`
  }

  const handleCopyToWhatsApp = async () => {
    setIsCopying(true)
    try {
      const resumoText = generateResumo()
      await navigator.clipboard.writeText(resumoText)
      toast({
        title: 'Resumo copiado!',
        description: 'O texto foi copiado para a área de transferência. Cole no WhatsApp.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o resumo.',
        variant: 'destructive',
      })
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button 
              onClick={() => router.back()}
              variant="ghost" 
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Resumo do Fechamento
            </h1>
            <p className="text-gray-600">
              {formatDate(registro.data)} - {registro.unidade?.nome}
            </p>
          </div>
          <Button 
            onClick={handleCopyToWhatsApp}
            disabled={isCopying}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            {isCopying ? 'Copiando...' : 'Copiar para WhatsApp'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resumo Formatado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg border">
              {generateResumo()}
            </pre>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{registro.clientes}</p>
                <p className="text-sm text-gray-600">Total de Clientes</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  R$ {formatCurrency(registro.totalEntradas)}
                </p>
                <p className="text-sm text-gray-600">Total de Entradas</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  R$ {formatCurrency(registro.totalSaidas)}
                </p>
                <p className="text-sm text-gray-600">Total de Saídas</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  R$ {formatCurrency(registro.saldoFinal)}
                </p>
                <p className="text-sm text-gray-600">Saldo Final</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
