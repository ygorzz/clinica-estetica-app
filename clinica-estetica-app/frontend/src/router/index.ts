import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import ClientesView from '../views/ClientesView.vue'
import AgendamentosView from '@/views/AgendamentosView.vue'
import ServicosView from '../views/ServicosView.vue' // <-- 1. Importação adicionada
import { useAuthStore } from '../stores/auth'
import FuncionariosView from '@/views/FuncionariosView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/clientes',
      name: 'clientes',
      component: ClientesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/agendamentos',
      name: 'agendamentos',
      component: AgendamentosView,
      meta: { requiresAuth: true },
    },
    { 
      path: '/servicos',
      name: 'servicos',
      component: ServicosView,
      meta: { requiresAuth: true },
    },
    {
      path: '/funcionarios',
      name: 'funcionarios',
      component: FuncionariosView,
      meta: { requiresAuth: true }
    },
  ],
})

//Guarda a rota de navegação
router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.authToken) {
    return { name: 'login' }
  }
})

export default router
