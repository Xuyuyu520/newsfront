<template>
  <div class="division">
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
              <el-button type="primary" @click="onAddDivision"
                >添加支部</el-button
              >
            </el-col>
            <el-col :span="7">
              <el-form-item label="新闻总部名：">
                <el-select
                  v-model="searchForm.cno"
                  placeholder="请选择新闻总部"
                  @change="getAllBranchByCno(searchForm.cno)"
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
              <el-form-item label="分部名称：">
                <el-select
                  v-model="searchForm.branchNo"
                  placeholder="请选择分部名称"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in branchData"
                    :label="item.branchName"
                    :value="item.branchNo"
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
        :title="divisionTitle"
        v-model="divisionVisible"
        :show-close="false"
      >
        <el-form
          :model="divisionForm"
          :rules="rules"
          ref="divisionRuleForm"
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
              v-model="divisionForm.cno"
              @change="getAllBranchByCno1(divisionForm.cno)"
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
            prop="cno"
            label="分部名"
            :rules="[
              { required: true, message: '请选择分部', trigger: 'blur' },
            ]"
          >
            <el-select
              v-model="divisionForm.branchNo"
              placeholder="请选择分部"
              style="width: 100%"
            >
              <el-option
                v-for="item in branchData1"
                :label="item.branchName"
                :value="item.branchNo"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            prop="divisionName"
            label="支部名"
            :rules="[
              { required: true, message: '请输入支部', trigger: 'blur' },
            ]"
          >
            <el-input
              v-model="divisionForm.divisionName"
              placeholder="请输入分部名"
            ></el-input>
          </el-form-item>
          <el-form-item
            prop="enabled"
            label="是否启用"
            :rules="[{ required: true, message: '是否启用', trigger: 'blur' }]"
          >
            <el-switch
              v-model="divisionForm.enabled"
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
            <el-button @click="divisionVisible = false">取消</el-button>
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
    onMounted(async () => {
      await data.onNews();
      await data.getAllBranchByCno(data.searchForm.cno);
      await data.onDivisionPage();
    });
    const data = reactive({
      searchForm: {
        cno: null,
        branchNo: null,
      },
      typeData: [],
      loading: false,
      page: {
        current: 1,
        size: 10,
        total: 1,
      },
      newsData: [],
      branchData: [],
      branchData1: [],
      tableTitle: [
        { prop: "", label: "", fixed: "left" },
        { prop: "divisionNo", label: "分部id" },
        { prop: "newsName", label: "新闻总部名" },
        { prop: "branchName", label: "分部名" },
        { prop: "divisionName", label: "支部名" },
        { prop: "enabled", label: "是否启用" },
      ],
      tableData: [],
      divisionRuleForm: ref(null),
      typeLoading: false,
      divisionVisible: false,
      divisionTitle: "添加支部",
      operate: 0,
      divisionForm: {
        divisionNo: "",
        cno: "",
        branchNo: "",
        divisionName: "",
        enabled: true,
      },
      orgData: [],
      divisionList: [],
      uploadRef: ref(null),
      imageUrlPrefix:
        getCurrentInstance()?.appContext.config.globalProperties.$imageUrl,
      onDivisionPage: async () => {
        debugger;
        data.loading = true;
        if (!data.searchForm.cno || !data.searchForm.branchNo) {
          data.tableData = [];
          data.loading = false;
          return;
        } else {
          await axios
            .get("/division/getDivisionList", {
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
        }
      },
      onNews: async () => {
        await axios.get("/news/getAllNews").then((res) => {
          debugger;
          data.newsData = res.data.result;
          if (res.data.result[0]) {
            data.searchForm.cno = res.data.result[0].cno;
          }
        });
      },
      getAllBranchByCno1: async (cno) => {
        debugger;
        data.loading = true;
        if (!cno) {
          return;
        }
        data.divisionForm.branchNo = "";
        await axios
          .get("/branch/getAllBranch", { params: { cno: cno } })
          .then((res) => {
            debugger;
            data.loading = false;
            data.branchData1 = res.data.result;
            if (res.data.result[0]) {
              data.divisionForm.branchNo = res.data.result[0].branchNo;
            }
          });
      },
      getAllBranchByCno: async (cno) => {
        data.loading = true;
        if (!cno) {
          return;
        }
        data.searchForm.branchNo = "";
        await axios
          .get("/branch/getAllBranch", { params: { cno: cno } })
          .then((res) => {
            debugger;
            data.loading = false;
            data.branchData = res.data.result;
            if (res.data.result[0]) {
              data.searchForm.branchNo = res.data.result[0].branchNo;
            }
          });
      },
      onSearch: () => {
        data.onDivisionPage();
      },

      onRefresh: () => {
        data.searchForm = {
          cname: null,
        };
        data.onDivisionPage();
      },
      onSizeChange: (e) => {
        data.page.size = e;
        data.onDivisionPage();
      },
      onCurrentChange: (e) => {
        data.page.current = e;
        data.onDivisionPage();
      },
      // // 添加用户信息
      onAddDivision: () => {
        data.userTitle = "添加分部类型";
        data.operate = 0;
        data.divisionForm = {
          divisionNo: "",
          cno: "",
          branchNo: "",
          divisionName: "",
          enabled: true,
        };
        data.divisionVisible = true;
      },
      onEdit: (val) => {
        data.userTitle = "修改分部";
        data.operate = 1;
        data.getAllBranchByCno1(val.column.row.cno);
        data.divisionForm = {
          divisionNo: val.column.row.divisionNo,
          branchNo: val.column.row.branchNo,
          divisionName: val.column.row.divisionName,
          cno: val.column.row.cno,
          enabled: val.column.row.enabled,
        };
        data.divisionVisible = true;
      },
      onSubmit: async () => {
        const form = data.divisionRuleForm;
        if (!form) return;
        await form.validate();
        if (data.operate == 0) {
          axios.post("/division/divisionSave", data.divisionForm).then((res) => {
            if (res.data.result) {
              ElMessage.success({
                message: "添加成功！",
                type: "success",
              });
              data.onDivisionPage();
              data.divisionVisible = false;
            }
          });
        } else {
          axios.post("/division/divisionUpdate", data.divisionForm).then((res) => {
            if (res.data.result) {
              ElMessage.success({
                message: "修改成功！",
                type: "success",
              });
              data.onDivisionPage();
              data.divisionVisible = false;
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
              divisionId: val.column.row.divisionId,
            };
            axios
              .get("/division/divisionDelete", { params: param })
              .then((res) => {
                if (res.data.result) {
                  ElMessage.success("删除成功!");
                  data.onDivisionPage();
                }
              });
          })
          .catch((e) => {
            console.log(e);
          });
      },
      upload: (params) => {
        var division = params.division; //获取input的图片division值
        var formData = new FormData();
        formData.append("mydivision", division); //对应后台接收图片名
        axios
          .post("upload", formData)
          .then((response) => {
            data.divisionForm.divisionUrl = response.data.result;
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
