// src/api/index.js
import { get, post, put, del, request } from "@/utils/request.js";

// 用户相关 API
export const userApi = {
  // 登录
  login: (data) => post("/api/user/login", data),
  // 注册
  register: (data) => post("/api/user/register", data),
  // 获取用户列表
  getUsers: (params) => get("/api/user/list", params),
  // 获取当前用户信息
  getUserInfo: () => get("/api/user/info"),
  // 更新用户信息
  updateUser: (data) => put("/api/user/update", data),
  // 删除用户
  deleteUser: (id) => del(`/api/user/delete/${id}`),
};

// 分类相关 API
export const categoryApi = {
  // 获取分类列表
  getCategories: (params) => get("/api/category", params),
  // 获取分类详情（使用查询或 id 匹配）
  getCategoryDetail: (id) => get(`/api/category?id=${id}`),
  // 新增分类
  addCategory: (data) => post("/api/category", data),
  // 更新分类
  updateCategory: (data) => put("/api/category", data),
  // 删除分类
  deleteCategory: (id) => del(`/api/category?id=${id}`),
};

// 文章相关 API
export const articleApi = {
  // 获取文章列表
  getArticles: (params) => get("/api/article", params),
  // 获取文章详情
  getArticleDetail: (id) => get(`/api/article?id=${id}`),
  // 新增文章
  addArticle: (data) => post("/api/article", data),
  // 更新文章
  updateArticle: (data) => put("/api/article", data),
  // 删除文章
  deleteArticle: (id) => del(`/api/article?id=${id}`),
};

// 上传相关 API
export const uploadApi = {
  // 上传文件
  upload: (formData) => {
    return request("/api/upload", {
      method: "POST",
      body: formData,
      headers: {}, // 不设置 Content-Type，浏览器会自动设置 multipart/form-data
    });
  },
};
