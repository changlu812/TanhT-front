// src/api/request.js
import { mockFetch } from "@/utils/mockAdapter";

// 请求基础配置
const baseConfig = {
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
};

// 处理响应
const handleResponse = async (response) => {
  if (response.status === 401) {
    // 未授权处理
    window.location.href = "/login";
    return Promise.reject(new Error("未授权"));
  }

  // 对于 401 之外的情况，尝试解析返回的 JSON
  try {
    const data = await response.json();
    return data;
  } catch (e) {
    // 处理 204/304/无返回体等情况，返回一个标准化空响应，避免调用处报错
    return {
      code: 0,
      data: null,
      message: response.statusText || "no content",
    };
  }
};

// 主请求函数
export const request = async (url, options = {}) => {
  const isProduction = import.meta.env.PROD;
  const config = {
    ...baseConfig,
    ...options,
    headers: {
      ...baseConfig.headers,
      ...options.headers,
    },
  };

  // 对于 GET 请求，默认禁用浏览器缓存，确保列表等请求能够实时获取到后端最新数据
  try {
    const method = (config.method || "GET").toUpperCase();
    if (method === "GET") {
      config.cache = config.cache || "no-store";
    }
  } catch (e) {
    // 忽略错误
  }

  // 当 body 为 FormData 时，移除默认的 Content-Type，让浏览器自动设置 multipart/form-data 和 boundary
  try {
    if (typeof FormData !== "undefined" && config.body instanceof FormData) {
      if (config.headers && config.headers["Content-Type"]) {
        delete config.headers["Content-Type"];
      }
    }
    // 当 body 为 URLSearchParams 时，设置为 application/x-www-form-urlencoded
    if (
      typeof URLSearchParams !== "undefined" &&
      config.body instanceof URLSearchParams
    ) {
      config.headers = config.headers || {};
      config.headers["Content-Type"] =
        "application/x-www-form-urlencoded;charset=UTF-8";
    }
  } catch (e) {
    // 在某些环境下 FormData 可能不可用，忽略错误
  }

  // 生产环境使用 Mock
  if (isProduction) {
    const mockResponse = await mockFetch(url, config);
    return handleResponse(mockResponse);
  }

  // 开发环境使用真实请求
  const response = await fetch(url, config);
  return handleResponse(response);
};

// GET 请求
export const get = (url, params = {}, options = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const urlWithParams = queryString ? `${url}?${queryString}` : url;
  return request(urlWithParams, { ...options, method: "GET" });
};

// POST 请求
export const post = (url, data = {}, options = {}) => {
  const body =
    data instanceof FormData ||
    (typeof URLSearchParams !== "undefined" &&
      data instanceof URLSearchParams) ||
    typeof data === "string"
      ? data
      : JSON.stringify(data);

  return request(url, {
    ...options,
    method: "POST",
    body,
  });
};

// PUT 请求
export const put = (url, data = {}, options = {}) => {
  const body =
    data instanceof FormData ||
    (typeof URLSearchParams !== "undefined" &&
      data instanceof URLSearchParams) ||
    typeof data === "string"
      ? data
      : JSON.stringify(data);

  return request(url, {
    ...options,
    method: "PUT",
    body,
  });
};

// DELETE 请求
export const del = (url, data = {}, options = {}) => {
  const body =
    data instanceof FormData ||
    (typeof URLSearchParams !== "undefined" &&
      data instanceof URLSearchParams) ||
    typeof data === "string"
      ? data
      : JSON.stringify(data);

  return request(url, {
    ...options,
    method: "DELETE",
    body,
  });
};

// PATCH 请求
export const patch = (url, data = {}, options = {}) => {
  const body =
    data instanceof FormData ||
    (typeof URLSearchParams !== "undefined" &&
      data instanceof URLSearchParams) ||
    typeof data === "string"
      ? data
      : JSON.stringify(data);

  return request(url, {
    ...options,
    method: "PATCH",
    body,
  });
};
