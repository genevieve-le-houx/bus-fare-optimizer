import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Vuetify
//import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import MomentAdapter from '@date-io/moment'
import { VDateInput } from 'vuetify/labs/VDateInput'

const vuetify = createVuetify({
  components: {
    ...components,
    VDateInput,
  },
  directives,
  date: {
    adapter: MomentAdapter,
  }
})

createApp(App).use(vuetify).mount('#app')
