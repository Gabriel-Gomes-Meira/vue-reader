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
            v-model="book.name"
            class="input input-bordered w-full max-w-md"
            required
        />
      </div>

      <div class="form-control">
        <label class="label w-full">
          <span class="label-text">Série</span>
        </label>
        <select
            v-model="book.serieId"
            class="select select-bordered w-full max-w-md"
            required
        >
          <option value="" disabled selected>Selecione uma série</option>
          <option v-for="serie in series" :key="serie.id" :value="serie.id">
            {{ serie.title }}
          </option>
        </select>
      </div>

      <!-- Input para múltiplos arquivos Markdown -->
      <div class="form-control">
        <label class="label w-full">
          <span class="label-text">Arquivos Markdown</span>
        </label>
        <input
            type="file"
            @change="handleMarkdownFilesUpload"
            accept=".md"
            class="file-input file-input-bordered w-full max-w-md"
            multiple
            required
        />
      </div>

      <!-- Input para múltiplos arquivos de imagem -->
      <div class="form-control">
        <label class="label w-full">
          <span class="label-text">Imagens</span>
        </label>
        <input
            type="file"
            @change="handleImageFilesUpload"
            accept="image/*"
            class="file-input file-input-bordered w-full max-w-md"
            multiple
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
          <tr v-for="book in books" :key="book.id">
            <td>{{ book.id }}</td>
            <td>{{ book.name }}</td>
            <td>{{ book.serie.title }}</td>
            <td>
              <button class="btn btn-error btn-sm" @click="deletarLivro(book.id)">
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
import { ref, onMounted } from 'vue'

const markdownFiles = ref<File[]>([])
const imageFiles = ref<File[]>([])

const book = ref({
  name: '',
  serieId: '',
  markdownFile: null as File | null,
  images: [] as File[]
})

const books = ref([])
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
    const response = await fetch('/api/books')
    books.value = await response.json()
  } catch (error) {
    console.error('Erro ao carregar livros:', error)
  }
}

// Manipular upload de arquivos Markdown
const handleMarkdownFilesUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    markdownFiles.value = Array.from(target.files)
  }
}

// Manipular upload do arquivo Markdown
const handleMarkdownUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    book.value.markdownFile = target.files[0]
  }
}

// Manipular upload de arquivos de imagem
const handleImageFilesUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    imageFiles.value = Array.from(target.files)
  }
}

// Manipular upload das imagens
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    book.value.images = Array.from(target.files)
  }
}

// Cadastrar livro
const cadastrarLivro = async () => {
  try {
    const formData = new FormData()
    formData.append('name', book.value.name)
    formData.append('serieId', book.value.serieId.toString())

    // Adicionando os arquivos markdown
    markdownFiles.value.forEach(file => formData.append('markdownFiles', file))

    // Adicionando as imagens
    imageFiles.value.forEach(file => formData.append('imageFiles', file))

    const response = await fetch('/api/books', {
      method: 'POST',
      body: formData
    })

    if (response.ok) {
      book.value = { name: '', serieId: '', content: null }
      await carregarLivros()
    }
  } catch (error) {
    console.error('Erro ao cadastrar livro:', error)
  }
}

// Deletar livro
const deletarLivro = async (id: number) => {
  try {
    const response = await fetch(`/api/books/${id}`, {
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
