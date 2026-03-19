  import { BaseSchema } from '@adonisjs/lucid/schema'

  export default class extends BaseSchema {
    protected tableName = 'servicos'

    async up() {
      this.schema.createTable(this.tableName, (table) => {
        table.increments('id').notNullable()

        // Colunas do servico
        table.string('nome', 255).notNullable()
        table.text('descricao').nullable()
        table.integer('duracao').notNullable() // <- CAMPO ADICIONADO
        table.decimal('preco', 8, 2).notNullable()

        // Colunas de timestamp padrão do AdonisJS
        table.timestamp('created_at').notNullable()
        table.timestamp('updated_at').notNullable()
      })
    }

    async down() {
      this.schema.dropTable(this.tableName)
    }
  }
