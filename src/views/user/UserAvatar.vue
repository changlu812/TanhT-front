<script setup>
import { Plus, Upload } from "@element-plus/icons-vue";
import { ref } from "vue";
import { ElMessage } from "element-plus";
import avatar from "@/assets/default.png";
const uploadRef = ref();
const file = ref(null);
/* 回显头像 */
//用户头像地址
//读取用户信息和token
import { useUserInfoStore } from "@/stores/userInfo.js";
import { useTokenStore } from "@/stores/token.js";
const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();
const imgUrl = ref(userInfoStore.info.userPic);
// 调试函数，查看imgUrl的值
const debugImgUrl = () => {
  console.log("组件内imgUrl:", imgUrl.value);
  return imgUrl.value;
};
defineExpose({
  imgUrl,
  debugImgUrl,
});

/* 上传头像 */
// 修改上传配置
const uploadHeaders = {
  Authorization: tokenStore.token,
  "Content-Type": "multipart/form-data", // 添加Content-Type
};
// 图片上传前的验证和压缩
const beforeUpload = (file) => {
  return new Promise((resolve, reject) => {
    // 检查文件大小（限制2MB）
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      ElMessage.error("图片大小不能超过 2MB!");
      reject(false);
      return;
    }

    // 检查文件类型
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      ElMessage.error("只能上传图片文件!");
      reject(false);
      return;
    }

    // 可选：图片压缩
    if (file.size > 500 * 1024) {
      // 大于500KB才压缩
      compressImage(file)
        .then((compressedFile) => {
          resolve(compressedFile);
        })
        .catch(() => {
          resolve(file); // 压缩失败使用原文件
        });
    } else {
      resolve(file);
    }
  });
};

// 简单的图片压缩函数
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // 限制最大尺寸
        const maxWidth = 800;
        const maxHeight = 800;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          0.8
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const uploadSuccess = async (result) => {
  console.log("上传成功回调:", result);

  if (result.code === 0) {
    try {
      //使用本地预览的图片URL，而不是Mock返回的favicon
      const localImageUrl = imgUrl.value; // 用户实际选择的图片
      const serverResponseUrl = result.data; // Mock返回的URL（用于联调）

      console.log("本地图片URL:", localImageUrl);
      console.log("服务器返回URL:", serverResponseUrl);

      // 方案A：优先使用本地预览（确保显示正确）
      const finalAvatarUrl = localImageUrl.startsWith("blob:")
        ? serverResponseUrl // 如果是blobURL，使用服务器URL
        : localImageUrl; // 否则使用本地URL

      // 方案B：或者直接使用服务器URL，但添加验证
      // const finalAvatarUrl = isValidUrl(serverResponseUrl) ? serverResponseUrl : localImageUrl;

      // 更新显示
      imgUrl.value = finalAvatarUrl;
      ElMessage.success("头像上传成功！");

      // 调用更新接口，传递正确的图片URL
      await updateUserAvatar(finalAvatarUrl);
    } catch (error) {
      console.error("处理上传结果失败:", error);
      ElMessage.error("头像更新失败");
    }
  }
};

// URL验证函数
const isValidUrl = (url) => {
  return url && !url.includes("favicon.ico") && !url.includes("undefined");
};

//修改头像
import { userAvatarUpdateService } from "@/api/user.js";
const uploadAvatar = async () => {
  // 检查是否选择了文件
  if (!file.value) {
    ElMessage.warning("请先选择图片");
    return;
  }

  try {
    // 先触发文件上传（自动上传设为false时需手动触发）
    uploadRef.value.submit();

    // 注意：这里需要等待上传成功后再调用更新头像接口
    // 但uploadSuccess回调会处理这个逻辑
  } catch (error) {
    console.error("上传出错：", error);
    ElMessage.error("上传失败");
  }
};

//更新用户头像信息
const updateUserAvatar = async (avatarUrl) => {
  // 验证URL有效性
  if (!isValidUrl(avatarUrl)) {
    console.warn("无效的头像URL，跳过更新:", avatarUrl);
    ElMessage.warning("头像URL无效，请重新选择图片");
    return;
  }
  try {
    console.log("准备更新头像到:", avatarUrl);
    const result = await userAvatarUpdateService(avatarUrl);

    if (result.code === 0) {
      // 更新前端存储
      userInfoStore.info.userPic = avatarUrl;
      ElMessage.success("头像信息已保存！");

      // 可选：本地存储备份
      localStorage.setItem("userAvatar", avatarUrl);
    }
  } catch (error) {
    console.error("更新头像信息失败:", error);
    ElMessage.error("头像信息保存失败");
  }
};

const handleChange = (uploadFile) => {
  console.log("文件选择变化:", uploadFile);

  if (uploadFile.raw) {
    // 释放之前的内存
    if (imgUrl.value && imgUrl.value.startsWith("blob:")) {
      URL.revokeObjectURL(imgUrl.value);
    }

    // 创建本地预览
    file.value = uploadFile;
    imgUrl.value = URL.createObjectURL(uploadFile.raw);

    console.log("本地预览创建成功:", imgUrl.value);
  }
};
</script>

<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>更换头像</span>
      </div>
    </template>
    <el-row>
      <el-col :span="12">
        <el-upload
          ref="uploadRef"
          class="avatar-uploader"
          :show-file-list="false"
          action="/api/upload"
          :before-upload="beforeUpload"
          :auto-upload="false"
          :headers="uploadHeaders"
          :on-change="handleChange"
          :on-success="uploadSuccess"
        >
          <img v-if="imgUrl" :src="imgUrl" class="avatar" />
          <img v-else :src="avatar" width="278" />
        </el-upload>
        <br />
        <el-button
          type="primary"
          :icon="Plus"
          size="large"
          @click="uploadRef.$el.querySelector('input').click()"
        >
          选择图片
        </el-button>
        <el-button
          type="success"
          :icon="Upload"
          size="large"
          :disabled="!file"
          @click="uploadAvatar()"
        >
          上传头像
        </el-button>
      </el-col>
    </el-row>
  </el-card>
</template>

<style lang="scss" scoped>
.avatar-uploader {
  :deep() {
    .avatar {
      width: 278px;
      height: 278px;
      display: block;
    }

    .el-upload {
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);
    }

    .el-upload:hover {
      border-color: var(--el-color-primary);
    }

    .el-icon.avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 278px;
      height: 278px;
      text-align: center;
    }
  }
}
</style>
