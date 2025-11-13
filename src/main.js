import "./assets/main.scss";

import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import router from "./router";
import { createPinia } from "pinia";
import locale from "element-plus/dist/locale/zh-cn.js";

//导入持久化插件
import { createPersistedState } from "pinia-persistedstate-plugin";

import App from "./App.vue";

const app = createApp(App);
const pinia = createPinia();
const persist = createPersistedState();

app.use(router);
/* 持久化插件 */
pinia.use(persist);
// app.use(router)
app.use(pinia);
app.mount("#app");
app.use(ElementPlus, { locale });
