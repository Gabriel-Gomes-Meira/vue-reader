<template>
  <div class="w-96 bg-base-100 py-4 rounded-b-3xl border-primary border-4">
    <div>
      <div class="flex justify-center">
        <div class="form-control">
          <div class="input-group">
            <input
              type="text"
              placeholder="Search…"
              class="input input-bordered"
              :value="modelValue"
              @input="$emit('update:modelValue', $event.target.value)"
            />
            <button class="btn btn-square"
            @click="getTranslation">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="flex justify-center my-4">
        <div class="translate-box w-80">
          <pre>{{ response }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  
  props: ["modelValue"],

  emits: ["update:modelValue"],

  data: () => {
    return {
      response: "",
      de: import.meta.env.VITE_DE
    };
  },

  methods: {
    getTranslation() {        
        axios.get(`https://api.mymemory.translated.net/get?q=${this.modelValue}!&langpair=en|pt-BR&de=${this.de}`)
        .then((response) => {
            const json = response.data
            
            
            this.response = "1 - " + json.responseData.translatedText + "\n"

            let index = 1            
            json.matches.forEach(element => {
                index++;
                this.response += `${index} - ${element.translation}\n`
            });            
        })
    }
  }
};
</script>

<style>
.translate-box {
  width: 330px;
  max-height: 80px;
  overflow-y: scroll;
}

.translate-box::-webkit-scrollbar {
  width: 4px;
}
.translate-box::-webkit-scrollbar-track {
  background-color: rgb(15, 23, 42);
  border-radius: 0px;
}
.translate-box::-webkit-scrollbar-thumb {
  background: #b4c6ef68;
  border: solid #74758400;
  border-radius: 2px;
}
</style>