<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  type ChartData,
} from 'chart.js'

// Registra os componentes necessários do Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

// Define as propriedades que o componente aceita
defineProps<{
  chartData: ChartData<'bar'>,
  chartOptions?: object,
}>()

</script>