import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Agendamento from '#models/agendamento'

export default class Cliente extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare cpf: string

  @column()
  declare telefone: string

  @column()
  declare email: string

  @hasMany(() => Agendamento)
  declare agendamentos: HasMany<typeof Agendamento>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}