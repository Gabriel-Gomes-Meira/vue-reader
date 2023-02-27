import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'

import 'flowbite';

const app = createApp(App).use(store)
import '../public/output.css'
app.use(router).mount('#app')
