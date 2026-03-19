import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Rota de login pública
router.post('/login', '#controllers/auth_controller.login').prefix('api')

// Agrupa todas as rotas que exigem autenticação
router
  .group(() => {
    // Rota do Dashboard - Acessível a todos os usuários logados
    router.get('/dashboard', '#controllers/dashboard_controller.index')

    // --- GRUPO 1: Clientes e Agendamentos ---
    // Acessível a Dono, Gerente, Recepcionista (CRUD)
    // Acessível a Profissional (Apenas Leitura - GET)
    router
      .group(() => {
        router.resource('/clientes', '#controllers/clientes_controller').apiOnly()
        router.get('/clientes/por-cpf/:cpf', '#controllers/clientes_controller.findByCpf')
        router.get('/horarios-vagos', '#controllers/agendamentos_controller.findAvailableSlots')
        router.resource('/agendamentos', '#controllers/agendamentos_controller').apiOnly()
      })
      .use(middleware.acl(['dono', 'gerente', 'recepcionista', 'profissional']))

    // --- GRUPO 2: Gerenciamento de Usuários (Funcionários) ---
    // Apenas Dono e Gerente
    router
      .group(() => {
        router.resource('/users', '#controllers/users_controller').apiOnly().except(['show'])
      })
      .use(middleware.acl(['dono', 'gerente']))

    // --- GRUPO 3: Gerenciamento de Serviços ---
    // Apenas Dono e Gerente
    router
      .group(() => {
        router.resource('/servicos', '#controllers/servicos_controller').apiOnly()
      })
      .use(middleware.acl(['dono', 'gerente', 'recepcionista'])) 
  })
  .prefix('api')
  .use(middleware.auth()) // Aplica autenticação a todo o grupo