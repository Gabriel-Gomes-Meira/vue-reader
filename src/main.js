import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'


const app = createApp(App).use(store)

app.use(router).mount('#app')
