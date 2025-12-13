import { get, post, put, patch } from "@/utils/request.js";
// 从 pinia 中读取 token，以便把 token 放到 Authorization 头中
import { useTokenStore } from "@/stores/token.js";

/* 用户注册 */
export const userRegisterService = (RegisterData) => {
  const params = new URLSearchParams();
  for (let key in RegisterData) {
    params.append(key, RegisterData[key]);
  }
  return post("/api/user/register", params);
};

/*用户登录 */
export const userLoginService = (LoginData) => {
  const params = new URLSearchParams();
  for (let key in LoginData) {
    params.append(key, LoginData[key]);
  }
  return post("/api/user/login", params);
};

//获取个人信息
export const userInfoGetService = () => {
  try {
    const tokenStore = useTokenStore();
    return get(
      "/api/user/userInfo",
      {},
      { headers: { Authorization: tokenStore.token } }
    );
  } catch (e) {
    // 在某些调用时（如单元测试或模块预加载）pinia 可能尚未就绪，退回到无头请求
    return get("/api/user/userInfo");
  }
};

/* 修改用户信息 */
export const userInfoUpdateService = (userInfo) => {
  return put("/api/user/update", userInfo);
};

/* 修改用户头像 */
//修改头像
export const userAvatarUpdateService = (avatarUrl) => {
  let params = new URLSearchParams();
  params.append("avatarUrl", avatarUrl);
  return patch("/api/user/updateAvatar", params);
};

/* 修改密码 */
export const userPasswordUpdateService = (params) => {
  return patch("/api/user/updatePwd", params);
};
