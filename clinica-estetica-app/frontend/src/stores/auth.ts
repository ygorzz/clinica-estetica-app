import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  // --- STATE ---
  // Inicializa o estado a partir do localStorage para manter o usuário logado
  const authToken = ref(localStorage.getItem('authToken'))
  const userRole = ref(localStorage.getItem('userRole'))
  const userName = ref(localStorage.getItem('userName'))

  // --- GETTERS ---
  // Propriedades computadas que reagem a mudanças no estado
  const isAuthenticated = computed(() => !!authToken.value)
  const getUserRole = computed(() => userRole.value)
  const getUserName = computed(() => userName.value)

  // --- ACTIONS ---
  /**
   * Tenta fazer login na API e, se bem-sucedido, armazena os dados.
   * @param credentials - O e-mail e a senha do usuário.
   */
  async function login(credentials: { email: string; password: string }) {
    try {
      const response = await axios.post('http://localhost:3333/api/login', credentials)
      const { token, user } = response.data

      // Armazena os dados no estado (refs)
      authToken.value = token
      userRole.value = user.role
      userName.value = user.fullName

      // Armazena os dados no localStorage para persistência
      localStorage.setItem('authToken', token)
      localStorage.setItem('userRole', user.role)
      localStorage.setItem('userName', user.fullName)

      return true // Indica sucesso
    } catch (error) {
      console.error('Falha no login:', error)
      logout() // Garante que o estado esteja limpo em caso de falha
      return false // Indica falha
    }
  }

  /**
   * Limpa todos os dados de autenticação do estado e do localStorage.
   */
  function logout() {
    authToken.value = null
    userRole.value = null
    userName.value = null

    localStorage.removeItem('authToken')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
  }

  return {
    authToken,
    userRole,
    userName,
    isAuthenticated,
    getUserRole,
    getUserName,
    login,
    logout,
  }
})