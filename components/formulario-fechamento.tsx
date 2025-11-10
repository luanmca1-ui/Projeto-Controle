
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus, Trash2, Calculator, Store, Clock, Users, Scissors } from 'lucide-react'
import { Unidade, VendaBebida, Saida, FormRegistroDiario } from '@/lib/types'

interface FormularioFechamentoProps {
  unidades: Unidade[]
}

export default function FormularioFechamento({ unidades }: FormularioFechamentoProps) {
  const { data: session } = useSession() || {}
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [saldoAnterior, setSaldoAnterior] = useState(0)

  const [formData, setFormData] = useState<FormRegistroDiario>({
    unidadeId: '',
    horarioFechamento: '',
    clientes: 0,
    cortes: 0,
    corteInfantil: 0,
    corteFeminino: 0,
    barbas: 0,
    barbaTerapia: 0,
    sobrancelha: 0,
    desenho: 0,
    pezinho: 0,
    freestyle: 0,
    esfoliacao: 0,
    limpezaPele: 0,
    vendaProdutos: '',
    vendasBebidas: [],
    estoqueAgua: 0,
    estoqueRefri: 0,
    estoqueCerveja: 0,
    debito: 0,
    credito: 0,
    pix: 0,
    dinheiro: 0,
    saidas: []
  })

  // Buscar saldo anterior quando unidade mudar
  useEffect(() => {
    if (formData.unidadeId) {
      fetchSaldoAnterior(formData.unidadeId)
    }
  }, [formData.unidadeId])

  const fetchSaldoAnterior = async (unidadeId: string) => {
    try {
      const response = await fetch(`/api/saldo-anterior/${unidadeId}`)
      if (response.ok) {
        const data = await response.json()
        setSaldoAnterior(data.saldoAnterior)
      }
    } catch (error) {
      console.error('Erro ao buscar saldo anterior:', error)
    }
  }

  // Cálculos automáticos
  const totalEntradas = formData.debito + formData.credito + formData.pix + formData.dinheiro
  const totalSaidas = formData.saidas.reduce((total, saida) => total + saida.valor, 0)
  const saldoFinal = saldoAnterior + formData.dinheiro - totalSaidas

  const addVendaBebida = () => {
    setFormData(prev => ({
      ...prev,
      vendasBebidas: [...prev.vendasBebidas, { item: '', quantidade: 0, valor: 0 }]
    }))
  }

  const removeVendaBebida = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vendasBebidas: prev.vendasBebidas.filter((_, i) => i !== index)
    }))
  }

  const updateVendaBebida = (index: number, field: keyof VendaBebida, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      vendasBebidas: prev.vendasBebidas.map((venda, i) => 
        i === index ? { ...venda, [field]: value } : venda
      )
    }))
  }

  const addSaida = () => {
    setFormData(prev => ({
      ...prev,
      saidas: [...prev.saidas, { descricao: '', valor: 0 }]
    }))
  }

  const removeSaida = (index: number) => {
    setFormData(prev => ({
      ...prev,
      saidas: prev.saidas.filter((_, i) => i !== index)
    }))
  }

  const updateSaida = (index: number, field: keyof Saida, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      saidas: prev.saidas.map((saida, i) => 
        i === index ? { ...saida, [field]: value } : saida
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!session?.user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado.',
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/registros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          responsavelId: session.user?.id,
          saldoAnterior,
          totalEntradas,
          totalSaidas,
          saldoFinal
        }),
      })

      if (response.ok) {
        const registro = await response.json()
        toast({
          title: 'Fechamento registrado com sucesso!',
          description: 'Redirecionando para o resumo...',
        })
        router.push(`/resumo/${registro.id}`)
      } else {
        const error = await response.json()
        toast({
          title: 'Erro ao salvar fechamento',
          description: error.error || 'Erro interno do servidor',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormField = (field: keyof FormRegistroDiario, value: string | number | VendaBebida[] | Saida[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="unidade">Unidade *</Label>
            <Select 
              value={formData.unidadeId} 
              onValueChange={(value) => updateFormField('unidadeId', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                {unidades.map((unidade) => (
                  <SelectItem key={unidade.id} value={unidade.id}>
                    {unidade.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="horario">Horário do Fechamento *</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="horario"
                placeholder="Ex: 22h"
                value={formData.horarioFechamento}
                onChange={(e) => updateFormField('horarioFechamento', e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Serviços e Volume de Atendimento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Serviços e Volume de Atendimento
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { field: 'clientes', label: 'Clientes', icon: Users },
            { field: 'cortes', label: 'Cortes', icon: Scissors },
            { field: 'corteInfantil', label: 'Corte Infantil', icon: Scissors },
            { field: 'corteFeminino', label: 'Corte Feminino', icon: Scissors },
            { field: 'barbas', label: 'Barbas', icon: Scissors },
            { field: 'barbaTerapia', label: 'Barba Terapia', icon: Scissors },
            { field: 'sobrancelha', label: 'Sobrancelha', icon: Scissors },
            { field: 'desenho', label: 'Desenho (Risco)', icon: Scissors },
            { field: 'pezinho', label: 'Pezinho', icon: Scissors },
            { field: 'freestyle', label: 'Freestyle', icon: Scissors },
            { field: 'esfoliacao', label: 'Esfoliação', icon: Scissors },
            { field: 'limpezaPele', label: 'Limpeza de Pele', icon: Scissors },
          ].map(({ field, label, icon: Icon }) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>{label}</Label>
              <Input
                id={field}
                type="number"
                min="0"
                value={formData[field as keyof FormRegistroDiario] as number}
                onChange={(e) => updateFormField(field as keyof FormRegistroDiario, parseInt(e.target.value) || 0)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="vendaProdutos">Produtos Vendidos</Label>
            <Textarea
              id="vendaProdutos"
              placeholder="Descreva os produtos vendidos..."
              value={formData.vendaProdutos}
              onChange={(e) => updateFormField('vendaProdutos', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Vendas de Bebidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Vendas de Bebidas
            <Button type="button" onClick={addVendaBebida} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.vendasBebidas.map((venda, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>Item</Label>
                <Input
                  placeholder="Ex: Água"
                  value={venda.item}
                  onChange={(e) => updateVendaBebida(index, 'item', e.target.value)}
                />
              </div>
              <div className="w-24">
                <Label>Qtd</Label>
                <Input
                  type="number"
                  min="0"
                  value={venda.quantidade}
                  onChange={(e) => updateVendaBebida(index, 'quantidade', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="w-32">
                <Label>Valor</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={venda.valor}
                  onChange={(e) => updateVendaBebida(index, 'valor', parseFloat(e.target.value) || 0)}
                />
              </div>
              <Button 
                type="button" 
                onClick={() => removeVendaBebida(index)}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {formData.vendasBebidas.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              Nenhuma venda de bebida registrada. Clique em "Adicionar" para incluir.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Estoque de Bebidas */}
      <Card>
        <CardHeader>
          <CardTitle>Estoque de Bebidas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estoqueAgua">Água</Label>
            <Input
              id="estoqueAgua"
              type="number"
              min="0"
              value={formData.estoqueAgua}
              onChange={(e) => updateFormField('estoqueAgua', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estoqueRefri">Refrigerante</Label>
            <Input
              id="estoqueRefri"
              type="number"
              min="0"
              value={formData.estoqueRefri}
              onChange={(e) => updateFormField('estoqueRefri', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estoqueCerveja">Cerveja</Label>
            <Input
              id="estoqueCerveja"
              type="number"
              min="0"
              value={formData.estoqueCerveja}
              onChange={(e) => updateFormField('estoqueCerveja', parseInt(e.target.value) || 0)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Entradas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Entradas (Formas de Pagamento)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="debito">Débito (R$)</Label>
              <Input
                id="debito"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={formData.debito}
                onChange={(e) => updateFormField('debito', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credito">Crédito (R$)</Label>
              <Input
                id="credito"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={formData.credito}
                onChange={(e) => updateFormField('credito', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pix">PIX (R$)</Label>
              <Input
                id="pix"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={formData.pix}
                onChange={(e) => updateFormField('pix', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dinheiro">Dinheiro (R$)</Label>
              <Input
                id="dinheiro"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={formData.dinheiro}
                onChange={(e) => updateFormField('dinheiro', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-lg font-semibold text-blue-900">
              Total de Entradas: R$ {totalEntradas.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Saídas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Saídas
            <Button type="button" onClick={addSaida} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.saidas.map((saida, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>Descrição</Label>
                <Input
                  placeholder="Ex: Diária domingo"
                  value={saida.descricao}
                  onChange={(e) => updateSaida(index, 'descricao', e.target.value)}
                />
              </div>
              <div className="w-32">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={saida.valor}
                  onChange={(e) => updateSaida(index, 'valor', parseFloat(e.target.value) || 0)}
                />
              </div>
              <Button 
                type="button" 
                onClick={() => removeSaida(index)}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {formData.saidas.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              Nenhuma saída registrada. Clique em "Adicionar" para incluir.
            </p>
          )}
          
          {totalSaidas > 0 && (
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-lg font-semibold text-red-900">
                Total de Saídas: R$ {totalSaidas.toFixed(2).replace('.', ',')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo de Saldos */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Saldos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Saldo Anterior</p>
              <p className="text-xl font-bold">R$ {saldoAnterior.toFixed(2).replace('.', ',')}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Dinheiro Recebido</p>
              <p className="text-xl font-bold text-green-700">R$ {formData.dinheiro.toFixed(2).replace('.', ',')}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Saldo Final</p>
              <p className="text-xl font-bold text-blue-700">R$ {saldoFinal.toFixed(2).replace('.', ',')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Registrar Fechamento'
          )}
        </Button>
      </div>
    </form>
  )
}
