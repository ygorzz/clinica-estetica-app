import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  async login({ request, response }: HttpContext) {
    try {
      const { email, password } = request.only(['email', 'password'])

      const user = await User.verifyCredentials(email, password)

      const token = await User.accessTokens.create(user)

      // A forma correta de obter a string do token é usando "token.value!.release()".
      // Isso garante que estamos enviando a string do token e não o objeto inteiro.
      return response.ok({
        message: 'Login bem-sucedido!',
        token: token.value!.release(), // Enviando a string do token corretamente
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      })
    } catch (error) {
      console.error('Falha na autenticação:', error.message)
      return response.unauthorized({ message: 'Credenciais inválidas.' })
    }
  }
}

