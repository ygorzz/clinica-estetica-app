import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  /**
   * Exibe uma lista de todos os usuários.
   * Esta função é usada para popular os dropdowns no frontend.
   */
  public async index({ response }: HttpContext) {
    const users = await User.all()

    return response.ok(users)
  }
  /**
   * Cria um novo usuário (funcionário) no banco de dados.
   */
  public async store({ request, response }: HttpContext) {
    const data = request.only(['fullName', 'email', 'password', 'role'])
    
    // Validação de e-mail duplicado (opcional, mas recomendado)
    const userExists = await User.findBy('email', data.email)
    if (userExists) {
      return response.conflict({ message: 'Este e-mail já está em uso.' })
    }

    const user = await User.create(data)
    return response.created(user)
  }

  /**
   * Atualiza os dados de um funcionário.
   */
  public async update({ params, request, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const data = request.only(['fullName', 'email', 'role']) 
    user.merge(data)
    await user.save()
    return response.ok(user)
  }

  /**
   * Deleta um funcionário do banco de dados.
   */
  public async destroy({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    await user.delete()
    return response.noContent()
  }
}


