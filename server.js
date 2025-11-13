// ...existing code...
const path = require("path");
const express = require("express");
const jsonServer = require("json-server");

const server = express();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

server.use(middlewares);

// 保存 raw body 以便调试：verify 回调会把原始缓冲保存到 req.rawBody
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

// 简单全局异常捕获（打印堆栈）
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err && err.stack ? err.stack : err);
});
process.on("unhandledRejection", (err) => {
  console.error("[unhandledRejection]", err && err.stack ? err.stack : err);
});

// 调试日志中间件（可临时保留）
server.use((req, res, next) => {
  // 只打印登录请求以免刷屏
  if (req.url === "/user/login" || req.url === "/user/userInfo") {
    console.log("--- [mock] incoming request ---");
    console.log("url:", req.method, req.url);
    console.log("headers:", req.headers);
    console.log("rawBody:", req.rawBody);
    console.log("parsed body (req.body):", req.body);
    console.log("--------------------------------");
  }
  next();
});

// POST /user/login
server.post("/user/login", (req, res) => {
  try {
    // 优先使用 req.body（express 已解析 application/json 与 x-www-form-urlencoded）
    let body = req.body;
    // 兜底：如果 body 为空且 rawBody 存在，尝试解析 urlencoded 或 JSON
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
      console.log("[mock] missing username or password", body);
      return res
        .status(400)
        .json({ code: 1, data: null, message: "缺少用户名或密码（mock）" });
    }

    const db = router.db; // lowdb 实例
    const user = db.get("users").find({ username }).value();

    if (user && user.password === password) {
      const token = "mock-token-" + username;
      return res.json({ code: 0, data: token, message: "登录成功（mock）" });
    } else {
      return res
        .status(401)
        .json({ code: 1, data: null, message: "用户名或密码不正确（mock）" });
    }
  } catch (err) {
    console.error(
      "[mock] /user/login error:",
      err && err.stack ? err.stack : err
    );
    return res
      .status(500)
      .json({ code: 500, data: null, message: "Mock 服务内部错误" });
  }
});

// GET /user/userInfo
server.get("/user/userInfo", (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    if (!auth.startsWith("mock-token-")) {
      return res
        .status(401)
        .json({ code: 401, data: null, message: "未登录（mock）" });
    }
    const username = auth.replace("mock-token-", "");
    const user = router.db.get("users").find({ username }).value();
    if (!user)
      return res
        .status(404)
        .json({ code: 1, data: null, message: "用户不存在（mock）" });

    const { password, ...userInfo } = user;
    return res.json({ code: 0, data: userInfo, message: "ok" });
  } catch (err) {
    console.error(
      "[mock] /user/userInfo error:",
      err && err.stack ? err.stack : err
    );
    return res
      .status(500)
      .json({ code: 500, data: null, message: "Mock 服务内部错误" });
  }
});

// 其余路由交给 json-server router（支持 /category, /article, _page/_limit 分页等）
server.use(router);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`JSON Server (mock) running at http://localhost:${PORT}`);
});
// ...existing code...
