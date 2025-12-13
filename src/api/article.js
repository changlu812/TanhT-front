import { get, post, put, del } from "@/utils/request.js";

/* 文章分类相关（与 mock server 保持一致） */
export const articleCategoryListService = () => {
  return get("/api/category");
};

export const articleCategoryAddService = (data) => {
  return post("/api/category", data);
};

export const articleCategoryUpdateService = (data) => {
  return put("/api/category", data);
};

// 使用查询参数传 id，兼容 mock 的 DELETE /category?id=...
export const articleCategoryDeleteService = (id) => {
  return del(`/api/category?id=${id}`);
};

/* 文章管理相关（与 mock server 保持一致） */
// 文章列表查询：支持分页和筛选参数
export const articleListService = (params) => {
  return get("/api/article", params);
};

// 添加文章
export const articleAddService = (articleModel) => {
  return post("/api/article", articleModel);
};

// 修改文章：mock server 接受 PUT /article，body 中包含 id
export const articleUpdateService = (articleModel) => {
  return put("/api/article", articleModel);
};

// 删除文章：使用查询参数传 id，兼容 mock 的 DELETE /article?id=...
export const articleDeleteService = (id) => {
  return del(`/api/article?id=${id}`);
};
