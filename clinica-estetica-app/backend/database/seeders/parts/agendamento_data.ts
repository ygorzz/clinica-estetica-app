// database/seeders/agendamento_seeder.ts

import Agendamento from '#models/agendamento'
import Cliente from '#models/cliente'
import Servico from '#models/servico'
import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    // 1. Buscar os IDs dos dados que acabamos de criar
    const profissional = await User.findByOrFail('email', 'profissional@clinica.com')
    
    // Clientes
    const clienteAna = await Cliente.findByOrFail('email', 'ana.silva@email.com')
    const clienteBeatriz = await Cliente.findByOrFail('email', 'beatriz.costa@email.com')

    // Serviços
    const servicoCilios = await Servico.findByOrFail('nome', 'Extensão de Cílios')
    const servicoLimpeza = await Servico.findByOrFail('nome', 'Limpeza de Pele')

    // 2. Criar os agendamentos de teste
    // Usamos createMany pois o migration:fresh vai limpar a tabela
    await Agendamento.createMany([
      {
        // Agendamento 1 (Para o Profissional) - Futuro (Amanhã)
        clienteId: clienteAna.id,
        servicoId: servicoCilios.id,
        userId: profissional.id, // <-- Associado ao profissional
        data: DateTime.now().plus({ days: 1 }),
        hora: '10:00',
      },
      {
        // Agendamento 2 (Para o Profissional) - Futuro (Hoje, mais tarde)
        clienteId: clienteBeatriz.id,
        servicoId: servicoLimpeza.id,
        userId: profissional.id, // <-- Associado ao profissional
        data: DateTime.now(),
        hora: '16:00',
      },
      {
        // Agendamento 3 (Para o Profissional) - Passado
        // (Isso testa se o profissional vê o cliente "Ana Silva" na lista dele)
        clienteId: clienteAna.id,
        servicoId: servicoLimpeza.id,
        userId: profissional.id, // <-- Associado ao profissional
        data: DateTime.now().minus({ days: 10 }),
        hora: '14:30',
      },
    ])
  }
}