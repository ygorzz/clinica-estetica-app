import Agendamento from '#models/agendamento'
import Cliente from '#models/cliente'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

// --- 1. DEFINIR INTERFACES PARA TIPAGEM ---
interface TratamentoVendido {
  nome: string
  total: any // $extras.total é 'any' por padrão
}

interface MetricasDashboard {
  totalClientes: number
  tratamentosMaisVendidos: TratamentoVendido[]
}
// ------------------------------------------

export default class DashboardController {
  public async index({ auth, response }: HttpContext) {
    const user = auth.user!
    const today = DateTime.now().setZone('America/Sao_Paulo').toSQLDate()

    if (!today) {
      return response.internalServerError({ message: 'Não foi possível determinar a data atual.' })
    }

    // --- 2. Buscando a Agenda do Dia (Comum a todos) ---
    const agendaQuery = Agendamento.query()
      .where('data', today)
      .preload('cliente', (query) => query.select('nome'))
      .preload('servico', (query) => query.select('nome'))
      .preload('usuario', (query) => query.select('fullName'))

    // Se for 'profissional', filtra a agenda para ele
    if (user.role === 'profissional') {
      agendaQuery.where('user_id', user.id)
    }

    const agendaDoDia = await agendaQuery.orderBy('hora', 'asc')

    // --- 3. Buscando as Métricas (Apenas para dono e gerente) ---

    // Inicializa as métricas com o tipo correto (Interface)
    let metricas: MetricasDashboard = {
      totalClientes: 0,
      tratamentosMaisVendidos: [], // Agora TS sabe que é um array de TratamentoVendido[]
    }

    // Se for gerente ou dono, calcula as métricas
    if (user.role == 'dono' || user.role == 'gerente') {
      const totalClientesResult = await Cliente.query().count('* as total')
      const tratamentosMaisVendidos = await Agendamento.query()
        .select('servico_id')
        .count('* as total')
        .groupBy('servico_id')
        .preload('servico', (query) => query.select('nome'))
        .orderBy('total', 'desc')
        .limit(5)

      // Atualiza o objeto de métricas
      metricas = {
        totalClientes: totalClientesResult.length > 0 ? totalClientesResult[0].$extras.total : 0,
        tratamentosMaisVendidos: tratamentosMaisVendidos.map((item) => ({
          nome: item.servico ? item.servico.nome : 'Serviço Removido',
          total: item.$extras.total,
        })),
      }
    }else if (user.role === 'profissional') {
      // --- LÓGICA ATUALIZADA PARA O PROFISSIONAL ---

      // 1. Query para Total de Clientes (do profissional)
      const totalClientesPromise = Cliente.query()
        .whereHas('agendamentos', (q) => q.where('user_id', user.id))
        .count('* as total')

      // 2. Atendimentos por dia nos últimos 7 dias
      const today = DateTime.now().setZone('America/Sao_Paulo').toSQLDate()!
      const sevenDaysAgo = DateTime.now().setZone('America/Sao_Paulo').minus({ days: 6 }).toSQLDate()!

      const atendimentosSemanaPromise = Agendamento.query()
        .where('user_id', user.id)
        .whereBetween('data', [sevenDaysAgo, today]) // Filtra os últimos 7 dias
        .select('data') 
        .count('* as total') // Conta quantos agendamentos teve no dia
        .groupBy('data')
        .orderBy('data', 'asc') 

      // 3. Executa as consultas de métricas
      const [totalClientesResult, atendimentosSemana] = await Promise.all([
        totalClientesPromise,
        atendimentosSemanaPromise,
      ])

      // 4. Atualiza o objeto de métricas com a NOVA estrutura de dados
      metricas = {
        totalClientes: totalClientesResult.length > 0 ? totalClientesResult[0].$extras.total : 0,
        tratamentosMaisVendidos: [], // Deixamos este vazio
        atendimentosPorDia: atendimentosSemana.map((item: any) => ({
        // [CORREÇÃO 3] Usamos fromISO, que é o parser mais robusto
          // O groupBy provavelmente retorna uma string ISO (ex: 2025-11-01T03:00:00.000Z)
          data: DateTime.fromISO(item.data).toFormat('dd/MM'),
        total: item.$extras.total,
        })),
      } as any 
    }

    // --- 4. Montando a Resposta ---
    const dashboardData = {
      metricas: metricas, // Passa as métricas (zeradas ou preenchidas)
      agendaDoDia: agendaDoDia,
    }

    return response.ok(dashboardData)
  }
}