<template>
  <div class="container mx-auto grid
    grid-cols-3 gap-x-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 zxl-grid-cols-12">
    <div v-for="(data) in series" :key="data.id"
         class="card bg-cyan-400  hover:bg-cyan-500 text-primary-content"
         style="cursor: pointer;">
      <NuxtLink :to="`/livros/${data.id}`">
        <div class="card-body">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>

          <h2 class="card-title">
            <span class="truncate md:text-clip md:overflow-visible md:whitespace-normal"> {{ data.titulo }} </span>
          </h2>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const series = ref([])
// Carregar séries
const carregarSeries = async () => {
  try {
    const response = await fetch('/api/series')
    series.value = await response.json()
  } catch (error) {
    console.error('Erro ao carregar séries:', error)
  }
}

onMounted(async () => {
  carregarSeries()
})
</script>