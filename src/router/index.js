import Explorer from '../components/Explorer.vue'
import ExplorerChilds  from '../components/ExplorerChilds.vue'
import Reader from '../components/Reader.vue'
import {createRouter, createWebHashHistory} from 'vue-router'
// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
  { path: '/', component: Explorer },
  { path: '/:index', component: ExplorerChilds },
  { path: '/Reader/:name,', component: Reader, name: 'reader'}  
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHashHistory(),
  routes, // short for `routes: routes`
})

export default router;
