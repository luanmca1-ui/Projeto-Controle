
'use client'

import { useState, useMemo } from 'react'
import Navbar from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BarChart3, TrendingUp, AlertTriangle, Calendar, DollarSign, Users, Store } from 'lucide-react'
import { RegistroDiario, Unidade } from '@/lib/types'

interface RelatoriosClientProps {
  registros: (RegistroDiario & {
    unidade: { nome: string }
    responsavel: { name: string }
  })[]
  unidades: Unidade[]
}

export default function RelatoriosClient({ registros, unidades }: RelatoriosClientProps) {
  const [unidadeSelecionada, setUnidadeSelecionada] = useState('')
  const [periodoInicio, setPeriodoInicio] = useState('')
  const [periodoFim, setPeriodoFim] = useState('')

  const formatCurrency = (value: any) => {
    const num = Number(value) || 0
    return `R$ ${num.toFixed(2).replace('.', ',')}`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  // Filtrar registros baseado nos filtros selecionados
  const registrosFiltrados = useMemo(() => {
    return registros.filter(registro => {
      const matchUnidade = !unidadeSelecionada || unidadeSelecionada === 'all' || registro.unidadeId === unidadeSelecionada
      const matchInicio = !periodoInicio || new Date(registro.data) >= new Date(periodoInicio)
      const matchFim = !periodoFim || new Date(registro.data) <= new Date(periodoFim)
      
      return matchUnidade && matchInicio && matchFim
    })
  }, [registros, unidadeSelecionada, periodoInicio, periodoFim])

  // Estatísticas gerais
  const estatisticas = useMemo(() => {
    const totalRegistros = registrosFiltrados.length
    const totalClientes = registrosFiltrados.reduce((sum, r) => sum + r.clientes, 0)
    const totalEntradas = registrosFiltrados.reduce((sum, r) => sum + Number(r.totalEntradas), 0)
    const totalSaidas = registrosFiltrados.reduce((sum, r) => sum + Number(r.totalSaidas), 0)
    const saldoTotal = registrosFiltrados.reduce((sum, r) => sum + Number(r.saldoFinal), 0)
    const mediaClientes = totalRegistros > 0 ? totalClientes / totalRegistros : 0
    const mediaSaldo = totalRegistros > 0 ? saldoTotal / totalRegistros : 0

    return {
      totalRegistros,
      totalClientes,
      totalEntradas,
      totalSaidas,
      saldoTotal,
      mediaClientes,
      mediaSaldo
    }
  }, [registrosFiltrados])

  // Análise por unidade
  const analisePorUnidade = useMemo(() => {
    const analise = new Map()
    
    registrosFiltrados.forEach(registro => {
      const unidadeNome = registro.unidade?.nome || 'Desconhecida'
      if (!analise.has(unidadeNome)) {
        analise.set(unidadeNome, {
          nome: unidadeNome,
          totalRegistros: 0,
          totalClientes: 0,
          totalEntradas: 0,
          totalSaidas: 0,
          saldoTotal: 0,
          ultimoFechamento: null
        })
      }
      
      const dados = analise.get(unidadeNome)
      dados.totalRegistros += 1
      dados.totalClientes += registro.clientes
      dados.totalEntradas += Number(registro.totalEntradas)
      dados.totalSaidas += Number(registro.totalSaidas)
      dados.saldoTotal += Number(registro.saldoFinal)
      dados.ultimoFechamento = dados.ultimoFechamento 
        ? (new Date(registro.data) > new Date(dados.ultimoFechamento) ? registro.data : dados.ultimoFechamento)
        : registro.data
    })
    
    return Array.from(analise.values()).sort((a, b) => b.totalEntradas - a.totalEntradas)
  }, [registrosFiltrados])

  // Detecção de inconsistências
  const inconsistencias = useMemo(() => {
    const problemas: Array<{
      tipo: string
      registro: any
      descricao: string
      severidade: 'alta' | 'média' | 'baixa'
    }> = []
    
    registrosFiltrados.forEach((registro, index) => {
      // Verificar se saldo final está correto
      const saldoCalculado = Number(registro.saldoAnterior) + Number(registro.dinheiro) - Number(registro.totalSaidas)
      const diferenca = Math.abs(Number(registro.saldoFinal) - saldoCalculado)
      
      if (diferenca > 0.01) { // Diferença maior que 1 centavo
        problemas.push({
          tipo: 'Saldo Incorreto',
          registro: registro,
          descricao: `Saldo final deveria ser ${formatCurrency(saldoCalculado)}, mas está registrado como ${formatCurrency(registro.saldoFinal)}`,
          severidade: 'alta'
        })
      }
      
      // Verificar se total de entradas está correto
      const totalCalculado = Number(registro.debito) + Number(registro.credito) + Number(registro.pix) + Number(registro.dinheiro)
      const diferencaEntradas = Math.abs(Number(registro.totalEntradas) - totalCalculado)
      
      if (diferencaEntradas > 0.01) {
        problemas.push({
          tipo: 'Total Entradas Incorreto',
          registro: registro,
          descricao: `Total de entradas deveria ser ${formatCurrency(totalCalculado)}, mas está registrado como ${formatCurrency(registro.totalEntradas)}`,
          severidade: 'média'
        })
      }
      
      // Verificar registros sem clientes mas com faturamento
      if (registro.clientes === 0 && Number(registro.totalEntradas) > 0) {
        problemas.push({
          tipo: 'Clientes vs Faturamento',
          registro: registro,
          descricao: 'Registro com faturamento mas sem clientes registrados',
          severidade: 'baixa'
        })
      }
    })
    
    return problemas
  }, [registrosFiltrados])

  const limparFiltros = () => {
    setUnidadeSelecionada('all')
    setPeriodoInicio('')
    setPeriodoFim('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Relatórios e Análises
          </h1>
          <p className="text-gray-600">
            Análise detalhada dos fechamentos e identificação de inconsistências.
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filtros de Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Unidade</label>
                <Select value={unidadeSelecionada} onValueChange={setUnidadeSelecionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as unidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as unidades</SelectItem>
                    {unidades.map((unidade) => (
                      <SelectItem key={unidade.id} value={unidade.id}>
                        {unidade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Data Início</label>
                <Input
                  type="date"
                  value={periodoInicio}
                  onChange={(e) => setPeriodoInicio(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Data Fim</label>
                <Input
                  type="date"
                  value={periodoFim}
                  onChange={(e) => setPeriodoFim(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ações</label>
                <Button onClick={limparFiltros} variant="outline" className="w-full">
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Registros</p>
                  <p className="text-2xl font-bold text-blue-600">{estatisticas.totalRegistros}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Clientes</p>
                  <p className="text-2xl font-bold text-green-600">{estatisticas.totalClientes}</p>
                  <p className="text-xs text-gray-500">Média: {estatisticas.mediaClientes.toFixed(1)} por dia</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Entradas</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(estatisticas.totalEntradas)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Saldo Total</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(estatisticas.saldoTotal)}
                  </p>
                  <p className="text-xs text-gray-500">Média: {formatCurrency(estatisticas.mediaSaldo)} por dia</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Análise por Unidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Performance por Unidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analisePorUnidade.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum dado disponível para o período selecionado
                  </p>
                ) : (
                  analisePorUnidade.map((unidade, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {unidade.nome}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {unidade.totalRegistros} registro{unidade.totalRegistros !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Clientes:</span>
                          <span className="ml-2 font-medium">{unidade.totalClientes}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Entradas:</span>
                          <span className="ml-2 font-medium">{formatCurrency(unidade.totalEntradas)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Saídas:</span>
                          <span className="ml-2 font-medium">{formatCurrency(unidade.totalSaidas)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Saldo:</span>
                          <span className="ml-2 font-medium">{formatCurrency(unidade.saldoTotal)}</span>
                        </div>
                      </div>
                      {unidade.ultimoFechamento && (
                        <div className="mt-2 text-xs text-gray-500">
                          Último fechamento: {formatDate(unidade.ultimoFechamento)}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Inconsistências */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Inconsistências Detectadas
                {inconsistencias.length > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {inconsistencias.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {inconsistencias.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-green-100 rounded-full p-3 inline-block mb-4">
                      <BarChart3 className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-green-700 font-medium">Nenhuma inconsistência encontrada!</p>
                    <p className="text-green-600 text-sm">
                      Todos os registros estão com cálculos corretos.
                    </p>
                  </div>
                ) : (
                  inconsistencias.map((problema, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg border-l-4 ${
                        problema.severidade === 'alta' 
                          ? 'bg-red-50 border-red-500' 
                          : problema.severidade === 'média'
                          ? 'bg-yellow-50 border-yellow-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">
                          {problema.tipo}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          problema.severidade === 'alta'
                            ? 'bg-red-100 text-red-800'
                            : problema.severidade === 'média'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {problema.severidade}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {problema.descricao}
                      </p>
                      <div className="text-xs text-gray-500">
                        {problema.registro.unidade?.nome} - {formatDate(problema.registro.data)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Financeiro Detalhado */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro Detalhado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Entradas por Modalidade</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Débito:</span>
                    <span className="font-medium">
                      {formatCurrency(registrosFiltrados.reduce((sum, r) => sum + Number(r.debito), 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Crédito:</span>
                    <span className="font-medium">
                      {formatCurrency(registrosFiltrados.reduce((sum, r) => sum + Number(r.credito), 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">PIX:</span>
                    <span className="font-medium">
                      {formatCurrency(registrosFiltrados.reduce((sum, r) => sum + Number(r.pix), 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dinheiro:</span>
                    <span className="font-medium">
                      {formatCurrency(registrosFiltrados.reduce((sum, r) => sum + Number(r.dinheiro), 0))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Serviços Totais</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cortes:</span>
                    <span className="font-medium">{registrosFiltrados.reduce((sum, r) => sum + r.cortes, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Barbas:</span>
                    <span className="font-medium">{registrosFiltrados.reduce((sum, r) => sum + r.barbas, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sobrancelha:</span>
                    <span className="font-medium">{registrosFiltrados.reduce((sum, r) => sum + r.sobrancelha, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Outros:</span>
                    <span className="font-medium">
                      {registrosFiltrados.reduce((sum, r) => 
                        sum + r.corteInfantil + r.corteFeminino + r.barbaTerapia + 
                        r.desenho + r.pezinho + r.freestyle + r.esfoliacao + r.limpezaPele, 0
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Média por Registro</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Clientes/dia:</span>
                    <span className="font-medium">{estatisticas.mediaClientes.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Faturamento/dia:</span>
                    <span className="font-medium">
                      {formatCurrency(estatisticas.totalRegistros > 0 ? estatisticas.totalEntradas / estatisticas.totalRegistros : 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ticket médio:</span>
                    <span className="font-medium">
                      {formatCurrency(estatisticas.totalClientes > 0 ? estatisticas.totalEntradas / estatisticas.totalClientes : 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Saídas Totais</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Saídas:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(estatisticas.totalSaidas)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saldo Líquido:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(estatisticas.totalEntradas - estatisticas.totalSaidas)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
