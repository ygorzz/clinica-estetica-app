<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="title">Entrar no Sistema</h1>
      <form @submit.prevent="handleLogin" class="login-form">
        <input type="email" v-model="email" placeholder="Email" required class="input-field" />
        <input
          type="password"
          v-model="password"
          placeholder="Senha"
          required
          class="input-field"
        />
        <button type="submit" class="submit-button">Entrar</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const router = useRouter()
const authStore = useAuthStore()

async function handleLogin() {
  // A lógica agora é muito mais simples:
  // 1. Passamos as credenciais para a função de login centralizada no authStore.
  const success = await authStore.login({
    email: email.value,
    password: password.value,
  })

  // 2. Se o login no store for bem-sucedido, redirecionamos.
  if (success) {
    router.push('/dashboard')
  } else {
    alert('Falha no login. Verifique suas credenciais.')
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
  font-family: 'Inter', sans-serif;
}
.login-card {
  background-color: white;
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
}
.title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center; /* <-- ADICIONADO: Centraliza os itens horizontalmente */
}
.input-field {
  width: 90%; /* <-- ALTERADO: Reduz a largura para criar margens */
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  transition: border-color 0.3s;
  box-sizing: border-box; /* Garante que o padding não aumente a largura */
}
.input-field:focus {
  outline: none;
  border-color: #6a1b9a;
}
.submit-button {
  width: 90%; /* <-- ALTERADO: Reduz a largura para alinhar com os inputs */
  padding: 0.75rem 1rem;
  background-color: #6a1b9a;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}
.submit-button:hover {
  background-color: #4a148c;
}
@media (max-width: 640px) {
  .login-card {
    padding: 1.5rem;
    margin: 1rem;
  }
  .title {
    font-size: 1.5rem;
  }
}
</style>