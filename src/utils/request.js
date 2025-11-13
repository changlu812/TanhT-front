//定制请求的实例

//导入axios  npm install axios
import axios from "axios";
import { ElMessage } from "element-plus";

/* 在这里不能这样导入 useRouter */
// import { useRouter } from 'vue-router'
// const router = useRouter();

//定义一个变量,记录公共的前缀  ,  baseURL
// const baseURL = 'http://localhost:8080';
const baseURL = "/api";

const instance = axios.create({ baseURL });

/* 添加响应拦截器 */
import router from "@/router";
instance.interceptors.response.use(
  // 成功响应处理：兼容后端约定 {code, data, message} 与 json-server 风格（直接返回资源 + X-Total-Count）
  (response) => {
    const raw = response.data;

    // 如果返回已经是约定结构 { code, data, message }
    if (
      raw &&
      typeof raw === "object" &&
      Object.prototype.hasOwnProperty.call(raw, "code")
    ) {
      if (raw.code === 0) {
        ElMessage.success(raw.message ? raw.message : "操作成功啦");
        return raw;
      } else {
        ElMessage.error(raw.message ? raw.message : "操作失败了");
        return Promise.reject(raw); // 保持原有行为：reject 原始结构
      }
    }

    // 否则把 json-server 的响应包装成约定结构
    const wrapped = {
      code: 0,
      data: raw,
      message: "ok",
    };

    // 支持 json-server 分页头 X-Total-Count -> 包装为 { items, total }
    const total =
      response.headers &&
      (response.headers["x-total-count"] || response.headers["X-Total-Count"]);
    if (total != null) {
      wrapped.data = {
        items: Array.isArray(raw) ? raw : [],
        total: parseInt(total, 10),
      };
    }

    ElMessage.success("操作成功");
    return wrapped;
  },
  // 失败响应处理：统一成 {code, data, message} 的 reject，便于上层统一处理
  (err) => {
    const status = err?.response?.status;

    if (status === 401) {
      ElMessage.error("请先登录！");
      router.push("/login");
      return Promise.reject({ code: 401, data: null, message: "未登录" });
    } else {
      const msg =
        err?.response?.data?.message ||
        err?.response?.statusText ||
        err.message ||
        "服务异常";
      ElMessage.error(msg);
      return Promise.reject({ code: status || 500, data: null, message: msg });
    }
  }
);

/* 添加请求拦截器 */
//导入token状态
import { useTokenStore } from "@/stores/token.js";
//添加请求拦截器
instance.interceptors.request.use(
  (config) => {
    //在发送请求之前做什么
    let tokenStore = useTokenStore();
    console.log("请求拦截器里面的token:", tokenStore.token);
    //如果token中有值，在携带
    if (tokenStore.token) {
      config.headers.Authorization = tokenStore.token;
    }
    return config;
  },
  (err) => {
    //如果请求错误做什么
    Promise.reject(err);
  }
);

export default instance;
