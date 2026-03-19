import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'clientes'

  // método Up = define as alterações a serem aplicadas
  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('nome', 255).notNullable()
      table.string('cpf', 14).unique().notNullable()
      table.string('telefone', 20).notNullable()
      table.string('email', 255).unique().notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  // método DOWN = define como reverter as alterações
  async down() {
    this.schema.dropTable(this.tableName)
  }
}
