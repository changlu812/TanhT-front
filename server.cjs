const path = require("path");
const express = require("express");
const jsonServer = require("json-server");

const server = express();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

// 使用 json-server 的默认中间件（包含 CORS、logger、static）
server.use(middlewares);

// 使用 single body parser，带 verify 用于保存 rawBody（兼容 json 与 x-www-form-urlencoded）
server.use(
  express.json({
    limit: "2mb",
    verify: (req, res, buf) => {
      req.rawBody = buf && buf.toString();
    },
  })
);
server.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
    verify: (req, res, buf) => {
      req.rawBody = buf && buf.toString();
    },
  })
);
server.use((req, res, next) => {
  console.log(`[mock] ${req.method} ${req.url}`, req.body || req.query);
  next();
});
// 全局异常日志
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err && err.stack ? err.stack : err);
});
process.on("unhandledRejection", (err) => {
  console.error("[unhandledRejection]", err && err.stack ? err.stack : err);
});

// 调试日志中间件（只打印关键接口，避免信息过多）
server.use((req, res, next) => {
  if (
    req.url.startsWith("/user") ||
    req.url.startsWith("/article") ||
    req.url.startsWith("/category")
  ) {
    console.log(`[mock] ${req.method} ${req.url}`);
    // 可根据需要打印 req.rawBody 或 req.body
  }
  next();
});

// POST /user/login
server.post("/user/login", (req, res) => {
  try {
    let body = req.body;
    if ((!body || Object.keys(body).length === 0) && req.rawBody) {
      const rb = req.rawBody;
      if (rb.includes("=")) {
        body = Object.fromEntries(new URLSearchParams(rb));
      } else {
        try {
          body = JSON.parse(rb);
        } catch (e) {
          body = {};
        }
      }
    }

    const username = body && body.username;
    const password = body && body.password;

    if (!username || !password) {
      return res
        .status(400)
        .json({ code: 1, data: null, message: "缺少用户名或密码（mock）" });
    }

    const user = router.db.get("users").find({ username }).value();
    if (user && user.password === password) {
      const token = "mock-token-" + username;
      return res.json({ code: 0, data: token, message: "登录成功（mock）" });
    } else {
      return res
        .status(401)
        .json({ code: 1, data: null, message: "用户名或密码不正确（mock）" });
    }
  } catch (err) {
    console.error("[mock] /user/login error", err);
    return res
      .status(500)
      .json({ code: 500, data: null, message: "Mock 服务内部错误" });
  }
});

// GET /user/userInfo
server.get("/user/userInfo", (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    if (!auth.startsWith("mock-token-"))
      return res
        .status(401)
        .json({ code: 401, data: null, message: "未登录（mock）" });
    const username = auth.replace("mock-token-", "");
    const user = router.db.get("users").find({ username }).value();
    if (!user)
      return res
        .status(404)
        .json({ code: 1, data: null, message: "用户不存在（mock）" });
    const { password, ...userInfo } = user;
    return res.json({ code: 0, data: userInfo, message: "ok" });
  } catch (err) {
    console.error("[mock] /user/userInfo error", err);
    return res
      .status(500)
      .json({ code: 500, data: null, message: "Mock 服务内部错误" });
  }
});

// PUT /user/update
server.put("/user/update", (req, res) => {
  try {
    const body = req.body || {};
    const auth = req.headers.authorization || "";
    const username =
      body.username ||
      (auth.startsWith("mock-token-") ? auth.replace("mock-token-", "") : null);
    if (!username)
      return res
        .status(401)
        .json({ code: 401, data: null, message: "未登录（mock）" });
    router.db.get("users").find({ username }).assign(body).write();
    return res.json({ code: 0, data: null, message: "更新成功（mock）" });
  } catch (err) {
    console.error("[mock] /user/update error", err);
    return res
      .status(500)
      .json({ code: 500, data: null, message: "mock error" });
  }
});

// 分类 CRUD（兼容前端使用的 /category 与 ?id=）
server.get("/category", (req, res) => {
  try {
    const categories = router.db.get("category").value() || [];
    return res.json({ code: 0, data: categories, message: "ok" });
  } catch (e) {
    return res
      .status(500)
      .json({ code: 500, data: null, message: "mock error" });
  }
});

server.post("/category", (req, res) => {
  try {
    const body = req.body || {};
    const id = Date.now();
    const item = { id, ...body };
    router.db.get("category").push(item).write();
    return res.json({ code: 0, data: item, message: "添加成功（mock）" });
  } catch (e) {
    return res
      .status(500)
      .json({ code: 500, data: null, message: "mock error" });
  }
});

server.put("/category", (req, res) => {
  try {
    const body = req.body || {};
    if (!body.id)
      return res.status(400).json({ code: 1, data: null, message: "缺少 id" });
    router.db
      .get("category")
      .find({ id: Number(body.id) })
      .assign(body)
      .write();
    return res.json({ code: 0, data: null, message: "更新成功（mock）" });
  } catch (e) {
    return res
      .status(500)
      .json({ code: 500, data: null, message: "mock error" });
  }
});

server.delete("/category", (req, res) => {
  try {
    const id = req.query.id || req.body.id;
    if (!id)
      return res.status(400).json({ code: 1, data: null, message: "缺少 id" });
    router.db
      .get("category")
      .remove((it) => String(it.id) === String(id))
      .write();
    return res.json({ code: 0, data: null, message: "删除成功（mock）" });
  } catch (e) {
    return res
      .status(500)
      .json({ code: 500, data: null, message: "mock error" });
  }
});

// 文章：列表、创建、更新、删除（兼容前端 PUT /article body.id 与 DELETE /article?id=）
server.get("/article", (req, res) => {
  try {
    const all = router.db.get("article").value() || [];
    const pageNum = parseInt(req.query.pageNum || req.query._page || "1", 10);
    const pageSize = parseInt(
      req.query.pageSize || req.query._limit || "10",
      10
    );
    const categoryId = req.query.categoryId; // 分类 ID
    const state = req.query.state; // 发布状态
    const title = req.query.title; // 文章标题

    // 筛选分类
    let filtered = all;
    if (categoryId) {
      filtered = filtered.filter(
        (article) => String(article.categoryId) === String(categoryId)
      );
    }

    // 筛选发布状态
    if (state) {
      filtered = filtered.filter((article) => article.state === state);
    }

    // 模糊搜索标题
    if (title) {
      filtered = filtered.filter((article) => article.title.includes(title));
    }

    // 分页
    const start = (pageNum - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return res.json({
      code: 0,
      data: { items, total: filtered.length },
      message: "ok",
    });
  } catch (e) {
    console.error("[mock] GET /article error", e);
    return res
      .status(500)
      .json({ code: 500, data: null, message: "mock error" });
  }
});

server.post("/article", (req, res) => {
  try {
    const body = req.body || {};
    const id = Date.now();
    const item = { id, createTime: new Date().toISOString(), ...body };
    router.db.get("article").push(item).write();
    return res.json({ code: 0, data: item, message: "创建成功（mock）" });
  } catch (e) {
    return res
      .status(500)
      .json({ code: 500, data: null, message: "mock error" });
  }
});

server.put("/article", (req, res) => {
  try {
    const body = req.body || {};
    const id = body.id || req.query.id;
    if (!id)
      return res.status(400).json({ code: 1, data: null, message: "缺少 id" });
    const nid = Number(id);
    const found = router.db.get("article").find({ id: nid }).value();
    if (!found)
      return res
        .status(404)
        .json({ code: 1, data: null, message: "文章不存在" });
    router.db.get("article").find({ id: nid }).assign(body).write();
    return res.json({ code: 0, data: null, message: "更新成功（mock）" });
  } catch (e) {
    console.error("[mock] PUT /article error", e);
    return res
      .status(500)
      .json({ code: 500, data: null, message: "Mock 服务内部错误" });
  }
});

server.delete("/article", (req, res) => {
  try {
    const id = req.query.id || req.body.id;
    if (!id)
      return res.status(400).json({ code: 1, data: null, message: "缺少 id" });
    router.db
      .get("article")
      .remove((it) => String(it.id) === String(id))
      .write();
    return res.json({ code: 0, data: null, message: "删除成功（mock）" });
  } catch (e) {
    console.error("[mock] DELETE /article error", e);
    return res
      .status(500)
      .json({ code: 500, data: null, message: "Mock 服务内部错误" });
  }
});

// 模拟上传
server.post("/upload", (req, res) => {
  return res.json({
    code: 0,
    data: "/favicon.ico",
    message: "上传成功（mock）",
  });
});

// 其余路由交由 json-server 默认 router 处理（保底）
server.use(router);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`JSON Server (mock) running at http://localhost:${PORT}`);
});
