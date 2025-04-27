
<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">{{ modoEdicao ? 'Editar Série' : 'Cadastro de Séries' }}</h1>

    <form @submit.prevent="modoEdicao ? atualizarSerie() : cadastrarSerie()" class="space-y-4">
      <div class="form-control">
        <label class="label w-full">
          <span class="label-text">Título da Série</span>
        </label>
        <input
            type="text"
            v-model="serie.title"
            class="input input-bordered w-full max-w-md"
            required
        />
      </div>

      <div class="form-control">
        <label class="label w-full">
          <span class="label-text">Autor</span>
        </label>
        <input
            type="text"
            v-model="serie.author"
            class="input input-bordered w-full max-w-md"
            required
        />
      </div>

      <div class="flex gap-2">
        <button type="submit" class="btn btn-primary">
          {{ modoEdicao ? 'Atualizar' : 'Cadastrar' }} Série
        </button>
        <button
            v-if="modoEdicao"
            type="button"
            @click="cancelarEdicao"
            class="btn btn-ghost"
        >
          Cancelar
        </button>
      </div>
    </form>

    <!-- Lista de Séries -->
    <div class="mt-8">
      <h2 class="text-xl font-bold mb-4">Séries Cadastradas</h2>
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Autor</th>
            <th>Ações</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in series" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.title }}</td>
            <td>{{ item.author }}</td>
            <td class="flex gap-2">
              <button
                  class="btn btn-info btn-sm"
                  @click="iniciarEdicao(item)"
              >
                Editar
              </button>
              <button
                  class="btn btn-error btn-sm"
                  @click="deletarSerie(item.id)"
              >
                Excluir
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const serie = ref({
  id: null as number | null,
  title: '',
  author: ''
})

const series = ref([])
const modoEdicao = ref(false)

// Carregar séries
const carregarSeries = async () => {
  try {
    const response = await fetch('/api/series')
    series.value = await response.json()
  } catch (error) {
    console.error('Erro ao carregar séries:', error)
  }
}

// Cadastrar série
const cadastrarSerie = async () => {
  try {
    const response = await fetch('/api/series', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(serie.value)
    })

    if (response.ok) {
      limparFormulario()
      await carregarSeries()
    }
  } catch (error) {
    console.error('Erro ao cadastrar série:', error)
  }
}

// Iniciar edição
const iniciarEdicao = (item: any) => {
  serie.value = { ...item }
  modoEdicao.value = true
}

// Atualizar série
const atualizarSerie = async () => {
  try {
    const response = await fetch(`/api/series/${serie.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: serie.value.title,
        author: serie.value.author
      })
    })

    if (response.ok) {
      cancelarEdicao()
      await carregarSeries()
    }
  } catch (error) {
    console.error('Erro ao atualizar série:', error)
  }
}

// Cancelar edição
const cancelarEdicao = () => {
  modoEdicao.value = false
  limparFormulario()
}

// Limpar formulário
const limparFormulario = () => {
  serie.value = {
    id: null,
    title: '',
    author: ''
  }
}

// Deletar série
const deletarSerie = async (id: number) => {
  try {
    const response = await fetch(`/api/series/${id}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      await carregarSeries()
    }
  } catch (error) {
    console.error('Erro ao deletar série:', error)
  }
}

// Carregar séries ao montar o componente
onMounted(() => {
  carregarSeries()
})
</script>