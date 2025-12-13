<script setup>
/* 公共组件 */
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { User, Lock } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { useTokenStore } from "@/stores/token.js"; //导入token状态

const tokenStore = useTokenStore();
const router = useRouter(); //路由器
const isRegister = ref(false); //控制注册与登录表单的显示， 默认显示注册

/* 表单校验 */
// 表单ref
const registerForm = ref(null);
const loginForm = ref(null);
//定义表单校验规则
const checkPassword = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请输入密码"));
  } else if (value !== registerData.value.password) {
    callback(new Error("密码不一致"));
  } else {
    callback();
  }
};
const rules = ref({
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 5, max: 16, message: "长度在 5 到 16 个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 5, max: 16, message: "长度在 5 到 16 个字符" },
  ],
  rePassword: [{ validator: checkPassword, trigger: "blur" }],
});

/* 用户注册 */
const registerData = ref({
  username: "",
  password: "",
  rePassword: "",
});
import { userRegisterService } from "@/api/user.js";
async function register() {
  try {
    await registerForm.value.validate();
    let resultData = await userRegisterService(registerData.value);
    console.log(resultData);
  } catch (error) {
    return;
  }
}

/* 用户登录 */
import { userLoginService } from "@/api/user.js";
const loginData = ref({
  username: "",
  password: "",
});
async function login() {
  try {
    console.log("login() start", loginData.value);
    await loginForm.value.validate();
    console.log("validation passed");
    let resultData = await userLoginService(loginData.value);
    console.log("login response", resultData);
    if (!resultData || resultData.code !== 0) {
      ElMessage.error(
        resultData && resultData.message ? resultData.message : "登录失败"
      );
      return;
    }
    // server.cjs 返回 data 为 token 字符串；某些 mockData 返回嵌套对象，兼容处理
    const tokenValue =
      typeof resultData.data === "string"
        ? resultData.data
        : (resultData.data && resultData.data.token) || "";
    tokenStore.setToken(tokenValue); // 保存token
    console.log("token set", tokenValue);
    router.push("/"); // 登录成功跳转到首页
  } catch (error) {
    console.error("login error", error);
    ElMessage.error("登录过程出现异常");
    return;
  }
}
</script>

<template>
  <el-row class="login-page">
    <el-col :span="12" class="bg"></el-col>
    <el-col :span="6" :offset="3" class="form">
      <!-- 注册表单 -->
      <el-form
        ref="registerForm"
        size="large"
        autocomplete="off"
        v-if="isRegister"
        :model="registerData"
        :rules="rules"
      >
        <el-form-item>
          <h1>注册</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input
            :prefix-icon="User"
            placeholder="请输入用户名"
            v-model="registerData.username"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
            v-model="registerData.password"
          ></el-input>
        </el-form-item>
        <el-form-item prop="rePassword">
          <el-input
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入再次密码"
            v-model="registerData.rePassword"
          ></el-input>
        </el-form-item>
        <!-- 注册按钮 -->
        <el-form-item>
          <el-button
            class="button"
            type="primary"
            auto-insert-space
            @click="register"
          >
            注册
          </el-button>
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="info" underline="never" @click="isRegister = false">
            ← 返回
          </el-link>
        </el-form-item>
      </el-form>
      <!-- 登录表单 -->
      <el-form
        ref="loginForm"
        size="large"
        autocomplete="off"
        v-else
        :model="loginData"
        :rules="rules"
      >
        <el-form-item>
          <h1>登录</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input
            :prefix-icon="User"
            placeholder="请输入用户名"
            v-model="loginData.username"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            name="password"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
            v-model="loginData.password"
          ></el-input>
        </el-form-item>
        <el-form-item class="flex">
          <div class="flex">
            <el-checkbox>记住我</el-checkbox>
            <el-link type="primary" underline="never">忘记密码？</el-link>
          </div>
        </el-form-item>
        <!-- 登录按钮 -->
        <el-form-item>
          <el-button
            class="button"
            type="primary"
            auto-insert-space
            @click="login"
            >登录</el-button
          >
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="info" underline="never" @click="isRegister = true">
            注册 →
          </el-link>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
/* 样式 */
.login-page {
  height: 100vh;
  background-color: #fff;

  .bg {
    background: url("@/assets/logo2.png") no-repeat 60% center / 240px auto,
      url("@/assets/login_bg.jpg") no-repeat center / cover;
    border-radius: 0 20px 20px 0;
  }

  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    user-select: none;

    .title {
      margin: 0 auto;
    }

    .button {
      width: 100%;
    }

    .flex {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
