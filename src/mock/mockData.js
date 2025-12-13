// src/mock/mockData.js
export const mockData = {
  // 用户相关接口
  "/api/user/list": {
    code: 200,
    data: [
      {
        id: 1,
        username: "mockuser",
        password: "123456",
        nickname: "常陆",
        email: "mock@qq.com",
        userPic: "/uploads/avatar_1763802342175.jpg",
      },
    ],
    message: "success",
  },
  // 当前登录用户信息（用于前端在生产模式获取当前用户）
  "/api/user/userInfo": {
    code: 0,
    data: {
      id: 1,
      username: "mockuser",
      nickname: "常陆",
      email: "mock@qq.com",
      userPic: "/uploads/avatar_1763802342175.jpg",
    },
    message: "ok",
  },
  // 更新用户头像（mock 成功响应）
  "/api/user/updateAvatar": {
    code: 0,
    data: null,
    message: "头像更新成功",
  },
  // 更新用户信息（mock 成功响应）
  "/api/user/update": {
    code: 0,
    data: null,
    message: "更新成功",
  },
  // 更新密码（mock）
  "/api/user/updatePwd": {
    code: 0,
    data: null,
    message: "密码更新成功",
  },

  // 分类相关接口
  "/api/category/list": {
    code: 200,
    data: [
      {
        id: 1762261512016,
        categoryName: "2",
        categoryAlias: "2",
      },
      {
        id: 1762266039371,
        categoryName: "3",
        categoryAlias: "3",
      },
    ],
    message: "success",
  },

  // 文章相关接口
  "/api/article/list": {
    code: 200,
    data: [
      {
        id: 1762266069385,
        createTime: "2025-11-04T14:21:09.385Z",
        title: "测试",
        categoryId: 1762261512016,
        coverImg: "",
        content: '<h1><u>123</u><span class="ql-cursor"></span></h1>',
        state: "已发布",
        categoryName: "2",
      },
    ],
    total: 1,
    message: "success",
  },

  // 登录接口
  "/api/user/login": {
    code: 200,
    data: {
      token: "mock-token-1234567890",
      userInfo: {
        id: 1,
        username: "mockuser",
        nickname: "常陆",
        email: "mock@qq.com",
        userPic: "/uploads/avatar_1763802342175.jpg",
      },
    },
    message: "登录成功",
  },

  // 注册接口
  "/api/user/register": {
    code: 200,
    data: {
      id: 2,
      username: "newuser",
    },
    message: "注册成功",
  },

  // 新增文章接口
  "/api/article/add": {
    code: 200,
    data: {
      id: 1762266069386,
      createTime: new Date().toISOString(),
    },
    message: "文章创建成功",
  },

  // 更新文章接口
  "/api/article/update": {
    code: 200,
    data: null,
    message: "更新成功",
  },

  // 删除文章接口
  "/api/article/delete": {
    code: 200,
    data: null,
    message: "删除成功",
  },

  // 新增分类接口
  "/api/category/add": {
    code: 200,
    data: {
      id: Date.now(),
      categoryName: "新分类",
      categoryAlias: "new-category",
    },
    message: "分类添加成功",
  },

  // 更新分类接口
  "/api/category/update": {
    code: 200,
    data: null,
    message: "分类更新成功",
  },

  // 删除分类接口
  "/api/category/delete": {
    code: 200,
    data: null,
    message: "分类删除成功",
  },

  // 获取单个文章详情
  "/api/article/detail": {
    code: 200,
    data: {
      id: 1762266069385,
      createTime: "2025-11-04T14:21:09.385Z",
      title: "测试文章详情",
      categoryId: 1762261512016,
      coverImg: "",
      content: "<h1>这是文章详情内容</h1><p>详细内容...</p>",
      state: "已发布",
      categoryName: "2",
    },
    message: "success",
  },

  // 获取单个分类详情
  "/api/category/detail": {
    code: 200,
    data: {
      id: 1762261512016,
      categoryName: "2",
      categoryAlias: "2",
    },
    message: "success",
  },

  // 上传接口
  "/api/upload": {
    // 与 server.cjs 保持一致：code === 0 表示成功，data 直接返回文件 URL 字符串
    code: 0,
    data: "/uploads/upload_" + Date.now() + ".jpg",
    message: "上传成功",
  },
};
