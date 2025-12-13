// vite.config.js
import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    // 关键：生产环境用相对路径
    base: isProduction ? "./" : "/",

    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      proxy: !isProduction
        ? {
            "/api": {
              target: "http://localhost:3001", // 仅开发环境代理到 Mock 服务器
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, ""),
            },
          }
        : undefined,
      fs: {
        allow: [".."],
      },
    },
    publicDir: "public",
    build: {
      assetsDir: "assets",
      outDir: "dist",
    },
  };
});
