import { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AclMiddleware {
  async handle(ctx: HttpContext, next: NextFn, allowedRoles: string[]) {
    // 1. Garante que o usuário está carregado
    await ctx.auth.check()
    const user = ctx.auth.user

    // 2. VERIFICAÇÃO BÁSICA (Nível 1: Acesso à Rota)
    // Verifica se o usuário existe e se o 'role' dele está na lista de permissões da rota.
    if (!user || !allowedRoles.includes(user.role)) {
      return ctx.response.unauthorized({
        message: 'Acesso negado. Você não tem permissão para acessar este recurso.',
      })
    }

    // 3. VERIFICAÇÃO DE ESCRITA (Nível 2: Restrição do Profissional)
    // Se o usuário passou no Nível 1 E o 'role' dele é 'profissional',
    // aplicamos restrições de ESCRITA (POST, PUT, PATCH, DELETE).
    if (user.role === 'profissional') {
      const requestMethod = ctx.request.method()
      
      // Lista de métodos que o profissional é PROIBIDO de usar
      const forbiddenMethods = ['POST', 'PUT', 'PATCH', 'DELETE']

      if (forbiddenMethods.includes(requestMethod)) {
        return ctx.response.unauthorized({
          message: 'Acesso negado. Profissionais têm permissão apenas para visualização.',
        })
      }
    }

    // 4. Se passou em todas as verificações, permite a requisição
    await next()
  }
}