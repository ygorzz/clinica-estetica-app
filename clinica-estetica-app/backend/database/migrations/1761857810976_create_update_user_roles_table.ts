import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  // 1. Aponte para a tabela 'users'
  protected tableName = 'users'

  async up() {
    // 2. Primeiro, atualizamos TODOS os dados existentes.
    // Onde 'role' for 'funcionario', ele será mudado para 'recepcionista'.
    await this.db
      .from(this.tableName)
      .where('role', 'funcionario')
      .update({ role: 'recepcionista' })

    // 3. Agora, alteramos a estrutura da coluna.
    // O valor padrão para NOVOS usuários criados será 'recepcionista'.
    this.schema.alterTable(this.tableName, (table) => {
      table.string('role').defaultTo('recepcionista').notNullable().alter()
    })
  }

  async down() {
    // 4. Em caso de rollback (reversão), fazemos o oposto.
    // Primeiro, alteramos o padrão de volta para 'funcionario'.
    this.schema.alterTable(this.tableName, (table) => {
      table.string('role').defaultTo('funcionario').notNullable().alter()
    })

    // 5. Depois, revertemos os dados.
    // Onde 'role' for 'recepcionista', voltará a ser 'funcionario'.
    await this.db
      .from(this.tableName)
      .where('role', 'recepcionista')
      .update({ role: 'funcionario' })
  }
}