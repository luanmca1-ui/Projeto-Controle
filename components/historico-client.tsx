
'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { History, Search, Filter, Eye, Download, Calendar } from 'lucide-react'
import Link from 'next/link'
import { RegistroDiario, Unidade } from '@/lib/types'

interface HistoricoClientProps {
  registros: (RegistroDiario & {
    unidade: { nome: string }
    responsavel: { name: string }
  })[]
  unidades: Unidade[]
}

export default function HistoricoClient({ registros, unidades }: HistoricoClientProps) {
  const [filtroUnidade, setFiltroUnidade] = useState('')
  const [filtroData, setFiltroData] = useState('')
  const [termoBusca, setTermoBusca] = useState('')

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const formatCurrency = (value: any) => {
    const num = Number(value) || 0
    return `R$ ${num.toFixed(2).replace('.', ',')}`
  }

  const registrosFiltrados = registros.filter(registro => {
    const matchUnidade = !filtroUnidade || filtroUnidade === 'all' || registro.unidadeId === filtroUnidade
    const matchData = !filtroData || formatDate(registro.data).includes(filtroData)
    const matchBusca = !termoBusca || 
      registro.unidade?.nome?.toLowerCase()?.includes(termoBusca.toLowerCase()) ||
      registro.responsavel?.name?.toLowerCase()?.includes(termoBusca.toLowerCase())
    
    return matchUnidade && matchData && matchBusca
  })

  const exportarDados = () => {
    const csvContent = [
      ['Data', 'Unidade', 'Responsável', 'Clientes', 'Total Entradas', 'Total Saídas', 'Saldo Final'],
      ...registrosFiltrados.map(registro => [
        formatDate(registro.data),
        registro.unidade?.nome || '',
        registro.responsavel?.name || '',
        registro.clientes.toString(),
        formatCurrency(registro.totalEntradas),
        formatCurrency(registro.totalSaidas),
        formatCurrency(registro.saldoFinal)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `historico_fechamentos_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <History className="h-8 w-8" />
            Histórico de Fechamentos
          </h1>
          <p className="text-gray-600">
            Visualize e gerencie todos os registros de fechamento das unidades.
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por unidade ou responsável..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Unidade</label>
                <Select value={filtroUnidade} onValueChange={setFiltroUnidade}>
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
                <label className="text-sm font-medium">Data</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="dd/mm/aaaa"
                    value={filtroData}
                    onChange={(e) => setFiltroData(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ações</label>
                <Button onClick={exportarDados} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{registrosFiltrados.length}</p>
                <p className="text-sm text-gray-600">Registros Encontrados</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {registrosFiltrados.reduce((sum, r) => sum + r.clientes, 0)}
                </p>
                <p className="text-sm text-gray-600">Total de Clientes</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(registrosFiltrados.reduce((sum, r) => sum + Number(r.totalEntradas), 0))}
                </p>
                <p className="text-sm text-gray-600">Total Entradas</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(registrosFiltrados.reduce((sum, r) => sum + Number(r.saldoFinal), 0))}
                </p>
                <p className="text-sm text-gray-600">Saldo Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Registros */}
        <Card>
          <CardHeader>
            <CardTitle>Registros de Fechamento</CardTitle>
          </CardHeader>
          <CardContent>
            {registrosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nenhum registro encontrado</p>
                <p className="text-gray-400">Tente ajustar os filtros ou registre um novo fechamento</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead className="text-right">Clientes</TableHead>
                      <TableHead className="text-right">Total Entradas</TableHead>
                      <TableHead className="text-right">Saldo Final</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrosFiltrados.map((registro) => (
                      <TableRow key={registro.id}>
                        <TableCell>{formatDate(registro.data)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {registro.unidade?.nome}
                        </TableCell>
                        <TableCell>{registro.responsavel?.name}</TableCell>
                        <TableCell>{registro.horarioFechamento}</TableCell>
                        <TableCell className="text-right">{registro.clientes}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(registro.totalEntradas)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(registro.saldoFinal)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Link href={`/resumo/${registro.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
