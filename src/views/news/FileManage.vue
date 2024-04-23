<template>
  <div class="file">
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
              <el-button type="primary" @click="onAddFile">添加新闻</el-button>
            </el-col>
            <el-col :span="7">
              <el-form-item label="新闻名">
                <el-input
                  v-model="searchForm.oldName"
                  placeholder="请输入新闻名称"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="7" label="新闻上传人">
              <el-form-item label="新闻上传人">
                <el-input
                  v-model="searchForm.creator"
                  placeholder="请输入新闻上传人"
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
        </template>
        <template #column="scope">
          <el-button
            @click="download(scope)"
            type="text"
            style="color: var(--edit)"
            >下载</el-button
          >
          <el-button
            @click="onPreview(scope)"
            type="text"
            style="color: var(--delete)"
            >预览</el-button
          >
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
      <el-dialog :title="fileTitle" v-model="fileVisible" :show-close="false">
        <el-form
          :model="fileForm"
          :rules="rules"
          ref="fileRuleForm"
          status-icon
          label-width="100px"
        >
          <el-form-item
            prop="cno"
            label="新闻总部名"
            :rules="[
              { required: true, message: '请选择新闻总部', trigger: 'blur' },
            ]"
          >
            <el-select
              v-model="fileForm.cno"
              placeholder="请选择新闻总部"
              @change="getBranchDivision(fileForm.cno)"
              style="width: 100%"
            >
              <el-option
                v-for="item in newsData"
                :label="item.cname + '---' + item.tname"
                :value="item.cno"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            prop="branch"
            label="分部分部"
            :rules="[
              { required: true, message: '请输入分部', trigger: 'blur' },
            ]"
          >
            <el-cascader
              :options="options"
              v-model="fileForm.branchDivision"
              clearable
            />
          </el-form-item>
          <el-form-item
            prop="type"
            label="类型"
            :rules="[
              { required: true, message: '请选择类型', trigger: 'blur' },
            ]"
          >
            <el-select
              v-model="fileForm.type"
              placeholder="请选择类型"
              style="width: 100%"
            >
              <el-option
                v-for="item in typeData"
                :label="item.cname"
                :value="item.typeId"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="新闻"
            :rules="[
              { required: true, message: '请上传新闻', trigger: 'blur' },
            ]"
          >
            <el-upload
              v-model:file-list="fileList"
              class="upload-demo"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :limit="1"
              :httpRequest="uploadFile"
              auto-upload="false"
            >
              <el-button type="primary">Click to upload</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  jpg/png files with a size less than 500KB.
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="fileVisible = false">取消</el-button>
            <el-button type="primary" @click="onSubmit">提交</el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
import { getCurrentInstance, onMounted, reactive, ref, toRefs } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Table from "../../components/Table.vue";
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
      data.onSearchNews();
      data.onFilePage();
      data.onFileType();
    });
    const data = reactive({
      searchForm: {
        oldName: null,
        creator: null,
      },
      newsData: [],
      fileList: [],
      typeData: [],
      userName: "张三",
      loading: false,
      page: {
        current: 1,
        size: 10,
        total: 1,
      },
      tableTitle: [
        { prop: "", label: "", fixed: "left" },
        { prop: "typeName", label: "用户发布上传类型" },
        { prop: "newsName", label: "新闻总部名称" },
        { prop: "oldName", label: "新闻" },
        { prop: "creator", label: "上传者" },
        { prop: "downloadNum", label: "下载次数" },
      ],
      options: [],
      tableData: [],
      fileRuleForm: ref(null),
      fileVisible: false,
      fileTitle: "添加新闻",
      operate: 0,
      fileForm: {
        id: "",
        cno: "",
        resourceType: "",
        newName: "",
        oldName: "",
        url: "",
        size: "",
        suffix: "",
        creator: "",
        type: "",
        enabled: 0,
        downloadNum: 0,
        uploadTime: "",
        branch: "",
        division: true,
        branchDivision: [],
      },
      orgData: [],
      getBranchDivision: async (cno) => {
        data.loading = true;
        if (!cno) {
          return;
        }
        data.searchForm.options = "";
        await axios
          .get("/division/getBranchDivision", { params: { cno: cno } })
          .then((res) => {
            debugger;
            data.loading = false;
            data.options = res.data.result;
          });
      },
      uploadRef: ref(null),
      imageUrlPrefix:
        getCurrentInstance()?.appContext.config.globalProperties.$imageUrl,
      onFilePage: () => {
        data.loading = true;
        axios
          .get("/fileInfo/getFileInfoList", {
            params: Object.assign(data.page, data.searchForm),
          })
          .then((res) => {
            data.loading = false;
            data.tableData = res.data.result.list;
            data.page.current = res.data.result.pageNum;
            data.page.size = res.data.result.pageSize;
            data.page.total = res.data.result.total;
          });
      },
      onSearch: () => {
        data.onFilePage();
      },
      onFileType: () => {
        data.loading = true;
        debugger;
        axios.get("/fileType/getAllFileType").then((res) => {
          debugger;
          data.loading = false;
          data.typeData = res.data.result;
        });
      },
      onRefresh: () => {
        data.searchForm = {
          cname: null,
        };
        data.onFilePage();
      },
      onSizeChange: (e) => {
        data.page.size = e;
        data.onFilePage();
      },
      onCurrentChange: (e) => {
        data.page.current = e;
        data.onFilePage();
      },
      onPreview: (e) => {
        window.open(data.imageUrlPrefix + e.column.row.url);
      },
      download: (e) => {
        debugger;
        const config = {
          method: "get",
          url: "download",
          params: {
            url: e.column.row.url,
          },
          headers: {
            //和后端设置的一样
            "Content-Type": "application/octet-stream;charset=UTF-8",
          },
          responseType: "blob",
        };
        axios(config).then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", e.column.row.oldName);
          document.body.appendChild(link);
          link.click();
        });
      },
      onSearchNews: () => {
        axios.get("/news/getAllNews").then((res) => {
          data.newsData = res.data.result;
        });
      },
      // // 添加用户信息
      onAddFile: () => {
        data.fileTitle = "添加新闻";
        data.operate = 0;
        data.fileForm = {
          id: "",
          cno: "",
          resourceType: "",
          newName: "",
          oldName: "",
          url: "",
          size: "",
          suffix: "",
          creator: "",
          type: "0",
          enabled: true,
          downloadNum: 0,
          uploadTime: "",
          branch: "",
          division: "",
          branchDivision: [],
        };
        data.fileVisible = true;
      },
      onEdit: (val) => {
        data.fileTitle = "修改新闻";
        data.operate = 1;
        data.getBranchDivision(val.column.row.cno);
        data.fileForm = {
          id: val.column.row.id,
          cno: val.column.row.cno,
          resourceType: val.column.row.resourceType,
          newName: val.column.row.newName,
          oldName: val.column.row.oldName,
          url: val.column.row.url,
          size: val.column.row.size,
          suffix: val.column.row.suffix,
          type: val.column.row.type,
          creator: val.column.row.creator,
          enabled: val.column.row.enabled,
          downloadNum: val.column.row.downloadNum,
          uploadTime: val.column.row.uploadTime,
          branch: val.column.row.branch,
          division: val.column.row.division,
        };
        data.fileForm.branchDivision = [
          data.fileForm.branch,
          data.fileForm.division,
        ];
        data.fileList = [];
        data.fileList.push({
          name: val.column.row.oldName,
          url: data.imageUrl + data.fileForm.fileUrl,
        });
        data.fileVisible = true;
      },
      onSubmit: async () => {
        debugger;
        data.fileForm.branch = data.fileForm.branchDivision[0];
        data.fileForm.division = data.fileForm.branchDivision[1];
        const form = data.fileRuleForm;
        if (!form) return;
        debugger;
        await form.validate();
        if (data.operate == 0) {
          axios.post("/fileInfo/fileInfoSave", data.fileForm).then((res) => {
            if (res.data.result) {
              ElMessage.success({
                message: "添加成功！",
                type: "success",
              });
              data.onFilePage();
              data.fileList = [];
              data.fileVisible = false;
            }
          });
        } else {
          axios.patch("/fileInfo/fileInfoUpdate", data.fileForm).then((res) => {
            if (res.data.result) {
              ElMessage.success({
                message: "修改成功！",
                type: "success",
              });
              data.onFilePage();
              data.fileList = [];
              data.fileVisible = false;
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
              id: val.column.row.id,
            };
            axios
              .delete("/fileInfo/fileInfoDelete", { params: param })
              .then((res) => {
                if (res.data.result) {
                  ElMessage.success("删除成功!");
                  data.onFilePage();
                }
              });
          })
          .catch((e) => {
            console.log(e);
          });
      },
      uploadFile: (params) => {
        var file = params.file; //获取input的图片file值
        var formData = new FormData();
        formData.append("myfile", file); //对应后台接收图片名
        axios
          .post("uploadFile", formData)
          .then((response) => {
            var fileInfo = response.data.result;
            data.fileForm.newName = fileInfo.newName;
            data.fileForm.oldName = fileInfo.oldName;
            data.fileForm.url = fileInfo.url;
            data.fileForm.size = fileInfo.size;
            data.fileForm.suffix = fileInfo.suffix;
            data.fileForm.resourceType = fileInfo.resourceType;
            data.fileForm.creator = data.userName;
            data.fileForm.downloadNum = 0;
            ElMessage.success({
              message: "上传成功",
              type: "success",
            });
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
