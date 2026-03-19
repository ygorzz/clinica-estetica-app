// database/migrations/..._create_agendamentos_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'agendamentos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      // Chaves Estrangeiras - Conectam este agendamento a outras tabelas
      table.integer('cliente_id').unsigned().references('id').inTable('clientes').onDelete('CASCADE')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable()
      table.integer('servico_id').unsigned().references('id').inTable('servicos').onDelete('CASCADE')

      // Colunas do agendamento
      table.date('data').notNullable()
      table.time('hora').notNullable()

      // Colunas de timestamp padrão do AdonisJS
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}