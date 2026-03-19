import vine from '@vinejs/vine'

/**
 * Validador para criar um novo cliente.
 */

// Vine - validador que lida com todas as regras(ex: if-else) e retorna automaticamente
export const createClienteValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(3),
    cpf: vine.string().trim().minLength (11).maxLength(14).unique(async (db, value) => {
      const cliente = await db.from('clientes').where('cpf', value).first()
      return !cliente
    }),
    telefone: vine.string().trim().minLength(8),
    email: vine.string().trim().email().unique(async (db, value) => {
      const cliente = await db.from('clientes').where('email', value).first()
      return !cliente 
    }),
  })
)
