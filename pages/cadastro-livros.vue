<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Cadastro de Livros</h1>

    <form @submit.prevent="cadastrarLivro" class="space-y-4">
      <div class="form-control">
        <label class="label w-full">
          <span class="label-text">Nome do Livro</span>
        </label>
        <input
            type="text"
            v-model="livro.nome"
            class="input input-bordered w-full max-w-md"
            required
        />
      </div>

      <div class="form-control">
        <label class="label w-full">
          <span class="label-text">Série</span>
        </label>
        <select
            v-model="livro.serieId"
            class="select select-bordered w-full max-w-md"
            required
        >
          <option value="" disabled selected>Selecione uma série</option>
          <option v-for="serie in series" :key="serie.id" :value="serie.id">
            {{ serie.titulo }}
          </option>
        </select>
      </div>

      <div class="form-control">
        <label class="label w-full">
          <span class="label-text">Arquivo EPUB</span>
        </label>
        <input
            type="file"
            @change="handleFileUpload"
            accept=".epub"
            class="file-input file-input-bordered w-full max-w-md"
            required
        />
      </div>

      <button type="submit" class="btn btn-primary">Cadastrar Livro</button>
    </form>

    <!-- Lista de Livros -->
    <div class="mt-8">
      <h2 class="text-xl font-bold mb-4">Livros Cadastrados</h2>
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Série</th>
            <th>Ações</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="livro in livros" :key="livro.id">
            <td>{{ livro.id }}</td>
            <td>{{ livro.nome }}</td>
            <td>{{ livro.serie.titulo }}</td>
            <td>
              <button class="btn btn-error btn-sm" @click="deletarLivro(livro.id)">
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
const livro = ref({
  nome: '',
  serieId: '',
  conteudo: null as File | null
})

const livros = ref([])
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

// Carregar livros
const carregarLivros = async () => {
  try {
    const response = await fetch('/api/livros')
    livros.value = await response.json()
  } catch (error) {
    console.error('Erro ao carregar livros:', error)
  }
}

// Manipular upload de arquivo
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    livro.value.conteudo = target.files[0]
  }
}

// Cadastrar livro
const cadastrarLivro = async () => {
  try {
    const formData = new FormData()
    formData.append('nome', livro.value.nome)
    formData.append('serieId', livro.value.serieId.toString())
    if (livro.value.conteudo) {
      formData.append('epub', livro.value.conteudo)
    }

    const response = await fetch('/api/livros', {
      method: 'POST',
      body: formData
    })

    if (response.ok) {
      livro.value = { nome: '', serieId: '', conteudo: null }
      await carregarLivros()
    }
  } catch (error) {
    console.error('Erro ao cadastrar livro:', error)
  }
}

// Deletar livro
const deletarLivro = async (id: number) => {
  try {
    const response = await fetch(`/api/livros/${id}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      await carregarLivros()
    }
  } catch (error) {
    console.error('Erro ao deletar livro:', error)
  }
}

// Carregar dados ao montar o componente
onMounted(() => {
  carregarSeries()
  carregarLivros()
})
</script>