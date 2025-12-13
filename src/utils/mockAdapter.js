// src/utils/mockAdapter.js
import { mockData } from "@/mock/mockData";

/**
 * 模拟延迟
 * @param {number} time 延迟时间(ms)
 * @returns {Promise}
 */
const delay = (time = 300) =>
  new Promise((resolve) => setTimeout(resolve, time));

/**
 * 匹配 URL 路径
 * @param {string} pattern Mock 数据中的 key
 * @param {string} url 实际请求的 URL
 * @returns {boolean}
 */
const matchUrl = (pattern, url) => {
  // 完全匹配
  if (pattern === url) return true;

  // 带参数的匹配，如 /api/article/detail -> /api/article/detail?id=1
  if (url.startsWith(pattern + "?")) return true;

  // RESTful 风格匹配，如 /api/article/1 -> /api/article/detail
  if (pattern.includes("/detail") && url.includes("/article/")) {
    return true;
  }

  return false;
};

/**
 * 获取模拟数据
 * @param {string} url 请求URL
 * @param {object} options 请求选项
 * @returns {Promise<Response>}
 */
export const mockFetch = async (url, options = {}) => {
  const isProduction = import.meta.env.PROD;

  // 只在生产环境使用 Mock
  if (!isProduction) {
    return fetch(url, options);
  }

  // 安全打印请求体：避免对 FormData 或非 JSON 字符串调用 JSON.parse 抛错
  let loggedBody = "";
  try {
    if (typeof options.body === "string") {
      loggedBody = JSON.parse(options.body);
    } else if (
      typeof FormData !== "undefined" &&
      options.body instanceof FormData
    ) {
      loggedBody = "[FormData]";
    } else {
      loggedBody = options.body;
    }
  } catch (e) {
    loggedBody = "[unserializable body]";
  }

  console.log(`[Mock Adapter] ${options.method || "GET"} ${url}`, loggedBody);

  // 模拟网络延迟
  await delay(200 + Math.random() * 300);

  // 查找匹配的 Mock 数据
  let responseData = null;
  let matchedKey = "";

  for (const [key, data] of Object.entries(mockData)) {
    if (matchUrl(key, url)) {
      responseData = { ...data };
      matchedKey = key;
      break;
    }
  }

  // 如果没有找到完全匹配的，尝试部分匹配
  if (!responseData) {
    // 优先根据请求方法选择更精确的 mock 返回（支持 POST/PUT/DELETE 直接映射）
    const method = (options.method || "GET").toUpperCase();
    if (url.includes("/api/article")) {
      if (method === "POST") {
        responseData =
          mockData["/api/article/add"] || mockData["/api/article/list"];
      } else if (method === "PUT") {
        responseData =
          mockData["/api/article/update"] || mockData["/api/article/list"];
      } else if (method === "DELETE") {
        responseData = mockData["/api/article/delete"] || {
          code: 200,
          data: null,
          message: "删除成功",
        };
      } else if (
        url.includes("detail") ||
        url.match(/\/api\/article\/\d+/) ||
        url.includes("?id=")
      ) {
        responseData = mockData["/api/article/detail"];
      } else {
        responseData = mockData["/api/article/list"];
      }
    } else if (url.includes("/api/category")) {
      if (method === "POST") {
        responseData =
          mockData["/api/category/add"] || mockData["/api/category/list"];
      } else if (method === "PUT") {
        responseData =
          mockData["/api/category/update"] || mockData["/api/category/list"];
      } else if (method === "DELETE") {
        responseData = mockData["/api/category/delete"] || {
          code: 200,
          data: null,
          message: "删除成功",
        };
      } else if (
        url.includes("detail") ||
        url.match(/\/api\/category\/\d+/) ||
        url.includes("?id=")
      ) {
        responseData = mockData["/api/category/detail"];
      } else {
        responseData = mockData["/api/category/list"];
      }
    } else if (url.includes("/api/user")) {
      if (url.includes("login")) {
        responseData = mockData["/api/user/login"];
      } else if (url.includes("register")) {
        responseData = mockData["/api/user/register"];
      } else {
        responseData = mockData["/api/user/list"];
      }
    } else if (url.includes("/api/upload")) {
      // 在浏览器环境中，如果请求体是 FormData 且包含文件，优先返回一个本地 blob URL 以便静态站点能显示预览
      try {
        if (
          typeof FormData !== "undefined" &&
          options.body instanceof FormData
        ) {
          const file =
            options.body.get("file") ||
            options.body.get("avatar") ||
            options.body.get("image");
          if (
            file &&
            typeof URL !== "undefined" &&
            typeof URL.createObjectURL === "function"
          ) {
            responseData = {
              code: 0,
              data: URL.createObjectURL(file),
              message: "上传成功（本地预览 mock）",
            };
          } else {
            responseData = mockData["/api/upload"];
          }
        } else {
          responseData = mockData["/api/upload"];
        }
      } catch (e) {
        responseData = mockData["/api/upload"];
      }
    }
  }

  // 默认响应
  if (!responseData) {
    console.warn(`[Mock Adapter] 未找到匹配的 Mock 数据: ${url}, 使用默认响应`);
    responseData = {
      code: 200,
      data: null,
      message: "操作成功",
    };
  }

  // 根据请求方法动态修改数据（模拟增删改查）
  if (options.method === "POST" || options.method === "PUT") {
    try {
      // 仅当 body 为字符串时尝试 JSON.parse
      const body =
        options.body && typeof options.body === "string"
          ? JSON.parse(options.body)
          : {};

      // 模拟新增操作返回新ID
      if (url.includes("/add") || url.includes("/register")) {
        if (responseData.data && typeof responseData.data === "object") {
          responseData.data.id = Date.now();
        }
      }

      // 模拟更新操作
      if (url.includes("/update")) {
        responseData.message = "更新成功";
      }
    } catch (e) {
      console.warn("[Mock Adapter] 解析请求体失败", e);
    }
  }

  // 模拟 DELETE 操作
  if (options.method === "DELETE") {
    responseData = {
      code: 200,
      data: null,
      message: "删除成功",
    };
  }

  console.log(`[Mock Adapter] 响应:`, responseData);

  // 返回模拟的 Response 对象
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    json: async () => responseData,
    text: async () => JSON.stringify(responseData),
    clone: function () {
      return { ...this };
    },
  };
};
