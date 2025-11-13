<script setup>
import { Edit, Delete } from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { ref } from "vue";

/* 文章相关变量 */
//文章分类数据模型
const categories = ref([]);

//用户搜索时选中的分类id
const categoryId = ref("");

//用户搜索时选中的发布状态
const state = ref(null);

//文章列表数据模型
const articles = ref([]);

//文章搜索
const title = ref("");

/* 分页相关逻辑 */
//分页条数据模型
const pageNum = ref(1); //当前页
const total = ref(20); //总条数
const pageSize = ref(3); //每页条数

//当每页条数发生了变化，调用此函数
const onSizeChange = (size) => {
  pageSize.value = size;
  getArticleList();
};
//当前页码发生变化，调用此函数
const onCurrentChange = (num) => {
  pageNum.value = num;
  getArticleList();
};

/* 文章分类列表查询 */
//文章列表查询
import { articleCategoryListService } from "@/api/article.js";
const getArticleCategoryList = async () => {
  let resultC = await articleCategoryListService();
  categories.value = resultC.data;
  // 分类数据加载完成后，再加载文章列表
  await getArticleList();
};
getArticleCategoryList();

/* 文章列表查询 */
import { articleListService, articleAddService } from "@/api/article.js";
const getArticleList = async () => {
  // 获取所有分类
  let params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    categoryId: categoryId.value ? Number(categoryId.value) : null, // 分类 ID
    state: state.value || null, // 发布状态
    title: title.value || null, // 文章标题
  };
  let result = await articleListService(params);
  // 渲染列表数据
  articles.value = result.data.items;
  console.log(result); // 返回的是分页对象，data 里面包含 items 和 total
  // 为每条文章数据添加分类名称 categoryName
  articles.value.forEach((article) => {
    const category = categories.value.find(
      (cat) => cat.id == article.categoryId // 使用宽松相等，兼容字符串和数字
    );
    article.categoryName = category ? category.categoryName : "未知分类";
  });
  // 渲染总条数
  total.value = result.data.total;
};
getArticleList();
console.log("现在的分页参数为：", pageNum.value, pageSize.value);

// 重置搜索条件
const resetSearch = () => {
  categoryId.value = ""; // 清空分类
  state.value = null; // 清空状态
  title.value = ""; // 清空标题
  getArticleList(); // 刷新文章列表
};

/* 添加文章 */
import { QuillEditor } from "@vueup/vue-quill";

import "@vueup/vue-quill/dist/vue-quill.snow.css";
//控制抽屉是否显示
const visibleDrawer = ref(false);
//添加表单数据模型
const articleModel = ref({
  title: "",
  categoryId: "",
  coverImg: "",
  content: "",
  state: "",
});
//图片上传
import { Plus } from "@element-plus/icons-vue";
import { useTokenStore } from "@/stores/token.js";
const tokenStore = useTokenStore();

const uploadSuccess = (result) => {
  console.log(result.data);

  articleModel.value.coverImg = result.data;
  console.log(result.data);
};

// //添加文章
// const addArticle = async (state) => {
//     articleModel.value.state = state
//     let result = await articleAddService(articleModel.value);
//     ElMessage.success(result.message ? result.message : '添加成功')
//     //再次调用getArticles,获取文章
//     getArticleList();
//     //隐藏抽屉
//     visibleDrawer.value = false
// }
// 打开新建抽屉
const isEditing = ref(false);
const openNewArticle = () => {
  isEditing.value = false;
  articleModel.value = {
    // id: undefined,
    title: "",
    categoryId: "",
    coverImg: "",
    content: "",
    state: "",
  };
  visibleDrawer.value = true;
};

// 编辑文章：预填并打开抽屉
const onEdit = (row) => {
  isEditing.value = true;
  // shallow copy to avoid two-way binding issues
  articleModel.value = { ...row };
  visibleDrawer.value = true;
};

// 删除文章
import { articleDeleteService } from "@/api/article.js";
const onDelete = async (row) => {
  console.log("准备删除文章，ID为：", row.id);
  try {
    await ElMessageBox.confirm("确认删除该文章？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await articleDeleteService(row.id);
    ElMessage.success("删除成功");
    // 刷新列表，若当前页空则回退一页（简单处理）
    getArticleList();
  } catch (e) {
    // 取消或错误，不处理
    console.log("删除文章操作取消或失败", e);
  }
};

// 添加或保存文章（根据 isEditing 判断）
import { articleUpdateService } from "@/api/article.js";
const saveArticle = async (stateStr) => {
  articleModel.value.state = stateStr;
  try {
    if (articleModel.value.id) {
      // 编辑
      const res = await articleUpdateService(articleModel.value);
      ElMessage.success(res.message ? res.message : "更新成功");
    } else {
      // 新增
      const res = await articleAddService(articleModel.value);
      ElMessage.success(res.message ? res.message : "添加成功");
    }
    visibleDrawer.value = false;
    // 清空表单
    articleModel.value = {
      id: undefined,
      title: "",
      categoryId: "",
      coverImg: "",
      content: "",
      state: "",
    };
    // 刷新列表
    getArticleList();
  } catch (err) {
    // 错误由 request 拦截器统一 reject 为 {code,...}
    ElMessage.error(err.message || "操作失败");
  }
};
</script>
<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>文章管理</span>
        <div class="extra">
          <el-button type="primary" @click="openNewArticle">添加文章</el-button>
        </div>
      </div>
    </template>
    <!-- 搜索表单 -->
    <el-form inline>
      <el-form-item label="文章分类：">
        <el-select placeholder="请选择" v-model="categoryId" clearable>
          <el-option
            v-for="c in categories"
            :key="c.id"
            :label="c.categoryName"
            :value="c.id"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="发布状态：">
        <el-select placeholder="请选择" v-model="state" clearable>
          <el-option label="已发布" value="已发布"></el-option>
          <el-option label="草稿" value="草稿"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-input placeholder="请输入文章标题" v-model="title"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="getArticleList()">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 文章列表 -->
    <el-table :data="articles" style="width: 100%">
      <el-table-column
        label="文章标题"
        width="400"
        prop="title"
      ></el-table-column>
      <el-table-column label="封面" prop="coverImg">
        <template #default="{ row }">
          <img
            :src="row.coverImg"
            style="width: 60px; height: 40px; object-fit: cover"
            v-if="row.coverImg"
          />
          <span v-else>无封面</span>
        </template>
      </el-table-column>
      <el-table-column label="分类名称" prop="categoryName"></el-table-column>
      <el-table-column label="发表时间" prop="createTime"> </el-table-column>
      <el-table-column label="状态" prop="state"></el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button
            :icon="Edit"
            circle
            plain
            type="primary"
            @click="onEdit(row)"
          ></el-button>
          <el-button
            :icon="Delete"
            circle
            plain
            type="danger"
            @click="onDelete(row)"
          ></el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="没有数据" />
      </template>
    </el-table>
    <!-- 分页条 -->
    <el-pagination
      v-model:current-page="pageNum"
      v-model:page-size="pageSize"
      :page-sizes="[3, 5, 10, 15]"
      layout="jumper, total, sizes, prev, pager, next"
      background
      :total="total"
      @size-change="onSizeChange"
      @current-change="onCurrentChange"
      style="margin-top: 20px; justify-content: flex-end"
    />
  </el-card>

  <!-- 抽屉 -->
  <el-drawer
    v-model="visibleDrawer"
    title="添加文章"
    direction="rtl"
    size="50%"
  >
    <!-- 添加文章表单 -->
    <el-form :model="articleModel" label-width="100px">
      <el-form-item label="文章标题">
        <el-input
          v-model="articleModel.title"
          placeholder="请输入标题"
        ></el-input>
      </el-form-item>
      <el-form-item label="文章分类">
        <el-select placeholder="请选择" v-model="articleModel.categoryId">
          <el-option
            v-for="c in categories"
            :key="c.id"
            :label="c.categoryName"
            :value="c.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="文章封面">
        <el-upload
          class="avatar-uploader"
          :auto-upload="true"
          :show-file-list="false"
          action="/api/upload"
          name="file"
          :headers="{ Authorization: tokenStore.token }"
          :on-success="uploadSuccess"
        >
          <img
            v-if="articleModel.coverImg"
            :src="articleModel.coverImg"
            class="avatar"
          />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </el-form-item>

      <el-form-item label="文章内容">
        <div class="editor">
          <quill-editor
            theme="snow"
            v-model:content="articleModel.content"
            contentType="html"
          >
          </quill-editor>
        </div>
      </el-form-item>
      <el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveArticle('已发布')"
            >发布</el-button
          >
          <el-button type="info" @click="saveArticle('草稿')">草稿</el-button>
        </el-form-item>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>
<style lang="scss" scoped>
.page-container {
  min-height: 100%;
  box-sizing: border-box;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

:deep(.el-select) {
  /* 重置整个选择框的显示逻辑 */
  .el-select__selection {
    position: relative;

    /* 隐藏所有有问题元素 */
    .is-hidden {
      display: none !important;
    }

    /* 强制显示选中内容 */
    .el-select__placeholder {
      all: unset !important;
      display: inline-block !important;
      color: #606266 !important;
      opacity: 1 !important;
      visibility: visible !important;
      position: relative !important;
      z-index: 100 !important;
    }
  }
}

/* 抽屉样式 */
.avatar-uploader {
  :deep() {
    .avatar {
      width: 178px;
      height: 178px;
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
      width: 178px;
      height: 178px;
      text-align: center;
    }
  }
}

.editor {
  width: 100%;

  :deep(.ql-editor) {
    min-height: 200px;
  }
}
</style>
