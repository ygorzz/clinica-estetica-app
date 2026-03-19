import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

server.errorHandler(() => import('#exceptions/handler'))

server.use([
  () => import('#middleware/container_bindings_middleware'),
  () => import('#middleware/force_json_response_middleware'),
  () => import('@adonisjs/cors/cors_middleware'),
])

router.use([() => import('@adonisjs/core/bodyparser_middleware'), () => import('@adonisjs/auth/initialize_auth_middleware')])

export const middleware = router.named({
  acl: () => import('#middleware/acl_middleware'),
  // --- CORREÇÃO FINALÍSSIMA ---
  // A referência ao middleware de autenticação foi restaurada,
  // apontando agora para o ficheiro correto que criámos.
  auth: () => import('#middleware/auth_middleware'),
})

