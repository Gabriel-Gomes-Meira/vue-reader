<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Cadastro de Palavras</h1>

    <!-- Formulário para adicionar nova word -->
    <form @submit.prevent="cadastrarPalavra" class="space-y-4 mb-8">
      <div class="form-control">
        <label class="label w-full">
          <span class="label-text">Palavra</span>
        </label>
        <input
            type="text"
            v-model="word.term"
            class="input input-bordered w-full max-w-md"
            required
        />
      </div>

      <div class="form-control">
        <label class="label w-full">
          <span class="label-text">Tradução</span>
        </label>
        <input
            type="text"
            v-model="word.translate"
            class="input input-bordered w-full max-w-md"
        />
      </div>

      <button type="submit" class="btn btn-primary">Cadastrar Palavra</button>
    </form>

    <!-- Lista de Palavras Cadastradas -->
    <div class="mt-8">
      <h2 class="text-xl font-bold mb-4">Palavras Cadastradas</h2>
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
          <tr>
            <th>Palavra</th>
            <th>Traduções</th>
            <th>Ações</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) in words" :key="index">
            <td>{{ item.term }}</td>
            <td>
              <ul>
                <li v-for="(translate, idx) in item.translates" :key="idx">
                  {{ translate }}
                  <button
                      class="btn btn-error btn-xs ml-2"
                      @click="removertranslate(item.id, idx)"
                  >
                    Excluir
                  </button>
                </li>
              </ul>
            </td>
            <td>
              <button class="btn btn-error btn-sm" @click="removerPalavra(item.id)">
                Excluir Palavra
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
import { ref, onMounted } from 'vue';

const word = ref({
  term: '',
  translate: ''
});

const words = ref([]);

// Carregar words e traduções
const carregarPalavras = async () => {
  try {
    const response = await fetch('/api/words');
    words.value = await response.json();
  } catch (error) {
    console.error('Erro ao carregar words:', error);
  }
};

// Cadastrar nova word com tradução
const cadastrarPalavra = async () => {
  try {
    const response = await fetch('/api/words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        term: word.value.term,
        translate: word.value.translate
      })
    });

    if (response.ok) {
      word.value = { term: '', translate: '' }; // Limpar o formulário
      await carregarPalavras(); // Recarregar as words
    }
  } catch (error) {
    console.error('Erro ao cadastrar word:', error);
  }
};

// Remover tradução de uma word
const removertranslate = async (wordId: number, translateIndex: number) => {
  try {
    const response = await fetch(`/api/words/${wordId}/translate/${translateIndex}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      await carregarPalavras();
    }
  } catch (error) {
    console.error('Erro ao remover tradução:', error);
  }
};

// Remover uma word
const removerPalavra = async (wordId: number) => {
  try {
    const response = await fetch(`/api/words/${wordId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      await carregarPalavras();
    }
  } catch (error) {
    console.error('Erro ao remover word:', error);
  }
};

// Carregar words ao montar o componente
onMounted(() => {
  carregarPalavras();
});
</script>
