<template>
  <div class="dashboard-container">
    <Sidebar />

    <main class="main-content">
      <div class="content-wrapper">
        <h1 class="page-title">Gestão de Funcionários</h1>

        <div class="section-card">
          <h2 class="section-title">Adicionar Novo Funcionário</h2>
          <form @submit.prevent="salvarNovoFuncionario" class="form-grid">
            <input v-model="novoFuncionario.fullName" type="text" placeholder="Nome Completo" required class="input-field" />
            <input v-model="novoFuncionario.email" type="email" placeholder="Email" required class="input-field" />
            <input v-model="novoFuncionario.password" type="password" placeholder="Senha" required class="input-field" />
            <select v-model="novoFuncionario.role" required class="input-field">
                <option value="funcionario">Funcionário</option>
                <option value="gerente">Gerente</option>
                <option value="dono">Dono</option>
            </select>
            <button type="submit" class="button">Adicionar Funcionário</button>
          </form>
        </div>

        <div class="section-card">
          <div class="list-header">
            <div class="title-toggle-wrapper">
              <h2 class="section-title">Lista de Funcionários</h2>
              <button @click="toggleListVisibility" class="toggle-icon-button" :title="isListVisible ? 'Esconder Lista' : 'Mostrar Lista'">
                <svg v-if="isListVisible" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                   <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                </svg>
              </button>
            </div>
            </div>

          <table v-if="isListVisible" class="data-table">
            <thead>
              <tr>
                <th>Nome Completo</th>
                <th>Email</th>
                <th>Cargo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
               <tr v-if="funcionarios.length === 0">
                <td colspan="4" class="empty-table-message">Nenhum funcionário cadastrado.</td>
               </tr>
              <tr v-for="funcionario in funcionarios" :key="funcionario.id">
                <td>{{ funcionario.fullName }}</td>
                <td>{{ funcionario.email }}</td>
                <td>{{ funcionario.role }}</td>
                <td>
                  <button @click="abrirModalEdicao(funcionario)" class="action-button edit-button">Editar</button>
                  <button @click="abrirModalDelecao(funcionario)" class="action-button delete-button">Deletar</button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="list-hidden-message">A lista de funcionários está oculta.</p>

        </div>
      </div>
    </main>

    <div v-if="showEditModal" class="modal-overlay" @click.self="fecharModalEdicao">
       <div class="modal-content">
        <h3 class="modal-title">Editar Funcionário</h3>
        <form @submit.prevent="atualizarFuncionario" class="modal-form">
          <div class="form-group">
            <label for="edit-nome">Nome Completo</label>
            <input id="edit-nome" v-model="funcionarioEmEdicao.fullName" type="text" required class="input-field" />
          </div>
          <div class="form-group">
            <label for="edit-email">Email</label>
            <input id="edit-email" v-model="funcionarioEmEdicao.email" type="email" required class="input-field" />
          </div>
          <div class="form-group">
            <label for="edit-role">Cargo</label>
            <select id="edit-role" v-model="funcionarioEmEdicao.role" required class="input-field">
                <option value="funcionario">Funcionário</option>
                <option value="gerente">Gerente</option>
                <option value="dono">Dono</option>
            </select>
          </div>
          <div class="modal-actions">
            <button @click="fecharModalEdicao" type="button" class="button cancel-button">Cancelar</button>
            <button type="submit" class="button">Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showConfirmDeleteModal" class="modal-overlay" @click.self="fecharModalDelecao">
       <div class="modal-content">
        <h3 class="modal-title">Confirmar Exclusão</h3>
        <p>Tem certeza que deseja excluir o funcionário "{{ funcionarioParaDeletar?.fullName }}"?</p>
        <div class="modal-actions">
          <button @click="fecharModalDelecao" class="button cancel-button">Cancelar</button>
          <button @click="confirmarDelecao" class="button delete-button-modal">Confirmar Exclusão</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue';
import { ref, onMounted, computed } from 'vue'; 
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

// --- Controle da UI ---
const showEditModal = ref(false);
const showConfirmDeleteModal = ref(false);
const isListVisible = ref(true); // <-- Estado para visibilidade

function toggleListVisibility() { isListVisible.value = !isListVisible.value; }

// --- Interfaces e Estados de Dados ---
interface Funcionario {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

const funcionarios = ref<Funcionario[]>([]);
const novoFuncionario = ref({ fullName: '', email: '', password: '', role: 'funcionario' });
const funcionarioEmEdicao = ref<Partial<Funcionario>>({});
const funcionarioParaDeletar = ref<Funcionario | null>(null);

// --- Funções da API (CRUD) ---
const fetchFuncionarios = async () => {
  const token = authStore.authToken;
  if (!token) return;
  try {
    const response = await axios.get('http://localhost:3333/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    funcionarios.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
  }
};

const salvarNovoFuncionario = async () => {
    const token = authStore.authToken;
  if (!token) {
    alert('Você não está autenticado.');
    return;
  }
  if (!novoFuncionario.value.password) {
    alert('Por favor, defina uma senha.');
    return;
  }
  try {
    await axios.post('http://localhost:3333/api/users', novoFuncionario.value, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    novoFuncionario.value = { fullName: '', email: '', password: '', role: 'funcionario' };
    await fetchFuncionarios();
  } catch (error: any) {
    console.error('Erro ao salvar o funcionário:', error);
    if (error.response?.status === 409) {
      alert(error.response.data.message);
    } else {
      alert('Falha ao adicionar funcionário. Verifique os dados.');
    }
  }     
};

const atualizarFuncionario = async () => {
  if (!funcionarioEmEdicao.value.id) return;
  const token = authStore.authToken;
  if (!token) return;
  try {
    await axios.put(`http://localhost:3333/api/users/${funcionarioEmEdicao.value.id}`, funcionarioEmEdicao.value, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    await fetchFuncionarios();
    fecharModalEdicao();
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    alert('Falha ao atualizar o funcionário.');
  }
};

const confirmarDelecao = async () => {
  if (!funcionarioParaDeletar.value?.id) return;
  const token = authStore.authToken;
  if (!token) return;
  try {
    await axios.delete(`http://localhost:3333/api/users/${funcionarioParaDeletar.value.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    await fetchFuncionarios();
  } catch (error) {
    console.error('Erro ao deletar o funcionário:', error);
    alert('Falha ao excluir o funcionário.');
  } finally {
    fecharModalDelecao();
  }
};

// --- Funções de Ação ---
const abrirModalEdicao = (funcionario: Funcionario) => { funcionarioEmEdicao.value = { ...funcionario }; showEditModal.value = true; };
const fecharModalEdicao = () => { showEditModal.value = false; funcionarioEmEdicao.value = {}; };
const abrirModalDelecao = (funcionario: Funcionario) => { funcionarioParaDeletar.value = funcionario; showConfirmDeleteModal.value = true; };
const fecharModalDelecao = () => { showConfirmDeleteModal.value = false; funcionarioParaDeletar.value = null; };

onMounted(() => { fetchFuncionarios(); });
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

.dashboard-container {
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  background-color: #f5f7fa;
  color: #333;
}
.main-content {
  flex-grow: 1;
  padding: 2rem;
  position: relative;
}
.content-wrapper {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}
.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 2rem;
}
.section-card {
  background-color: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}
.list-header {
  display: flex;
  flex-wrap: wrap; /* Permite quebrar linha */
  justify-content: space-between; /* Espaça título e filtro (se houver) */
  align-items: flex-start; /* Alinha no topo */
  gap: 1rem; 
  margin-bottom: 1.5rem; /* Espaço antes da tabela/mensagem */
}
.title-toggle-wrapper {
  display: flex;
  align-items: center; /* Alinha verticalmente */
  gap: 0.75rem; /* Espaço entre título e ícone */
  /* Removemos a borda e padding daqui */
  width: auto; /* Ajusta para não ocupar tudo */
  flex-shrink: 0; /* Impede de encolher */
}
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #555;
  margin: 0; /* Remove margem padrão */
  /* Adiciona a borda e padding de volta, mas APENAS no título */
  padding-bottom: 0.5rem; 
  border-bottom: 2px solid #f0f2f5; 
}
.toggle-icon-button {
  background: none;
  border: none;
  padding: 0.25rem; 
  cursor: pointer;
  color: #6a1b9a; 
  display: flex; 
  align-items: center;
  justify-content: center;
  border-radius: 50%; 
  transition: background-color 0.2s ease;
  margin-top: 4px; /* Ajuste fino vertical */
}
.toggle-icon-button:hover {
  background-color: #f0f2f5; 
}
.toggle-icon-button svg {
   width: 1em; 
   height: 1em;
}

/* Estilos do Formulário de Adição */
.section-card > .section-title { /* Para o título do formulário */
  margin-bottom: 1.2rem; 
  border-bottom: 2px solid #f0f2f5; 
  padding-bottom: 0.5rem; 
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) minmax(auto, max-content); 
  gap: 1rem; 
  align-items: center; 
}
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr; 
  }
}
.input-field {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  transition: border-color 0.3s;
  width: 100%; 
  box-sizing: border-box;
}
.input-field:focus {
  outline: none;
  border-color: #6a1b9a;
}
.button {
  padding: 0.75rem 1.5rem;
  background-color: #6a1b9a;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap; 
}
.button:hover {
  background-color: #4a148c;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th, .data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}
.data-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}
.data-table tbody tr:hover {
  background-color: #f0f2f5;
}
.empty-table-message {
  text-align: center;
  color: #718096;
  padding: 2rem;
}
.action-button {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 0.8rem;
  font-weight: 600;
}
.edit-button {
  background-color: #2c7a7b;
  margin-right: 0.5rem;
}
.edit-button:hover {
  background-color: #285e61;
}
.delete-button {
  background-color: #e53e3e;
}
.delete-button:hover {
  background-color: #c53030;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 500px;
}
.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}
.modal-content p {
  margin-bottom: 2rem;
  color: #555;
  text-align: center;
}
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}
.form-group label {
  font-weight: 600;
  color: #555;
}
.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}
.cancel-button {
  background-color: #718096;
}
.cancel-button:hover {
  background-color: #4a5568;
}
.delete-button-modal {
  background-color: #e53e3e;
}
.delete-button-modal:hover {
  background-color: #c53030;
}
.list-hidden-message {
  text-align: center;
  color: #718096;
  padding: 2rem 0; 
  margin-top: 0; 
}

@media (max-width: 768px) {
  .list-header {
     justify-content: space-between; 
  }
  .title-toggle-wrapper {
     width: 100%; 
     margin-bottom: 1rem; 
  }
  .sidebar {
    position: fixed;
    height: 100%;
    transform: translateX(-100%);
    z-index: 1000;
  }
  .sidebar-open {
    transform: translateX(0);
  }
  .menu-button {
    display: block;
  }
  .main-content {
    padding-top: 5rem;
  }
}
</style>