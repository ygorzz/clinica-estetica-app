// database/seeders/cliente_seeder.ts

import Cliente from '#models/cliente'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Usamos 'email' como a chave para evitar duplicatas
    await Cliente.updateOrCreateMany('email', [
      {
        nome: 'Ana Silva',
        email: 'ana.silva@email.com',
        cpf: '111.222.333-44',
        telefone: '11911112222',
      },
      {
        nome: 'Beatriz Costa',
        email: 'beatriz.costa@email.com',
        cpf: '555.666.777-88',
        telefone: '11933334444',
      },
      {
        nome: 'Carla Dias',
        email: 'carla.dias@email.com',
        cpf: '999.888.777-66',
        telefone: '11955556666',
      },
    ])
  }
}