import Agendamento from '#models/agendamento'
import Servico from '#models/servico'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class AgendamentosController {
  /**
   * Lista todos os agendamentos com seus dados relacionados
   */
  public async index({ auth, request, response }: HttpContext) { // 1. Adicionado 'auth'
    const user = auth.user!
    const qs = request.qs()

    const query = Agendamento.query()
      .preload('cliente')
      .preload('usuario')
      .preload('servico')
      .orderBy('data', 'desc')
      .orderBy('hora', 'asc')

    // 2. --- LÓGICA DE PERFIL ADICIONADA ---
    // Se for 'profissional', FORÇA o filtro para o ID dele.
    if (user.role === 'profissional') {
      query.where('user_id', user.id)
    }
    // Se for outro perfil (dono, gerente, recepcionista)
    // E (else if) um filtro de 'usuarioId' foi enviado, aplica o filtro.
    else if (qs.usuarioId) {
      query.where('user_id', qs.usuarioId)
    }
    // --------------------------------------

    // 3. Aplica os filtros restantes (exceto usuarioId, que já foi tratado)
    if (qs.data) {
      const dataFormatada = DateTime.fromISO(qs.data)
      if (dataFormatada.isValid) {
        query.where('data', dataFormatada.toSQLDate())
      }
    }
    if (qs.hora) {
      query.where('hora', qs.hora)
    }
    if (qs.servicoId) {
      query.where('servico_id', qs.servicoId)
    }
    if (qs.clienteId) {
      query.where('cliente_id', qs.clienteId)
    }

    // 4. Executa a consulta
    const agendamentos = await query

    return response.ok(agendamentos)
  }

  async store({ request, response }: HttpContext) {
    const data = request.only(['clienteId', 'userId', 'servicoId', 'data', 'hora'])
    const agendamento = await Agendamento.create(data)
    return response.created(agendamento)
  }

  async show({ params, response }: HttpContext) {
    const agendamento = await Agendamento.findOrFail(params.id)
    await agendamento.load('cliente')
    await agendamento.load('usuario')
    await agendamento.load('servico')
    return response.ok(agendamento)
  }

  async update({ params, request, response }: HttpContext) {
    const agendamento = await Agendamento.findOrFail(params.id)
    const data = request.only(['clienteId', 'userId', 'servicoId', 'data', 'hora'])
    agendamento.merge(data)
    await agendamento.save()
    return response.ok(agendamento)
  }

  async destroy({ params, response }: HttpContext) {
    const agendamento = await Agendamento.findOrFail(params.id)
    await agendamento.delete()
    return response.noContent()
  }

  /**
   * Calcula e retorna os próximos horários vagos para um serviço.
   * Rota: GET /api/horarios-vagos?servicoId=1
   */
  public async findAvailableSlots({ request, response }: HttpContext) {
    const { servicoId } = request.qs()

    if (!servicoId) {
      return response.badRequest({ message: 'O servicoId é obrigatório.' })
    }

    try {
      // --- 1. Definir Regras de Negócio (Hard-coded) ---
      const agendaClinica: { [key: number]: { inicio: string; fim: string } | null } = {
        // 0 = Dom, 1 = Seg, 2 = Ter, ... 6 = Sab
        1: { inicio: '09:00', fim: '18:00' }, // Seg
        2: { inicio: '09:00', fim: '18:00' }, // Ter
        3: { inicio: '09:00', fim: '18:00' }, // Qua
        4: { inicio: '09:00', fim: '18:00' }, // Qui
        5: { inicio: '09:00', fim: '18:00' }, // Sex
        6: { inicio: '09:00', fim: '12:00' }, // Sab (meio período)
        0: null, // Dom (fechado)
      }

      const servico = await Servico.findOrFail(servicoId)
      const duracaoServico = servico.duracao // ex: 60 minutos


      const slotIntervalo = servico.duracao // Intervalo entre os slots (ex: de 30 em 30 min)
      const diasParaBuscar = 7 // Quantos dias no futuro devemos procurar
      const limiteDeSlots = 5 // Quantos slots vagos queremos retornar

      // --- 2. Buscar Duração do Serviço ---

      // --- 3. Buscar Agendamentos Futuros ---
      const hoje = DateTime.now().setZone('America/Sao_Paulo')
      const dataFimBusca = hoje.plus({ days: diasParaBuscar })

      // Pega todos os agendamentos já marcados entre hoje e X dias
      const agendamentosMarcados = await Agendamento.query()
        .whereBetween('data', [hoje.toSQLDate()!, dataFimBusca.toSQLDate()!])
        .preload('servico', (query) => {
          query.select('duracao') // Só precisamos da duração
        })
        .orderBy('data', 'asc')
        .orderBy('hora', 'asc')

      // --- 4. Calcular Slots Vagos ---
      const slotsVagos = []
      let dataAtual = hoje

      // Loop pelos próximos X dias
      for (let i = 0; i < diasParaBuscar; i++) {
        // Pula se já encontramos slots suficientes
        if (slotsVagos.length >= limiteDeSlots) break

        // Pega o dia da semana (1 = Seg, 7 = Dom... mas o Luxon usa 7 para Dom, e nós 0)
        const diaDaSemana = dataAtual.weekday === 7 ? 0 : dataAtual.weekday
        const horarioDia = agendaClinica[diaDaSemana] // [CORREÇÃO 1] Agora funciona

        // Pula se for Domingo ou um dia que a clínica não abre
        if (!horarioDia) {
          dataAtual = dataAtual.plus({ days: 1 }).startOf('day')
          continue
        }

        // Define o início e o fim do  dia de trabalho
        let slotInicio = DateTime.fromISO(dataAtual.toFormat('yyyy-MM-dd') + 'T' + horarioDia.inicio, {
          zone: 'America/Sao_Paulo',
        })
        const slotFimDia = DateTime.fromISO(dataAtual.toFormat('yyyy-MM-dd') + 'T' + horarioDia.fim, {
          zone: 'America/Sao_Paulo',
        })

        // Se o dia for hoje, ajusta o início para "agora" + buffer
        if (dataAtual.hasSame(hoje, 'day') && slotInicio < hoje) {
          slotInicio = hoje.plus({ minutes: 30 }) // Buffer de 30 min
          // Arredonda para o próximo intervalo
          const minutos = slotInicio.minute
          if (minutos > 0 && minutos < 30)
            slotInicio = slotInicio.set({ minute: 30, second: 0, millisecond: 0 })
          if (minutos > 30)
            slotInicio = slotInicio.plus({ hours: 1 }).set({ minute: 0, second: 0, millisecond: 0 })
        }

        // Loop pelos "intervalos" do dia (ex: 09:00, 09:30, 10:00...)
        while (slotInicio.plus({ minutes: duracaoServico }) <= slotFimDia) {
          const slotFim = slotInicio.plus({ minutes: duracaoServico })
          let conflito = false

          // Verifica se este slot (ex: 09:00-10:00) conflita com agendamentos existentes
          for (const agendamento of agendamentosMarcados) {

            if (agendamento.data.hasSame(slotInicio, 'day')) {

              const agendamentoInicio = DateTime.fromISO(
                agendamento.data.toSQLDate() + 'T' + agendamento.hora,
                { zone: 'America/Sao_Paulo' }
              )

              const duracaoAgendada = agendamento.servico ? agendamento.servico.duracao : 60
              const agendamentoFim = agendamentoInicio.plus({ minutes: duracaoAgendada })

              // Lógica de intersecção de horários
              if (slotInicio < agendamentoFim && slotFim > agendamentoInicio) {
                conflito = true
                // Se houver conflito, pula para o fim do agendamento
                slotInicio = agendamentoFim
                break // Sai do loop 'for' (agendamentos)
              }
            }
          }

          // Se não houve conflito, adiciona o slot vago
          if (!conflito) {
            slotsVagos.push({
              data: slotInicio.toFormat('yyyy-MM-dd'),
              hora: slotInicio.toFormat('HH:mm'),
            })

            // Pula para o próximo slot disponível
            slotInicio = slotInicio.plus({ minutes: slotIntervalo })

            // Para se já atingimos o limite
            if (slotsVagos.length >= limiteDeSlots) break
          }
        } // Fim do loop 'while' (horários do dia)

        // Prepara para o próximo dia
        dataAtual = dataAtual.plus({ days: 1 }).startOf('day')
      } // Fim do loop 'for' (dias)

      return response.ok(slotsVagos)
    } catch (error) {
      console.error('Erro ao calcular horários vagos:', error)
      return response.internalServerError({ message: 'Erro ao calcular horários vagos.' })
    }
  }
}