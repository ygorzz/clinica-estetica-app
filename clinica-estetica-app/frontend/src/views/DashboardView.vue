<template>
  <div class="dashboard-container">
    <Sidebar />

    <main class="main-content">
      <div class="content-wrapper">
        <h1 class="page-title">Bem-vindo(a), {{ authStore.getUserName }}!</h1>

        <div v-if="isLoading" class="loading-message">Carregando informações do dashboard...</div>

        <div v-if="!isLoading && dashboardData" class="section-card">
            <h2 class="section-title">Agenda de Hoje ({{ new Date().toLocaleDateString('pt-BR') }})</h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th v-if="authStore.getUserRole !== 'funcionario'">Profissional</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="dashboardData.agendaDoDia.length === 0">
                  <td :colspan="authStore.getUserRole !== 'funcionario' ? 4 : 3" class="empty-table-message">
                    Nenhum agendamento para hoje.
                  </td>
                </tr>
                <tr v-for="agendamento in dashboardData.agendaDoDia" :key="agendamento.id">
                  <td>{{ agendamento.hora.substring(0, 5) }}</td>
                  <td>{{ agendamento.cliente.nome }}</td>
                  <td>{{ agendamento.servico.nome }}</td>
                  <td v-if="authStore.getUserRole !== 'funcionario'">{{ agendamento.usuario.fullName }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- PAINEL DE MÉTRICAS -->
        <div v-if="!isLoading && dashboardData" class="painel-metricas">
          <div v-if="authStore.getUserRole === 'dono' || authStore.getUserRole === 'gerente' || authStore.getUserRole === 'profissional'" class="reports-grid">
            <div class="section-card report-card">
              <h2 class="report-title">{{ authStore.getUserRole === 'profissional' ? 'Meus Clientes' : 'Clientes na Base' }}</h2>
            <p class="report-value">{{ dashboardData.metricas.totalClientes }}</p>
            <p class="report-description">Total de clientes cadastrados.</p>
            </div>
            <div class="section-card report-card large-card" v-if="authStore.getUserRole !== 'profissional'">
            <h2 class="report-title">Tratamentos Mais Realizados</h2>
            
            <div v-if="!isLoading && dashboardData.metricas.tratamentosMaisVendidos && dashboardData.metricas.tratamentosMaisVendidos.length > 0" style="height: 300px;">
              <BarChart :chartData="chartDataForBarChart" :chartOptions="chartOptions" />
            </div>
            <p v-else class="empty-list-message">Nenhum agendamento registrado para gerar o gráfico.</p>
          </div>

          <div class="section-card report-card large-card" v-else>
            <h2 class="report-title">Meus Atendimentos (Últimos 7 dias)</h2>
            
            <div v-if="!isLoading && dashboardData.metricas.atendimentosPorDia && dashboardData.metricas.atendimentosPorDia.length > 0" style="height: 300px;">
              <BarChart :chartData="chartDataFor7DayChart" :chartOptions="chartOptions" />
            </div>
            <p v-else class="empty-list-message">Nenhum atendimento registrado na última semana.</p>
          </div>
          </div> 
        </div>
        
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import BarChart from '@/components/BarChart.vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import type { ChartData } from 'chart.js'

const authStore = useAuthStore()
const dashboardData = ref<any>(null)
const isLoading = ref(true)

// --- Interfaces para os Dados ---
interface TratamentoVendidoAPI {
  nome: string;
  total: string; // O total vem como string da API
}

// Paleta de cores para o gráfico
const chartColors = [
  '#6a1b9a', '#2c7a7b', '#d69e2e', '#dd6b20', '#c53030',
  '#3182ce', '#38a169',
]

// Computed property para o gráfico do Profissional (Últimos 7 dias)
const chartDataFor7DayChart = computed((): ChartData<'bar'> => {
  // Lê os novos dados 'atendimentosPorDia' que o backend envia
  if (!dashboardData.value?.metricas?.atendimentosPorDia) {
    return { labels: [], datasets: [] }
  }

  // Define a interface para os novos dados
  const atendimentos: { data: string; total: string }[] = dashboardData.value.metricas.atendimentosPorDia;
  
  const labels = atendimentos.map((a) => a.data); // ex: ['30/10', '31/10', '01/11']
  const data = atendimentos.map((a) => Number(a.total));

  return {
    labels,
    datasets: [
      {
        label: 'Total de Atendimentos',
        backgroundColor: '#6a1b9a',
        data,
      },
    ],
  }
})

const chartDataForBarChart = computed((): ChartData<'bar'> => {
  if (!dashboardData.value?.metricas?.tratamentosMaisVendidos) {
    return { labels: [], datasets: [  ] }
  }

  const tratamentos: TratamentoVendidoAPI[] = dashboardData.value.metricas.tratamentosMaisVendidos;
  
  const labels = tratamentos.map((t) => t.nome);
  const data = tratamentos.map((t) => Number(t.total));

  return {
    labels,
    datasets: [
      {
        label: 'Total de Agendamentos',
        // Adicionamos os tipos aqui para resolver o erro
        backgroundColor: data.map((_: number, index: number) => chartColors[index % chartColors.length]),
        data,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

async function fetchDashboardData() {
  isLoading.value = true;
  const token = authStore.authToken;
  if (!token) return;

  try {
    const response = await axios.get('http://localhost:3333/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    });
    dashboardData.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

.dashboard-container {
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  background-color: #f5f7fa;
}
.main-content {
  flex-grow: 1;
  padding: 2rem;
  width: 100%;
}
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}
.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
}
.loading-message {
  padding: 2rem;
  text-align: center;
  color: #555;
}
.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}
.section-card {
  background-color: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.report-card {
  display: flex;
  flex-direction: column;
}
.report-title, .section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #555;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f0f2f5;
}
.report-value {
  font-size: 3rem;
  font-weight: 700;
  color: #6a1b9a;
  margin: 0;
}
.report-description {
  color: #718096;
  margin-top: 0.5rem;
}
.large-card {
  grid-column: span 1;
}
@media (min-width: 992px) {
  .large-card {
    grid-column: span 2;
  }
}
.report-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
}
.report-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f2f5;
}
.report-list li:last-child {
  border-bottom: none;
}
.list-value {
  font-weight: 600;
  color: #333;
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
  font-weight: 600;
}
.empty-table-message, .empty-list-message {
  text-align: center;
  color: #718096;
  padding: 2rem;
}
.painel-metricas{
  margin-top: 2rem;
}
</style>