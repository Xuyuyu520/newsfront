<template>
  <div class="article">
    <el-card>
      <Table
        :data="tableData"
        :column="tableTitle"
        :operation="true"
        :page="page"
        :loading="loading"
        @onSizeChange="onSizeChange"
        @onCurrentChange="onCurrentChange"
        @setCellColor="setCellColor"
      >
        <template #search>
          <el-row :gutter="24">
            <el-col :span="3">
              <el-button type="primary" @click="onAddArticle"
                >添加新闻</el-button
              >
            </el-col>
            <el-col :span="7">
              <el-form-item label="新闻名">
                <el-input
                  v-model="searchForm.articleName"
                  placeholder="请输入新闻名称"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="7" label="作者">
              <el-form-item label="新闻名">
                <el-input
                  v-model="searchForm.author"
                  placeholder="请输入新闻作者"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-button
                @click="onRefresh"
                icon="RefreshRight"
                circle
              ></el-button>
              <el-button @click="onSearch" type="primary" icon="Search"
                >查询</el-button
              >
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="8">
              <el-button
                @click="exportOut"
                type="primary"
                icon="Download"
                style="margin-bottom: 7px"
                >导出excel
              </el-button>
            </el-col>
            <el-col :span="8">
              <el-upload
                ref="fileUploadButton"
                :httpRequest="exportIn"
                :show-file-list="false"
                auto-upload="true"
                class="upload-demo"
                :limit="1"
              >
                <el-button type="primary" icon="Upload">批量新增</el-button>
              </el-upload>
            </el-col>
            <el-col :span="8">
              <a style="color: red; cursor: pointer" @click="downLoadTemplate">
                <Document style="width: 15px; height: 15px" />
                模板下载</a
              >
            </el-col>
          </el-row>
        </template>
        <template #column="scope">
          <el-button
            @click="onEdit(scope)"
            type="text"
            style="color: var(--edit)"
            >编辑</el-button
          >
          <el-button
            @click="onDelete(scope)"
            type="text"
            style="color: var(--delete)"
            >删除</el-button
          >
        </template>
      </Table>
      <el-dialog
        :title="articleTitle"
        v-model="articleVisible"
        :show-close="false"
      >
        <el-form
          :model="articleForm"
          :rules="rules"
          ref="articleRuleForm"
          status-icon
          label-width="100px"
        >
          <el-form-item
            prop="articleName"
            label="新闻名"
            :rules="[
              { required: true, message: '请输入新闻名', trigger: 'blur' },
            ]"
          >
            <el-input
              v-model="articleForm.articleName"
              placeholder="请输入新闻名"
            ></el-input>
          </el-form-item>
          <el-form-item label="图片">
            <el-upload
              class="avatar-uploader"
              :httpRequest="uploadImg"
              :show-file-list="false"
              auto-upload="true"
            >
              <img
                v-if="articleForm.articleUrl"
                :src="imageUrlPrefix + articleForm.articleUrl"
                class="avatar"
                style="width: 178px; height: 178px"
              />
              <el-icon v-else class="avatar-uploader-icon">
                <Plus />
              </el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item
            prop="author"
            label="作者"
            :rules="[
              { required: true, message: '请输入作者', trigger: 'blur' },
            ]"
          >
            <el-input
              v-model="articleForm.author"
              placeholder="请输入作者"
            ></el-input>
          </el-form-item>
          <el-form-item
            prop="type"
            label="类型"
            :rules="[
              { required: true, message: '请输入类型', trigger: 'blur' },
            ]"
          >
            <el-select
              v-model="articleForm.type"
              placeholder="请选择类型"
              style="width: 100%"
            >
              <el-option
                v-for="item in typeData"
                :key="item.typeId"
                :label="item.cname"
                :value="item.typeId"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            prop="price"
            label="价格"
            :rules="[
              { required: true, message: '请输入价格', trigger: 'blur' },
              {
                pattern:
                  /(^[1-9][0-9]{0,8}(\.[0-9]{1,2})?$)|(^0(\.[0-9]{1,2})?$)/,
                message: '价格只能是数字且不能有空格,只能带两位小数',
                trigger: 'blur',
              },
            ]"
          >
            <el-input
              v-model="articleForm.price"
              placeholder="请输入价格"
            ></el-input>
          </el-form-item>
          <el-form-item
            prop="count"
            label="数量"
            :rules="[
              { required: true, message: '数量', trigger: 'blur' },
              {
                pattern: /^[1-9][0-9]{0,9}$/,
                message: '数量只能是数字且不能有空格,长度不能超过10位',
                trigger: 'blur',
              },
            ]"
          >
            <el-input
              v-model="articleForm.count"
              placeholder="请输入数量"
            ></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="articleVisible = false">取消</el-button>
            <el-button type="primary" @click="onSubmit">提交</el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
import {
  onMounted,
  reactive,
  ref,
  unref,
  toRefs,
  getCurrentInstance,
} from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Table from "../../components/Table.vue";
import { dateFormat } from "../../utils/utils.js";
import axios from "axios";

export default {
  props: {
    //入口参数
  },
  components: {
    //引入组件
    Table,
  },
  setup() {
    onMounted(() => {
      data.onArticlePage();
      data.onCategory();
    });
    const data = reactive({
      searchForm: {
        articleName: null,
        author: null,
      },
      typeData: [],
      loading: false,
      page: {
        current: 1,
        size: 10,
        total: 1,
      },
      tableTitle: [
        { prop: "", label: "", fixed: "left" },
        { prop: "articleId", label: "新闻id" },
        { prop: "articleName", label: "新闻名" },
        { prop: "articleUrl", label: "新闻图片", type: "img" },
        { prop: "author", label: "作者" },
        { prop: "type", label: "类型", alias: "typeName" },
        { prop: "price", label: "价格" },
        { prop: "count", label: "数量" },
      ],
      tableData: [],
      articleRuleForm: ref(null),
      typeLoading: false,
      articleVisible: false,
      articleTitle: "添加新闻",
      operate: 0,
      articleForm: {
        articleId: "",
        articleName: "",
        articleUrl: "",
        author: "",
        type: "",
        price: "",
        count: "",
      },
      orgData: [],
      fileList: [],
      uploadRef: ref(null),
      imageUrlPrefix:
        getCurrentInstance()?.appContext.config.globalProperties.$imageUrl,
      onArticlePage: () => {
        data.loading = true;
        debugger;
        axios
          .get("/article/getArticleList", {
            params: Object.assign(data.page, data.searchForm),
          })
          .then((res) => {
            debugger;
            data.loading = false;
            data.tableData = res.data.result.list;
            data.page.current = res.data.result.pageNum;
            data.page.size = res.data.result.pageSize;
            data.page.total = res.data.result.total;
          });
      },
      onCategory: () => {
        debugger;
        axios.get("/category/getAllCategory").then((res) => {
          debugger;
          data.typeData = res.data.result;
        });
      },
      onSearch: () => {
        data.onArticlePage();
      },

      onRefresh: () => {
        data.searchForm = {
          cname: null,
        };
        data.onArticlePage();
      },
      onSizeChange: (e) => {
        data.page.size = e;
        data.onArticlePage();
      },
      onCurrentChange: (e) => {
        data.page.current = e;
        data.onArticlePage();
      },
      // // 添加用户信息
      onAddArticle: () => {
        data.userTitle = "添加新闻类型";
        data.operate = 0;
        data.articleForm = {
          articleId: "",
          articleName: "",
          articleUrl: "",
          author: "",
          type: "",
          price: "",
          count: "",
        };
        data.articleVisible = true;
      },
      onEdit: (val) => {
        data.userTitle = "修改新闻类型";
        data.operate = 1;
        data.articleForm = {
          articleId: val.column.row.articleId,
          articleName: val.column.row.articleName,
          articleUrl: val.column.row.articleUrl,
          author: val.column.row.author,
          type: val.column.row.type,
          price: val.column.row.price,
          count: val.column.row.count,
        };
        data.fileList = [];
        data.fileList.push({
          name: "新闻图片",
          url: data.articleForm + data.articleForm.articleUrl,
        });
        debugger;
        data.articleVisible = true;
      },
      onSubmit: async () => {
        debugger;
        const form = data.articleRuleForm;
        if (!form) return;
        await form.validate();
        if (data.operate == 0) {
          axios.post("/article/articleSave", data.articleForm).then((res) => {
            if (res.data.result) {
              ElMessage.success({
                message: "添加成功！",
                type: "success",
              });
              data.onArticlePage();
              data.articleVisible = false;
            }
          });
        } else {
          debugger;
          axios.post("/article/articleUpdate", data.articleForm).then((res) => {
            if (res.data.result) {
              ElMessage.success({
                message: "修改成功！",
                type: "success",
              });
              data.onArticlePage();
              data.articleVisible = false;
            }
          });
        }
      },
      onDelete: (val) => {
        ElMessageBox.confirm("此操作将永久删除该新闻, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            let param = {
              articleId: val.column.row.articleId,
            };
            axios
              .get("/article/articleDelete", { params: param })
              .then((res) => {
                if (res.data.result) {
                  ElMessage.success("删除成功!");
                  data.onArticlePage();
                }
              });
          })
          .catch((e) => {
            console.log(e);
          });
      },
      uploadImg: (params) => {
        debugger;
        var file = params.file; //获取input的图片file值
        var formData = new FormData();
        formData.append("myfile", file); //对应后台接收图片名
        formData.append("type", "articleImg");
        axios
          .post("upload", formData)
          .then((response) => {
            data.articleForm.articleUrl = response.data.result;
            ElMessage.success({
              message: "上传成功",
              type: "success",
            });
          })
          .catch((error) => {
            console.log(error);
          }); // 请求失败处理
      },
      exportOut: () => {
        data.loading = true;
        debugger;
        axios
          .get("/article/exportOut", {
            params: data.searchForm,
            responseType: "blob",
          })
          .then((response) => {
            debugger;
            data.loading = false;
            let blob = new Blob([response.data], {
              type: "application/vnd.ms-excel;charset=utf-8",
            });

            let fileName = "新闻信息.xlsx";
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
              // IE
              window.navigator.msSaveOrOpenBlob(blob, fileName);
            } else {
              let objectUrl = (window.URL || window.webkitURL).createObjectURL(
                blob
              );
              let downFile = document.createElement("a");
              downFile.style.display = "none";
              downFile.href = objectUrl;
              downFile.download = fileName; // 下载后新闻名
              document.body.appendChild(downFile);
              downFile.click();
              document.body.removeChild(downFile); // 下载完成移除元素 // window.location.href = objectUrl
              // 只要映射存在，Blob就不能进行垃圾回收，因此一旦不再需要引用，就必须小心撤销URL，释放掉blob对象。
              window.URL.revokeObjectURL(objectUrl);
            }
          });
      },
      downLoadTemplate: () => {
        data.loading = true;
        debugger;
        axios
          .get("/article/downLoadTemplate", { responseType: "blob" })
          .then((response) => {
            debugger;
            data.loading = false;
            let blob = new Blob([response.data], {
              type: "application/vnd.ms-excel;charset=utf-8",
            });

            let fileName = "新闻批量增加模板.xlsx";
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
              // IE
              window.navigator.msSaveOrOpenBlob(blob, fileName);
            } else {
              let objectUrl = (window.URL || window.webkitURL).createObjectURL(
                blob
              );
              let downFile = document.createElement("a");
              downFile.style.display = "none";
              downFile.href = objectUrl;
              downFile.download = fileName; // 下载后新闻名
              document.body.appendChild(downFile);
              downFile.click();
              document.body.removeChild(downFile); // 下载完成移除元素 // window.location.href = objectUrl
              // 只要映射存在，Blob就不能进行垃圾回收，因此一旦不再需要引用，就必须小心撤销URL，释放掉blob对象。
              window.URL.revokeObjectURL(objectUrl);
            }
          });
      },
      exportIn: (params) => {
        var file = params.file; //获取input的图片file值
        var formData = new FormData();
        formData.append("myfile", file); //对应后台接收图片名
        axios
          .post("/article/exportIn", formData)
          .then((response) => {
            debugger;
            alert(response.data.result);
            data.onArticlePage();
            data.fileUploadButton.clearFiles();
          })
          .catch((error) => {
            console.log(error);
          }); // 请求失败处理
      },
    });
    return {
      ...toRefs(data),
    };
  },
};
</script>
<style>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.el-col .el-form-item {
  margin: 4px;
}
</style>
