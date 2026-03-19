<template>
  <div class="dashboard-container">
    <Sidebar />

    <main class="main-content">
      <div class="content-wrapper">
        <h1 class="page-title">Gerenciamento de Agendamentos</h1>
        
        <div class="section-card" v-if="authStore.getUserRole !== 'profissional'">
          <h2 class="section-title">Adicionar Novo Agendamento</h2>
          <form @submit.prevent="createAgendamento" class="form-grid">
            <input v-model="newAgendamento.data" type="date" required class="input-field" />
            <input v-model="newAgendamento.hora" type="time" required class="input-field" />
            <select v-model="newAgendamento.servicoId" required class="input-field">
              <option :value="null" disabled>Selecione um serviço</option>
              <option v-for="servico in servicos" :key="servico.id" :value="servico.id">{{ servico.nome }}</option>
            </select>
            <select v-model="newAgendamento.clienteId" required class="input-field">
              <option :value="null" disabled>Selecione um cliente</option>
              <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">{{ cliente.nome }}</option>
            </select>
            <select v-model="newAgendamento.userId" required class="input-field">
              <option :value="null" disabled>Selecione um funcionário</option>
              <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">{{ usuario.fullName }}</option>
            </select>
            <button type="submit" class="button">Adicionar Agendamento</button>
          </form>
        </div>

        <div class="section-card">
          <div class="list-header">
            <div class="title-toggle-wrapper"> 
              <h2 class="section-title">Lista de Agendamentos</h2>
              <button @click="toggleListVisibility" class="toggle-icon-button" :title="isListVisible ? 'Esconder Lista' : 'Mostrar Lista'">
                <svg v-if="isListVisible" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                   <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                </svg>
              </button>
            </div>
            <button @click="abrirModalFiltro" class="filter-icon-button" title="Filtrar Agendamentos">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 7.46V13a.5.5 0 0 1-.276.447l-3 1.5A.5.5 0 0 1 6 14.5V7.46L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .53L6 6.276v6.92l3-1.5V6.276l4.5-4.244z"/></svg>
            </button>
          </div>

          <table v-if="isListVisible" class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Hora</th>
                <th>Serviço</th>
                <th>Cliente</th>
                <th>Funcionário</th>
                <th v-if="authStore.getUserRole !== 'profissional'">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="agendamentos.length === 0">
                <td colspan="7" class="empty-table-message">Nenhum agendamento encontrado.</td>
              </tr>
              <tr v-for="agendamento in agendamentos" :key="agendamento.id">
                <td>{{ agendamento.id }}</td>
                <td>{{ formatDate(agendamento.data) }}</td>
                <td>{{ agendamento.hora.substring(0, 5) }}</td>
                <td>{{ agendamento.servico?.nome }}</td>
                <td>{{ agendamento.cliente?.nome }}</td>
                <td>{{ agendamento.usuario?.fullName }}</td>
                <td v-if="authStore.getUserRole !== 'profissional'">
                  <button @click="abrirModalEdicao(agendamento)" class="action-button edit-button">Editar</button>
                  <button @click="abrirModalDelecao(agendamento)" class="action-button delete-button">Deletar</button>
                </td>
              </tr>
            </tbody>
          </table>
           <p v-else class="list-hidden-message">A lista de agendamentos está oculta.</p>
        </div> 
      </div>
    </main>

    <div v-if="showEditModal && authStore.getUserRole !== 'profissional'" class="modal-overlay" @click.self="fecharModalEdicao">
      <div class="modal-content">
        <h3 class="modal-title">Editar Agendamento</h3>
        <form @submit.prevent="updateAgendamento" class="modal-form">
          <div class="form-group">
            <label>Data</label>
            <input v-model="editingAgendamento.data" type="date" required class="input-field" />
          </div>
          <div class="form-group">
            <label>Hora</label>
            <input v-model="editingAgendamento.hora" type="time" required class="input-field" />
          </div>
          <div class="form-group">
            <label>Serviço</label>
            <select v-model="editingAgendamento.servicoId" required class="input-field">
              <option v-for="servico in servicos" :key="servico.id" :value="servico.id">{{ servico.nome }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Cliente</label>
            <select v-model="editingAgendamento.clienteId" required class="input-field">
              <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">{{ cliente.nome }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Funcionário</label>
            <select v-model="editingAgendamento.userId" required class="input-field">
              <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">{{ usuario.fullName }}</option>
            </select>
          </div>
          <div class="modal-actions">
            <button @click="fecharModalEdicao" type="button" class="button cancel-button">Cancelar</button>
            <button type="submit" class="button">Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showConfirmDeleteModal && authStore.getUserRole !== 'profissional'" class="modal-overlay" @click.self="fecharModalDelecao">
      <div class="modal-content">
        <h3 class="modal-title">Confirmar Exclusão</h3>
        <p>Tem certeza que deseja excluir este agendamento?</p>
        <div class="modal-actions">
          <button @click="fecharModalDelecao" class="button cancel-button">Cancelar</button>
          <button @click="confirmarDelecao" class="button delete-button-modal">Confirmar Exclusão</button>
        </div>
      </div>
    </div>

    <div v-if="showFilterModal" class="modal-overlay" @click.self="fecharModalFiltro">
      <div class="modal-content">
        <h3 class="modal-title">Filtrar Agendamentos</h3>
        <div class="filter-grid modal-form"> 
          <div class="form-group">
            <label>Data</label>
            <input type="date" v-model="filtros.data" class="input-field filter-field" />
          </div>
          <div class="form-group">
            <label>Hora</label>
            <input type="time" v-model="filtros.hora" class="input-field filter-field" />
          </div>
          <div class="form-group">
            <label>Serviço</label>
            <select v-model="filtros.servicoId" class="input-field filter-field">
              <option :value="null">Todos Serviços</option>
              <option v-for="servico in servicos" :key="servico.id" :value="servico.id">{{ servico.nome }}</option>
            </select>
          </div>
           <div class="form-group">
            <label>Cliente</label>
            <select v-model="filtros.clienteId" class="input-field filter-field">
              <option :value="null">Todos Clientes</option>
              <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">{{ cliente.nome }}</option>
            </select>
          </div>
           <div class="form-group" v-if="authStore.getUserRole !== 'profissional'">
            <label>Funcionário</label>
            <select v-model="filtros.userId" class="input-field filter-field">
              <option :value="null">Todos Funcionários</option>
              <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">{{ usuario.fullName }}</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
           <button @click="limparFiltrosEClose" class="button cancel-button">Limpar</button>
           <button @click="aplicarFiltrosEClose" class="button">Aplicar Filtros</button>
           <button @click="fecharModalFiltro" type="button" class="button cancel-button">Cancelar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// --- Controle dos Modais ---
const showEditModal = ref(false)
const showConfirmDeleteModal = ref(false)
const showFilterModal = ref(false) 
const isListVisible = ref(true); // <-- Estado para visibilidade da lista

function toggleListVisibility() { isListVisible.value = !isListVisible.value; } // <-- Função toggle

// --- Interfaces ---
interface Cliente { id: number; nome: string }
interface Usuario { id: number; fullName: string }
interface Servico { id: number; nome: string }
interface Agendamento {
  id: number
  data: string
  hora: string
  clienteId: number
  userId: number
  servicoId: number
  cliente: Cliente
  usuario: Usuario
  servico: Servico
}

// --- Estados Reativos ---
const agendamentos = ref<Agendamento[]>([])
const clientes = ref<Cliente[]>([])
const usuarios = ref<Usuario[]>([])
const servicos = ref<Servico[]>([])
const newAgendamento = ref({ data: '', hora: '', servicoId: null as number | null, clienteId: null as number | null, userId: null as number | null, })
const editingAgendamento = ref<Partial<Agendamento>>({})
const agendamentoParaDeletar = ref<Agendamento | null>(null)
const filtros = ref({ data: '', hora: '', servicoId: null as number | null, clienteId: null as number | null, userId: null as number | null, })

// --- Funções da API ---
const fetchAgendamentos = async (params: Record<string, any> = {}) => {
  try {
    const token = authStore.authToken
    if (!token) { router.push('/'); return }
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      const paramKey = key === 'userId' ? 'usuarioId' : key; 
      if (value !== null && value !== '') {
        queryParams.append(paramKey, String(value))
      }
    })
    const queryString = queryParams.toString()
    const response = await axios.get(`http://localhost:3333/api/agendamentos?${queryString}`, { headers: { Authorization: `Bearer ${token}` } })
    agendamentos.value = response.data
  } catch (error) { console.error('Erro ao buscar agendamentos:', error) }
}
const fetchDependentData = async () => {
  const token = authStore.authToken
  if (!token) return
  const headers = { Authorization: `Bearer ${token}` }
  try {
    const [servicosRes, clientesRes, usuariosRes] = await Promise.all([
      axios.get('http://localhost:3333/api/servicos', { headers }),
      axios.get('http://localhost:3333/api/clientes', { headers }),
      axios.get('http://localhost:3333/api/users', { headers })
    ]);
    servicos.value = servicosRes.data;
    clientes.value = clientesRes.data;
    usuarios.value = usuariosRes.data;
  } catch (error) { console.error('Erro ao buscar dados de suporte:', error); }
};
const createAgendamento = async () => {
  try {
    const token = authStore.authToken
    if (!token) return
    await axios.post('http://localhost:3333/api/agendamentos', newAgendamento.value, { headers: { Authorization: `Bearer ${token}` } })
    newAgendamento.value = { data: '', hora: '', servicoId: null, clienteId: null, userId: null }
    fetchAgendamentos(filtros.value)
  } catch (error) { console.error('Erro ao criar agendamento:', error); alert('Falha ao criar agendamento.') }
};
const updateAgendamento = async () => {
  try {
    const token = authStore.authToken
    if (!token || !editingAgendamento.value.id) return
    await axios.put(`http://localhost:3333/api/agendamentos/${editingAgendamento.value.id}`, editingAgendamento.value, { headers: { Authorization: `Bearer ${token}` } })
    fecharModalEdicao()
    fetchAgendamentos(filtros.value)
  } catch (error) { console.error('Erro ao atualizar agendamento:', error); alert('Falha ao atualizar agendamento.') }
}
const confirmarDelecao = async () => {
  try {
    const token = authStore.authToken
    if (!token || !agendamentoParaDeletar.value) return
    await axios.delete(`http://localhost:3333/api/agendamentos/${agendamentoParaDeletar.value.id}`, { headers: { Authorization: `Bearer ${token}` } })
    fecharModalDelecao()
    fetchAgendamentos(filtros.value)
  } catch (error) { console.error('Erro ao deletar agendamento:', error); alert('Falha ao deletar agendamento.') }
}

// --- Funções Helper para os Modais ---
const abrirModalEdicao = (agendamento: Agendamento) => {
  const formattedDate = new Date(agendamento.data).toISOString().split('T')[0];
  const formattedTime = agendamento.hora.length >= 5 ? agendamento.hora.substring(0, 5) : agendamento.hora;
  editingAgendamento.value = { ...agendamento, data: formattedDate, hora: formattedTime };
  showEditModal.value = true
}
const fecharModalEdicao = () => { showEditModal.value = false; editingAgendamento.value = {} }
const abrirModalDelecao = (agendamento: Agendamento) => { agendamentoParaDeletar.value = agendamento; showConfirmDeleteModal.value = true }
const fecharModalDelecao = () => { showConfirmDeleteModal.value = false; agendamentoParaDeletar.value = null }
const handleDelete = (agendamento: Agendamento) => { abrirModalDelecao(agendamento); }
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  date.setUTCDate(date.getUTCDate() + 1); 
  return date.toLocaleDateString('pt-BR');
}

// --- Funções para o Modal de Filtro ---
function abrirModalFiltro() { showFilterModal.value = true; }
function fecharModalFiltro() { showFilterModal.value = false; }
function aplicarFiltrosEClose() { fetchAgendamentos(filtros.value); fecharModalFiltro(); }
function limparFiltrosEClose() {
  filtros.value = { data: '', hora: '', servicoId: null, clienteId: null, userId: null };
  fetchAgendamentos(); 
  fecharModalFiltro();
}

onMounted(() => {
  fetchAgendamentos();
  fetchDependentData();
})
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

/* --- ESTILOS DO CABEÇALHO DA LISTA --- */
.list-header {
  display: flex;
  flex-wrap: wrap; /* Permite quebrar linha */
  justify-content: space-between; /* Espaça título e filtro */
  align-items: flex-start; /* Alinha no topo */
  gap: 1rem; 
  margin-bottom: 1.5rem; /* Espaço antes da tabela/mensagem */
}
.title-toggle-wrapper {
  display: flex;
  align-items: center; /* Alinha verticalmente */
  gap: 0.75rem; /* Espaço entre título e ícone */
  width: auto; /* Ajusta para não ocupar tudo */
  flex-shrink: 0; /* Impede de encolher */
}
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #555;
  margin: 0; /* Remove margem padrão */
  /* Adiciona a borda e padding diretamente no título */
  padding-bottom: 0.5rem; 
  border-bottom: 2px solid #f0f2f5; 
}
/* Ajuste para o título dentro do list-header (sem borda repetida) */
.list-header .section-title {
   margin-bottom: 0; 
   border-bottom: none;
   padding-bottom: 0;
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
.filter-icon-button {
  background: none; 
  border: none; 
  padding: 0.5rem; 
  height: 36px; 
  width: 36px;  
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease-in-out, background-color 0.2s ease-in-out; 
  border-radius: 0.5rem; 
}
.filter-icon-button:hover {
  background-color: #f0f2f5; 
  transform: scale(1.05); 
}
.filter-icon-button svg {
  color: #6a1b9a; 
  width: 20px; 
  height: 20px; 
}
/* --- FIM DOS ESTILOS DO CABEÇALHO --- */

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  align-items: end;
  margin-top: 1rem;
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
  height: 40px; 
  box-sizing: border-box;
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

/* --- Estilos do Modal --- */
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
  max-width: 600px;
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
  flex-wrap: wrap; 
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem; 
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

/* Estilos da Grid de Filtros dentro do Modal */
.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  align-items: end; 
}
.filter-field {
  width: 100%;
}
.list-hidden-message {
  text-align: center;
  color: #718096;
  padding: 2rem 0; 
  margin-top: 0; 
}

/* Media query para ajustar layout em telas menores */
@media (max-width: 768px) {
  .list-header {
     justify-content: space-between; 
  }
  .title-toggle-wrapper {
     width: 100%; /* Ocupa linha inteira */
     margin-bottom: 1rem; /* Espaço antes do botão de filtro */
  }
  .filter-icon-button {
      margin-left: auto; 
  }
}
</style>