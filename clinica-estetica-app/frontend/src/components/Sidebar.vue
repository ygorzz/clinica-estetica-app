<template>
  <div class="menu-button" @click="toggleSidebar">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
  </div>

  <div v-if="isSidebarOpen" class="sidebar-overlay" @click="toggleSidebar"></div>

  <aside :class="{ 'sidebar': true, 'sidebar-open': isSidebarOpen }">
    <div class="logo">Clínica App</div>
    <nav class="navigation">
      <a href="/dashboard" class="nav-item">Início</a>

      <a href="/clientes" class="nav-item">Clientes</a>

      <a href="/agendamentos" class="nav-item">Agendamentos</a>

      <a
        v-if="
          authStore.getUserRole === 'dono' || authStore.getUserRole === 'gerente' || authStore.getUserRole === 'recepcionista'"
          href="/servicos"
          class="nav-item"
        >Serviços</a
      >

      <a
        v-if="authStore.getUserRole === 'dono' || authStore.getUserRole === 'gerente'"
        href="/funcionarios"
        class="nav-item"
        >Funcionários</a
      >
    </nav>
    <div class="logout">
      <button @click="handleLogout" class="logout-button">Sair</button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const isSidebarOpen = ref(false);

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

function handleLogout() {
  authStore.logout();
  router.push('/');
}
</script>

<style scoped>
/* Estilos da sidebar */
.sidebar {
  width: 250px;
  background-color: #ffffff;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}
.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #6a1b9a;
  text-align: center;
  margin-bottom: 2rem;
}
.navigation {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex-grow: 1;
}
.nav-item {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: #555;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s;
}
.nav-item:hover, .nav-item.active {
  background-color: #f0f2f5;
  color: #6a1b9a;
}
.logout {
  margin-top: auto;
}
.logout-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #e53e3e;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}
.logout-button:hover {
  background-color: #c53030;
}

/* Estilos para a funcionalidade mobile */
.menu-button {
  display: none;
}
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

@media (max-width: 768px) {
  .menu-button {
    display: block;
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 1001;
    color: #6a1b9a;
    cursor: pointer;
  }
  .sidebar {
    position: fixed;
    height: 100%;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    z-index: 1000;
  }
  .sidebar-open {
    transform: translateX(0);
  }
  .sidebar-open ~ .sidebar-overlay {
    display: block;
  }
}
</style>