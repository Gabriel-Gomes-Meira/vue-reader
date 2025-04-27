<template>
  <div class="container mx-auto grid
    grid-cols-3 gap-x-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 zxl-grid-cols-12">
    <div v-for="(data) in books" :key="data.id"
         class="card bg-cyan-400 hover:bg-cyan-500 text-primary-content"
         style="cursor: pointer;">
      <NuxtLink :to="`/reader/${data.id}`">
        <div class="card-body">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <h2 class="card-title">
            <span class="truncate md:text-clip md:overflow-visible md:whitespace-normal"> {{ data.name }} </span>
          </h2>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const books = ref([])

const carregarLivros = async (id) => {
  try {
    const response = await fetch(`/api/books?serieId=${id}`)
    books.value = await response.json()
  } catch (error) {
    console.error('Erro ao carregar books:', error)
  }
}

onMounted(() => {
  const id = parseInt(route.params.id)
  carregarLivros(id)
})
</script>