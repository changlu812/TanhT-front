import request from "@/utils/request.js";

/* 文章分类相关 */
export const articleCategoryListService = () => {
  return request.get("/category");
};

export const articleCategoryAddService = (data) => {
  return request.post("/category", data);
};

export const articleCategoryUpdateService = (data) => {
  return request.put("/category", data);
};

// 使用 params 传 id，axios 会把它放在查询字符串里，兼容后端 DELETE /category?id=...
export const articleCategoryDeleteService = (id) => {
  return request.delete("/category", { params: { id } });
};

/* 文章管理相关 */
//文章列表查询
export const articleListService = (params) => {
  return request.get("/article", { params: params });
};

//添加文章
export const articleAddService = (articleModel) => {
  return request.post("/article", articleModel);
};

// 修改文章：前端会以 PUT /article 发送包含 id 的 body，mock server 需兼容
export const articleUpdateService = (articleModel) => {
  return request.put("/article", articleModel);
};

// 删除文章：使用 params 传 id，兼容前端现有后端实现（或 mock 的 DELETE /article?id=）
export const articleDeleteService = (id) => {
  return request.delete("/article", { params: { id } });
};
