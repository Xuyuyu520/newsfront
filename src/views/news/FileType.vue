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
          <el-button type="primary" @click="onAddfileType"
            >添加发布类型</el-button
          >
        </div>
        <div>
          <el-input
            v-model="searchForm.cname"
            placeholder="请输入发布类型名称"
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
      :title="fileTypeTitle"
      v-model="fileTypeVisible"
      :show-close="false"
    >
      <el-form
        :model="fileTypeForm"
        :rules="rules"
        ref="fileTypeRuleForm"
        status-icon
        label-width="150px"
      >
        <el-form-item
          prop="typeId"
          label="发布类型id"
          :rules="[
            { required: true, message: '请输入发布类型id', trigger: 'blur' },
            {
              pattern: /^[1-9][0-9]{0,10}$/,
              message: 'id只能是数字且不能有空格,长度不能超过11位',
              trigger: 'blur',
            },
          ]"
        >
          <el-input
            v-if="operate == 0"
            v-model="fileTypeForm.typeId"
            placeholder="请输入发布类型id"
          ></el-input>
          <el-input
            v-if="operate == 1"
            disabled
            v-model="fileTypeForm.typeId"
            placeholder="请输入发布类型id"
          ></el-input>
        </el-form-item>
        <el-form-item
          prop="cname"
          label="发布类型中文名"
          :rules="[
            {
              required: true,
              message: '请输入发布类型中文名',
              trigger: 'blur',
            },
          ]"
        >
          <el-input
            v-model="fileTypeForm.cname"
            placeholder="请输入发布类型中文名"
          ></el-input>
        </el-form-item>
        <el-form-item
          prop="ename"
          label="发布类型英文名"
          :rules="[
            {
              required: true,
              message: '请输入发布类型英文名',
              trigger: 'blur',
            },
          ]"
        >
          <el-input
            v-model="fileTypeForm.ename"
            placeholder="请输入发布类型英文名"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="fileTypeVisible = false">取消</el-button>
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
      data.onfileTypePage();
    });
    const data = reactive({
      searchForm: {
        cname: null,
      },
      loading: false,
      page: {
        current: 1,
        size: 10,
        total: 1,
      },
      tableTitle: [
        { prop: "", label: "", fixed: "left" },
        { prop: "typeId", label: "发布类型id" },
        { prop: "ename", label: "类型英文名" },
        { prop: "cname", label: "类型中文名" },
      ],
      tableData: [],
      fileTypeRuleForm: ref(null),
      typeLoading: false,
      fileTypeVisible: false,
      fileTypeTitle: "添加发布类型",
      operate: 0,
      fileTypeForm: {
        typeId: "",
        ename: "",
        cname: "",
      },
      orgData: [],
      onfileTypePage: () => {
        data.loading = true;
        debugger;
        axios
          .get("/fileType/getFileTypeList", {
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
        data.onfileTypePage();
      },

      onRefresh: () => {
        data.searchForm = {
          cname: null,
        };
        data.onfileTypePage();
      },
      onSizeChange: (e) => {
        data.page.size = e;
        data.onfileTypePage();
      },
      onCurrentChange: (e) => {
        data.page.current = e;
        data.onfileTypePage();
      },
      // 添加用户信息
      onAddfileType: () => {
        data.userTitle = "添加发布类型";
        data.operate = 0;
        data.fileTypeForm = {
          typeId: "",
          ename: "",
          cname: "",
        };
        data.fileTypeVisible = true;
      },
      onEdit: (val) => {
        data.userTitle = "修改发布类型";
        data.operate = 1;
        data.fileTypeForm = {
          typeId: val.column.row.typeId,
          cname: val.column.row.cname,
          ename: val.column.row.ename,
        };
        debugger;
        data.fileTypeVisible = true;
      },
      onSubmit: async () => {
        const form = data.fileTypeRuleForm;
        if (!form) return;
        await form.validate();
        if (data.operate == 0) {
          axios
            .post("/fileType/fileTypeSave", data.fileTypeForm)
            .then((res) => {
              debugger;
              if (res.data.result) {
                ElMessage.success({
                  message: "添加成功！",
                  type: "success",
                });
                data.onfileTypePage();
                data.fileTypeVisible = false;
              }
            });
        } else {
          axios
            .patch("/fileType/fileTypeUpdate", data.fileTypeForm)
            .then((res) => {
              debugger;
              if (res.data.result) {
                ElMessage.success({
                  message: "修改成功！",
                  type: "success",
                });
                data.onfileTypePage();
                data.fileTypeVisible = false;
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
              .delete("/fileType/fileTypeDelete", { params: param })
              .then((res) => {
                if (res) {
                  ElMessage.success("删除成功!");
                  data.onfileTypePage();
                }
              });
          })
          .catch((e) => {
            console.log(e);
          });
      },
    });
    return {
      ...toRefs(data),
    };
  },
};
</script>
