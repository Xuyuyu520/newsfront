<template>
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
        <div>
          <el-button type="primary" @click="onAddCategory"
            >添加新闻类型</el-button
          >
        </div>
        <div>
          <el-input
            v-model="searchForm.cname"
            placeholder="请输入新闻类型名称"
          ></el-input>
        </div>
        <div>
          <el-button @click="onRefresh" icon="RefreshRight" circle></el-button>
        </div>
        <div>
          <el-button @click="onSearch" type="primary" icon="Search"
            >查询</el-button
          >
        </div>
        <div>
          <el-button @click="exportOut" type="primary" icon="Download"
            >导出excel</el-button
          >
        </div>
        <div style="margin-right: 0px; padding-right: 0px">
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
        </div>
        <div style="margin-left: 0px; padding-right: 0px">
          <a style="color: red" @click="downLoadTemplate">
            <Document style="width: 15px; height: 15px" />
            模板下载</a
          >
        </div>
      </template>
      <template #column="scope">
        <el-button @click="onEdit(scope)" type="text" style="color: var(--edit)"
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
      :title="categoryTitle"
      v-model="categoryVisible"
      :show-close="false"
    >
      <el-form
        :model="categoryForm"
        :rules="rules"
        ref="categoryRuleForm"
        status-icon
        label-width="150px"
      >
        <el-form-item
          prop="typeId"
          label="新闻类型id"
          :rules="[
            { required: true, message: '请输入新闻类型id', trigger: 'blur' },
            {
              pattern: /^[1-9][0-9]{0,10}$/,
              message: 'id只能是数字且不能有空格,长度不能超过11位',
              trigger: 'blur',
            },
          ]"
        >
          <el-input
            v-if="operate == 0"
            v-model="categoryForm.typeId"
            placeholder="请输入新闻类型id"
          ></el-input>
          <el-input
            v-if="operate == 1"
            disabled
            v-model="categoryForm.typeId"
            placeholder="请输入新闻类型id"
          ></el-input>
        </el-form-item>
        <el-form-item
          prop="cname"
          label="新闻类型中文名"
          :rules="[
            {
              required: true,
              message: '请输入新闻类型中文名',
              trigger: 'blur',
            },
          ]"
        >
          <el-input
            v-model="categoryForm.cname"
            placeholder="请输入新闻类型中文名"
          ></el-input>
        </el-form-item>
        <el-form-item
          prop="ename"
          label="新闻类型英文名"
          :rules="[
            {
              required: true,
              message: '请输入新闻类型英文名',
              trigger: 'blur',
            },
          ]"
        >
          <el-input
            v-model="categoryForm.ename"
            placeholder="请输入新闻类型英文名"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="categoryVisible = false">取消</el-button>
          <el-button type="primary" @click="onSubmit">提交</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>
<script>
import { onMounted, reactive, ref, unref, toRefs } from "vue";
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
      data.onCategoryPage();
    });
    const data = reactive({
      searchForm: {
        cname: null,
      },
      loading: false,
      fileUploadButton: ref(),
      page: {
        current: 1,
        size: 10,
        total: 1,
      },
      tableTitle: [
        { prop: "", label: "", fixed: "left" },
        { prop: "typeId", label: "新闻类型id" },
        { prop: "ename", label: "类型英文名" },
        { prop: "cname", label: "类型中文名" },
      ],
      tableData: [],
      categoryRuleForm: ref(null),
      typeLoading: false,
      categoryVisible: false,
      categoryTitle: "添加新闻类型",
      operate: 0,
      categoryForm: {
        typeId: "",
        ename: "",
        cname: "",
      },
      orgData: [],
      onCategoryPage: () => {
        data.loading = true;
        debugger;
        axios
          .get("/category/getCategoryList", {
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
      onSearch: () => {
        data.onCategoryPage();
      },

      onRefresh: () => {
        data.searchForm = {
          cname: null,
        };
        data.onCategoryPage();
      },
      onSizeChange: (e) => {
        data.page.size = e;
        data.onCategoryPage();
      },
      onCurrentChange: (e) => {
        data.page.current = e;
        data.onCategoryPage();
      },
      // 添加用户信息
      onAddCategory: () => {
        data.userTitle = "添加新闻类型";
        data.operate = 0;
        data.categoryForm = {
          typeId: "",
          ename: "",
          cname: "",
        };
        data.categoryVisible = true;
      },
      onEdit: (val) => {
        data.userTitle = "修改新闻类型";
        data.operate = 1;
        data.categoryForm = {
          typeId: val.column.row.typeId,
          cname: val.column.row.cname,
          ename: val.column.row.ename,
        };
        debugger;
        data.categoryVisible = true;
      },
      onSubmit: async () => {
        const form = data.categoryRuleForm;
        if (!form) return;
        await form.validate();
        if (data.operate == 0) {
          axios
            .post("/category/categorySave", data.categoryForm)
            .then((res) => {
              debugger;
              if (res.data.result) {
                ElMessage.success({
                  message: "添加成功！",
                  type: "success",
                });
                data.onCategoryPage();
                data.categoryVisible = false;
              }
            });
        } else {
          axios
            .patch("/category/categoryUpdate", data.categoryForm)
            .then((res) => {
              debugger;
              if (res.data.result) {
                ElMessage.success({
                  message: "修改成功！",
                  type: "success",
                });
                data.onCategoryPage();
                data.categoryVisible = false;
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
              typeId: val.column.row.typeId,
            };
            axios
              .delete("/category/categoryDelete", { params: param })
              .then((res) => {
                if (res) {
                  ElMessage.success("删除成功!");
                  data.onCategoryPage();
                }
              });
          })
          .catch((e) => {
            console.log(e);
          });
      },
      exportOut: () => {
        data.loading = true;
        debugger;
        axios
          .get("/category/exportOut", {
            params: data.searchForm,
            responseType: "blob",
          })
          .then((response) => {
            debugger;
            data.loading = false;
            let blob = new Blob([response.data], {
              type: "application/vnd.ms-excel;charset=utf-8",
            });
            // application/vnd.ms-excel为excel类型文档
            let fileName = "新闻类型.xlsx";
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
          .get("/category/downLoadTemplate", { responseType: "blob" })
          .then((response) => {
            debugger;
            data.loading = false;
            let blob = new Blob([response.data], {
              type: "application/vnd.ms-excel;charset=utf-8",
            });
            // application/vnd.ms-excel为excel类型文档
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
          .post("/category/exportIn", formData)
          .then((response) => {
            debugger;
            alert(response.data.result);
            data.onCategoryPage();
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
