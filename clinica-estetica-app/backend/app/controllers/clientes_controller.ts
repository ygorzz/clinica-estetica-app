import Cliente from '#models/cliente'
import { HttpContext } from '@adonisjs/core/http'
import { createClienteValidator } from '#validators/create_cliente'

export default class ClientesController {
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createClienteValidator)
    const cliente = await Cliente.create(data)
    return response.created({ message: 'Cliente criado com sucesso.', cliente })
  }

  /**
   * Lista os clientes baseado no perfil do usuário.
   */
  async index({ auth, response }: HttpContext) { // 1. Adicionado 'auth'
    const user = auth.user!

    let clientesQuery = Cliente.query()

    // 2. Lógica de filtro para 'profissional'
    if (user.role === 'profissional') {
      // Busca clientes ONDE (whereHas) existe ('has')
      // pelo menos um agendamento associado a este user.id
      clientesQuery = clientesQuery.whereHas('agendamentos', (query) => {
        query.where('user_id', user.id)
      })
    }
    
    // 3. Executa a query (filtrada ou não)
    const clientes = await clientesQuery.orderBy('nome', 'asc')

    return response.ok(clientes)
  }

  async update({ params, request, response }: HttpContext) {
    const cliente = await Cliente.findOrFail(params.id)
    const data = request.only(['nome', 'cpf', 'telefone', 'email'])
    cliente.merge(data)
    await cliente.save()
    return response.ok({ message: 'Cliente atualizado com sucesso.', cliente })
  }

  async destroy({ params, response }: HttpContext) {
    const cliente = await Cliente.findOrFail(params.id)
    await cliente.delete()
    return response.noContent()
  }
  public async findByCpf({ params, response }: HttpContext) {
    try {
      // Busca o cliente pelo campo 'cpf'
      // findByOrFail falha automaticamente se não encontrar (Erro 404)
      const cliente = await Cliente.findByOrFail('cpf', params.cpf)

      // Se encontrar, retorna o cliente
      return response.ok(cliente)
    } catch (error) {
      // Se o 'findByOrFail' falhar, ele gera um erro
      // Nós o capturamos e enviamos uma resposta 404 (Não Encontrado)
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Cliente não encontrado com este CPF.' })
      }
      
      // Para qualquer outro erro (ex: falha de banco)
      return response.internalServerError({ message: 'Erro ao buscar cliente.' })
    }
  }
}