import {createApp} from 'vue';
import App from './App.vue';
import router from './router';
import 'element-plus/dist/index.css';
import './style.css';
import ElementPlus from 'element-plus';
import { createPinia } from 'pinia';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import piniaPersistedState from 'pinia-plugin-persistedstate';
const pinia = createPinia().use(piniaPersistedState)
const app = createApp(App).use(pinia)

app.use(ElementPlus, {
    locale: zhCn,
});

app.use(router)
app.config.devtools = true;

app.mount('#app');
