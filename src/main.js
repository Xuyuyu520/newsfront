import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./styles/index.scss";
import { useTokenStore } from "./store/settings.js";
// 统一导入element图标
import * as Icons from "@element-plus/icons-vue";

import VueParticles from "vue-particles";

const app = createApp(App);
app.use(ElementPlus).use(VueParticles).use(store).use(router).mount("#app");
//注册全局element-icons组件
Object.keys(Icons).forEach((key) => {
  app.component(key, Icons[key]);
});

//设置axios默认Url地址前缀
axios.defaults.baseURL = "http://localhost:8081/api";
app.config.globalProperties.$imageUrl = "http://localhost:8081/api";

// http request 请求拦截器
axios.interceptors.request.use(
  (config) => {
    //登录成功后将后台返回的TOKEN在本地存下来,每次请求从sessionStorage中拿到存储的TOKEN值
    const tokenStore = useTokenStore();
    let token = tokenStore.getToken;
    if (token) {
      //如果请求时TOKEN存在,就为每次请求的headers中设置好TOKEN,后台根据headers中的TOKEN判断是否放行
      config.headers.token = token;
    }
    return config;
  },
  (error) => {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);
// http response 响应拦截器
axios.interceptors.response.use(
  (response) => {
    // 在接收响应做些什么，例如跳转到登录页
    if (response.data.code == 401) {
      router.push({
        path: "/loginPage",
      });
    } else if (response.data.code == 403) {
      alert(response.data.message);
    }
    let token = response.headers.token;
    if (token) {
      const tokenStore = useTokenStore();
      tokenStore.setToken(token);
    }
    return response;
  },
  (error) => {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);
