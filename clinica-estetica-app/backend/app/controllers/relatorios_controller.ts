import Agendamento from '#models/agendamento'
import Cliente from '#models/cliente'
import type { HttpContext } from '@adonisjs/core/http'

export default class RelatoriosController {
  public async index({ response }: HttpContext) {
    // Métrica 1: Número total de clientes convertidos
    const totalClientes = await Cliente.query().count('* as total')

    // Métrica 2: Número de agendamentos por serviço (tratamentos mais vendidos)
    const tratamentosMaisVendidos = await Agendamento.query()
      .select('servico_id')
      .count('* as total')
      .groupBy('servico_id')
      .preload('servico', (query) => {
        query.select('nome') // Seleciona apenas o nome do serviço
      })
      .orderBy('total', 'desc') // Ordena do mais vendido para o menos vendido

    const relatorios = {
      totalClientes: totalClientes[0].$extras.total,
      tratamentosMaisVendidos: tratamentosMaisVendidos.map((item) => ({
        nome: item.servico.nome,
        total: item.$extras.total,
      })),
    }

    return response.ok(relatorios)
  }
}