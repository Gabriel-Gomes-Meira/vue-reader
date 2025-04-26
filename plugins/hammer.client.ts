// plugins/hammer.client.ts
import Hammer from 'hammerjs'

export default defineNuxtPlugin(() => {
    return {
        provide: {
            hammer: Hammer
        }
    }
})