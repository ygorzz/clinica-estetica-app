import Servico from '#models/servico'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Usamos 'nome' como a chave para evitar duplicatas
    await Servico.updateOrCreateMany('nome', [
      {
        nome: 'Manicure e Pedicure',
        descricao: 'Cuidados completos com as unhas das mãos e pés.',
        duracao: 90, // 90 minutos
        preco: 80.00,
      },
      {
        nome: 'Extensão de Cílios',
        descricao: 'Aplicação de cílios para volume intenso.',
        duracao: 180, // 3 horas
        preco: 250.00,
      },
      {
        nome: 'Limpeza de Pele',
        descricao: 'Extração de cravos, esfoliação e hidratação.',
        duracao: 60,
        preco: 120.00,
      },
    ])
  }
}