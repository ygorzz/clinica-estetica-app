import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Cliente from '#models/cliente'
import User from '#models/user'
import Servico from '#models/servico'

export default class Agendamento extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare clienteId: number

  @column()
  declare userId: number | null

  @column()
  declare servicoId: number

  @column.date()
  declare data: DateTime

  @column()
  declare hora: string

  // --- RELACIONAMENTOS ---
  // Define que um Agendamento "pertence a" um Cliente
  @belongsTo(() => Cliente)
  declare cliente: BelongsTo<typeof Cliente>
  
  // Define que um Agendamento "pertence a" um User (funcionário)
  @belongsTo(() => User)
  declare usuario: BelongsTo<typeof User>

  // Define que um Agendamento "pertence a" um Servico
  @belongsTo(() => Servico)
  declare servico: BelongsTo<typeof Servico>
  // ----------------------

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}