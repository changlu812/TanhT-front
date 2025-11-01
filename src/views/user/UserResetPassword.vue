<script setup>
import { ref } from 'vue'
import { useUserInfoStore } from '@/stores/userInfo.js'
import { userPasswordUpdateService } from '@/api/user.js'
import { ElMessage } from 'element-plus'
import { useTokenStore } from '@/stores/token'

const userInfoStore = useUserInfoStore()
const tokenStore = useTokenStore()

// 表单数据
const formData = ref({
  old_pwd: '',
  new_pwd: '',
  re_pwd: ''
})

// 表单校验规则
const rules = {
  old_pwd: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, max: 16, message: '密码长度为6-16位', trigger: 'blur' }
  ],
  new_pwd: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 16, message: '密码长度为6-16位', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value === formData.value.old_pwd) {
          callback(new Error('新密码不能与原密码相同'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  re_pwd: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== formData.value.new_pwd) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 提交修改密码
const updatePassword = async () => {
  try {
    let params = {
        old_pwd: formData.value.old_pwd,
        new_pwd: formData.value.new_pwd,
        re_pwd: formData.value.re_pwd
    }
    // 这里调用API接口修改密码
    await userPasswordUpdateService(params)
    ElMessage.success('密码修改成功')
    
    // 清空表单
    formData.value = {
      old_pwd: '',
      new_pwd: '',
      re_pwd: ''
    }
  } catch (error) {
    ElMessage.error(error.message || '密码修改失败')
  }
}
</script>

<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>重置密码</span>
      </div>
    </template>
    <el-row>
      <el-col :span="12">
        <el-form 
          :model="formData" 
          :rules="rules" 
          label-width="100px" 
          size="large"
          @submit.prevent
        >
          <el-form-item label="登录名称">
            <el-input :model-value="userInfoStore.info.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="原密码" prop="old_pwd">
            <el-input 
              v-model="formData.old_pwd" 
              type="password" 
              show-password
              placeholder="请输入原密码"
            ></el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="new_pwd">
            <el-input 
              v-model="formData.new_pwd" 
              type="password" 
              show-password
              placeholder="请输入新密码"
            ></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="re_pwd">
            <el-input 
              v-model="formData.re_pwd" 
              type="password" 
              show-password
              placeholder="请再次输入新密码"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="updatePassword">
              提交修改
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </el-card>
</template>

<style scoped>
.page-container {
  min-height: 100%;
  box-sizing: border-box;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>