<template>
  <div class="dashboard-container">
    <Sidebar />

    <main class="main-content">
      <div class="content-wrapper">
        <h1 class="page-title">Gestão de Serviços</h1>

        <div class="section-card" v-if="authStore.getUserRole !== 'recepcionista'">
          <h2 class="section-title">Adicionar Novo Serviço</h2>
          <form @submit.prevent="salvarNovoServico" class="form-grid">
            <input v-model="novoServico.nome" type="text" placeholder="Nome do Serviço" required class="input-field" />
            <input v-model.number="novoServico.duracao" type="number" placeholder="Duração (min)" required class="input-field" />
            <input v-model.number="novoServico.preco" type="number" step="0.01" placeholder="Preço (R$)" required class="input-field" />
            <button type="submit" class="button">Adicionar Serviço</button>
          </form>
        </div>

        <div class="section-card">
          <div class="list-header">
            <div class="title-toggle-wrapper">
              <h2 class="section-title">Lista de Serviços</h2>
              <button @click="toggleListVisibility" class="toggle-icon-button" :title="isListVisible ? 'Esconder Lista' : 'Mostrar Lista'">
                <svg v-if="isListVisible" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                   <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
                </svg>
              </button>
            </div>
            <div class="filter-container">
              <div class="filter-select-wrapper">
                 <button class="filter-button" title="Filtrar por nome">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 7.46V13a.5.5 0 0 1-.276.447l-3 1.5A.5.5 0 0 1 6 14.5V7.46L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .53L6 6.276v6.92l3-1.5V6.276l4.5-4.244z"/></svg>
                   <span>Nome</span>
                 </button>
              </div>
              <input 
                type="text" 
                v-model="termoBuscaServico" 
                placeholder="Buscar por nome..." 
                class="search-input" />
              <button class="search-button" title="Buscar">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/></svg>
              </button>
            </div>
          </div>

          <table v-if="isListVisible" class="data-table">
            <thead>
              <tr>
                <th>Nome do Serviço</th>
                <th>Duração (min)</th>
                <th>Preço (R$)</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
               <tr v-if="servicosFiltrados.length === 0">
                 <td colspan="4" class="empty-table-message">Nenhum serviço encontrado.</td>
               </tr>
              <tr v-for="servico in servicosFiltrados" :key="servico.id">
                <td>{{ servico.nome }}</td>
                <td>{{ servico.duracao }}</td>
                <td>R$ {{ servico.preco.toFixed(2) }}</td>
                <td>
                  <button @click="abrirModalEdicao(servico)" class="action-button edit-button">Editar</button>
                  <button @click="abrirModalDelecao(servico)" class="action-button delete-button">Deletar</button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="list-hidden-message">A lista de serviços está oculta.</p>

        </div>
      </div>
    </main>

    <div v-if="showEditModal" class="modal-overlay" @click.self="fecharModalEdicao">
      <div class="modal-content">
        <h3 class="modal-title">Editar Serviço</h3>
        <form @submit.prevent="atualizarServico" class="modal-form">
          <div class="form-group">
            <label for="edit-nome">Nome do Serviço</label>
            <input id="edit-nome" v-model="servicoEmEdicao.nome" type="text" required class="input-field" />
          </div>
          <div class="form-group">
            <label for="edit-duracao">Duração (min)</label>
            <input id="edit-duracao" v-model.number="servicoEmEdicao.duracao" type="number" required class="input-field" />
          </div>
          <div class="form-group">
            <label for="edit-preco">Preço (R$)</label>
            <input id="edit-preco" v-model.number="servicoEmEdicao.preco" type="number" step="0.01" required class="input-field" />
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
        <p>Tem certeza que deseja excluir o serviço "{{ servicoParaDeletar?.nome }}"?</p>
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

const showConfirmDeleteModal = ref(false);
const showEditModal = ref(false);
const isListVisible = ref(true); 

function toggleListVisibility() { isListVisible.value = !isListVisible.value; }

interface Servico {
  id: number;
  nome: string;
  duracao: number;
  preco: number;
}

const servicos = ref<Servico[]>([]);
const novoServico = ref({ nome: '', duracao: null as number | null, preco: null as number | null });
const servicoEmEdicao = ref<Partial<Servico>>({});
const servicoParaDeletar = ref<Servico | null>(null);

const termoBuscaServico = ref('');

const servicosFiltrados = computed(() => {
  if (!termoBuscaServico.value.trim()) {
    return servicos.value;
  }
  const busca = termoBuscaServico.value.toLowerCase().trim();
  return servicos.value.filter(servico => 
    servico.nome && servico.nome.toLowerCase().includes(busca)
  );
});

const fetchServicos = async () => {
  const token = authStore.authToken;
  if (!token) { router.push('/'); return; }
  try {
    const response = await axios.get('http://localhost:3333/api/servicos', { headers: { 'Authorization': `Bearer ${token}` } });
    servicos.value = response.data.map((servico: any) => ({ ...servico, preco: Number(servico.preco) }));
  } catch (error) { console.error('Erro ao buscar serviços:', error); }
};
const salvarNovoServico = async () => {
  const token = authStore.authToken;
  if (!token) return;
  try {
    await axios.post('http://localhost:3333/api/servicos', novoServico.value, { headers: { 'Authorization': `Bearer ${token}` } });
    novoServico.value = { nome: '', duracao: null, preco: null };
    await fetchServicos();
  } catch (error) { console.error('Erro ao salvar o serviço:', error); alert('Falha ao adicionar serviço.'); }
};
const atualizarServico = async () => {
  if (!servicoEmEdicao.value.id) return;
  const token = authStore.authToken;
  if (!token) return;
  try {
    await axios.put(`http://localhost:3333/api/servicos/${servicoEmEdicao.value.id}`, servicoEmEdicao.value, { headers: { 'Authorization': `Bearer ${token}` } });
    await fetchServicos();
    fecharModalEdicao();
  } catch (error) { console.error('Erro ao atualizar o serviço:', error); alert('Falha ao atualizar o serviço.'); }
};
const confirmarDelecao = async () => {
  if (!servicoParaDeletar.value) return;
  const token = authStore.authToken;
  if (!token) return;
  try {
    await axios.delete(`http://localhost:3333/api/servicos/${servicoParaDeletar.value.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
    await fetchServicos();
  } catch (error) { console.error(`Erro ao deletar o serviço`, error); alert('Falha ao excluir o serviço.'); } 
  finally { fecharModalDelecao(); }
};

const abrirModalEdicao = (servico: Servico) => { servicoEmEdicao.value = { ...servico }; showEditModal.value = true; };
const fecharModalEdicao = () => { showEditModal.value = false; servicoEmEdicao.value = {}; };
const abrirModalDelecao = (servico: Servico) => { servicoParaDeletar.value = servico; showConfirmDeleteModal.value = true; };
const fecharModalDelecao = () => { showConfirmDeleteModal.value = false; servicoParaDeletar.value = null; };

onMounted(() => { fetchServicos(); });
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

/* --- ESTILOS DO FORMULÁRIO DE ADIÇÃO (Novos Serviços) --- */
.section-card > .section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 1.5rem; 
  border-bottom: 2px solid #f0f2f5; 
  padding-bottom: 0.5rem; 
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) minmax(auto, max-content); 
  gap: 1rem; 
  align-items: center; 
  margin-top: 1rem;
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
/* --- FIM DOS ESTILOS DO FORMULÁRIO DE ADIÇÃO --- */

/* --- ESTILOS DA LISTA E FILTRO --- */
.list-header {
  display: flex;
  flex-wrap: wrap; 
  justify-content: space-between; 
  align-items: flex-start; 
  gap: 1rem; 
  margin-bottom: 1.5rem; 
}
.title-toggle-wrapper {
  display: flex;
  align-items: center; 
  gap: 0.75rem; 
  width: auto; 
  flex-shrink: 0; 
}
.section-card .section-title { /* Especifica para não afetar o título do formulário */
  font-size: 1.5rem;
  font-weight: 600;
  color: #555;
  margin: 0; 
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
  margin-top: 4px; 
}
.toggle-icon-button:hover {
  background-color: #f0f2f5; 
}
.toggle-icon-button svg {
   width: 1em; 
   height: 1em;
}
.filter-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: white;
  width: 100%; 
  max-width: 350px; 
  margin-left: auto; 
}
.filter-select-wrapper {
  position: relative;
}
.filter-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: default; 
  color: #555;
  padding: 0.25rem 0.5rem;
}
.filter-button svg {
  color: #6a1b9a;
}
.search-input {
  border: none;
  outline: none;
  flex-grow: 1; 
  padding: 0.5rem;
}
.search-button {
  background: none;
  border: none;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  color: #6a1b9a;
}
/* --- FIM DOS ESTILOS DA LISTA E FILTRO --- */

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
   .filter-container {
      width: 100%; 
      margin-left: 0; 
  }
}
</style>