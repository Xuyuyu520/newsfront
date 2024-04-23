<template>
  <div class="branch">
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
            <el-col :span="4">
              <el-button type="primary" @click="onAddBranch"
                >添加分部</el-button
              >
            </el-col>
            <el-col :span="12">
              <el-form-item label="新闻总部名：">
                <el-select
                  v-model="searchForm.cno"
                  placeholder="请选择新闻总部"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in newsData"
                    :label="item.cname + '---' + item.tname"
                    :value="item.cno"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="7">
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
        :title="branchTitle"
        v-model="branchVisible"
        :show-close="false"
      >
        <el-form
          :model="branchForm"
          :rules="rules"
          ref="branchRuleForm"
          status-icon
          label-width="100px"
        >
          <el-form-item
            v-if="operate == 0"
            prop="cno"
            label="新闻总部名"
            :rules="[
              { required: true, message: '请选择新闻总部', trigger: 'blur' },
            ]"
          >
            <el-select
              v-model="branchForm.cno"
              placeholder="请选择新闻总部"
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
            prop="branchName"
            label="分部名"
            :rules="[
              { required: true, message: '请输入支部名', trigger: 'blur' },
            ]"
          >
            <el-input
              v-model="branchForm.branchName"
              placeholder="请输入分部名"
            ></el-input>
          </el-form-item>
          <el-form-item
            prop="enabled"
            label="是否启用"
            :rules="[{ required: true, message: '是否启用', trigger: 'blur' }]"
          >
            <el-switch
              v-model="branchForm.enabled"
              class="ml-2"
              style="
                --el-switch-on-color: #13ce66;
                --el-switch-off-color: #ff4949;
              "
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="branchVisible = false">取消</el-button>
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
      data.onNews();
    });
    const data = reactive({
      searchForm: {
        cno: null,
      },
      typeData: [],
      loading: false,
      page: {
        current: 1,
        size: 10,
        total: 1,
      },
      newsData: [],
      tableTitle: [
        { prop: "", label: "", fixed: "left" },
        { prop: "branchNo", label: "分部id" },
        { prop: "newsName", label: "新闻总部名" },
        { prop: "branchName", label: "分部名" },
        { prop: "enabled", label: "是否启用" },
      ],
      tableData: [],
      branchRuleForm: ref(null),
      typeLoading: false,
      branchVisible: false,
      branchTitle: "添加分部",
      operate: 0,
      branchForm: {
        branchNo: "",
        cno: "",
        branchName: "",
        enabled: true,
      },
      orgData: [],
      branchList: [],
      uploadRef: ref(null),
      imageUrlPrefix:
        getCurrentInstance()?.appContext.config.globalProperties.$imageUrl,
      onBranchPage: () => {
        data.loading = true;
        axios
          .get("/branch/getBranchList", {
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
      onNews: () => {
        axios.get("/news/getAllNews").then((res) => {
          data.newsData = res.data.result;
          if (res.data.result[0]) {
            data.searchForm.cno = res.data.result[0].cno;
            data.onBranchPage();
          }
        });
      },
      onSearch: () => {
        data.onBranchPage();
      },

      onRefresh: () => {
        data.searchForm = {
          cname: null,
        };
        data.onBranchPage();
      },
      onSizeChange: (e) => {
        data.page.size = e;
        data.onBranchPage();
      },
      onCurrentChange: (e) => {
        data.page.current = e;
        data.onBranchPage();
      },
      // // 添加用户信息
      onAddBranch: () => {
        data.userTitle = "添加分部类型";
        data.operate = 0;
        data.branchForm = {
          branchNo: "",
          cno: "",
          branchName: "",
          enabled: true,
        };
        data.branchVisible = true;
      },
      onEdit: (val) => {
        data.userTitle = "修改分部类型";
        data.operate = 1;
        data.branchForm = {
          branchNo: val.column.row.branchNo,
          branchName: val.column.row.branchName,
          cno: val.column.row.cno,
          enabled: val.column.row.enabled,
        };
        data.branchList = [];
        data.branchList.push({
          name: "分部图片",
          url: data.imageUrl + data.branchForm.branchUrl,
        });
        data.branchVisible = true;
      },
      onSubmit: async () => {
        const form = data.branchRuleForm;
        if (!form) return;
        await form.validate();
        if (data.operate == 0) {
          axios.post("/branch/branchSave", data.branchForm).then((res) => {
            if (res.data.result) {
              ElMessage.success({
                message: "添加成功！",
                type: "success",
              });
              data.onBranchPage();
              data.branchVisible = false;
            }
          });
        } else {
          axios.post("/branch/branchUpdate", data.branchForm).then((res) => {
            if (res.data.result) {
              ElMessage.success({
                message: "修改成功！",
                type: "success",
              });
              data.onBranchPage();
              data.branchVisible = false;
            }
          });
        }
      },
      onDelete: (val) => {
        ElMessageBox.confirm("此操作将永久删除该分部, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            let param = {
              branchId: val.column.row.branchId,
            };
            axios.get("/branch/branchDelete", { params: param }).then((res) => {
              if (res.data.result) {
                ElMessage.success("删除成功!");
                data.onBranchPage();
              }
            });
          })
          .catch((e) => {
            console.log(e);
          });
      },
      upload: (params) => {
        var branch = params.branch; //获取input的图片branch值
        var formData = new FormData();
        formData.append("mybranch", branch); //对应后台接收图片名
        axios
          .post("upload", formData)
          .then((response) => {
            data.branchForm.branchUrl = response.data.result;
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
