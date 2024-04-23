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
          <el-button type="primary" @click="onAddNews">添加新闻总部</el-button>
        </div>
        <div>
          <el-input
            v-model="searchForm.cname"
            placeholder="请输入新闻总部名称"
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
    <el-dialog :title="newsTitle" v-model="newsVisible" :show-close="false">
      <el-form
        :model="newsForm"
        :rules="rules"
        ref="newsRuleForm"
        status-icon
        label-width="150px"
      >
        <el-form-item
          prop="cname"
          label="新闻总部名"
          :rules="[
            { required: true, message: '请输入新闻总部名', trigger: 'blur' },
          ]"
        >
          <el-input
            v-model="newsForm.cname"
            placeholder="请输入新闻总部名"
          ></el-input>
        </el-form-item>
        <el-form-item
          prop="tname"
          label="负责人"
          :rules="[
            { required: true, message: '请输入负责人', trigger: 'blur' },
          ]"
        >
          <el-input
            v-model="newsForm.tname"
            placeholder="请输入负责人"
          ></el-input>
        </el-form-item>
        <el-form-item label="新闻总部图片">
          <el-upload
            class="avatar-uploader"
            :httpRequest="upload"
            :show-file-list="false"
            auto-upload="true"
          >
            <img
              v-if="newsForm.url"
              :src="imageUrlPrefix + newsForm.url"
              class="avatar"
              style="width: 178px; height: 178px"
            />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item
          prop="enabled"
          label="是否启用"
          :rules="[{ required: true, message: '是否启用', trigger: 'blur' }]"
        >
          <el-switch
            v-model="newsForm.enabled"
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
          <el-button @click="newsVisible = false">取消</el-button>
          <el-button type="primary" @click="onSubmit">提交</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>
<script>
import { getCurrentInstance, onMounted, reactive, ref, toRefs } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Table from "../../components/Table.vue";
import axios from "axios";


export default {
  computed: {
    rules() {
      return rules;
    },
  },
  props: {
    //入口参数
  },
  components: {
    //引入组件
    Table,
  },
  setup() {
    onMounted(() => {
      data.onNewsPage();
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
        { prop: "cno", label: "新闻总部号" },
        { prop: "cname", label: "新闻总部名" },
        { prop: "tname", label: "负责人" },
        { prop: "url", label: "图片图片", type: "img" },
        { prop: "enabled", label: "是否启用" },
      ],
      imageUrlPrefix:
        getCurrentInstance()?.appContext.config.globalProperties.$imageUrl,
      tableData: [],
      newsRuleForm: ref(null),
      typeLoading: false,
      newsVisible: false,
      newsTitle: "添加新闻总部信息",
      operate: 0,
      newsForm: {
        cno: "",
        ename: "",
        cname: "",
        tname: "",
        url: "",
        enabled: true,
      },
      orgData: [],
      onNewsPage: () => {
        data.loading = true;
        axios
          .get("/news/getNewsList", {
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
        data.onNewsPage();
      },

      onRefresh: () => {
        data.searchForm = {
          cname: null,
        };
        data.onNewsPage();
      },
      onSizeChange: (e) => {
        data.page.size = e;
        data.onNewsPage();
      },
      onCurrentChange: (e) => {
        data.page.current = e;
        data.onNewsPage();
      },
      // 添加用户信息
      onAddNews: () => {
        data.userTitle = "添加新闻总部类型";
        data.operate = 0;
        data.newsForm = {
          cno: "",
          ename: "",
          cname: "",
          tname: "",
          url: "",
          enabled: true,
        };
        data.newsVisible = true;
      },
      onEdit: (val) => {
        data.userTitle = "修改新闻总部类型";
        data.operate = 1;
        data.newsForm = {
          cno: val.column.row.cno,
          cname: val.column.row.cname,
          ename: val.column.row.ename,
          tname: val.column.row.tname,
          url: val.column.row.url,
          enabled: val.column.row.enabled,
        };
        data.newsVisible = true;
      },
      onSubmit: async () => {
        const form = data.newsRuleForm;
        if (!form) return;
        await form.validate();
        if (data.operate == 0) {
          axios.post("/news/newsSave", data.newsForm).then((res) => {
            if (res.data.result) {
              ElMessage.success({
                message: "添加成功！",
                type: "success",
              });
              data.onNewsPage();
              data.newsVisible = false;
            }
          });
        } else {
          axios.patch("/news/newsUpdate", data.newsForm).then((res) => {
            if (res.data.result) {
              ElMessage.success({
                message: "修改成功！",
                type: "success",
              });
              data.onNewsPage();
              data.newsVisible = false;
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
              cno: val.column.row.cno,
            };
            axios.delete("/news/newsDelete", { params: param }).then((res) => {
              if (res) {
                ElMessage.success("删除成功!");
                data.onNewsPage();
              }
            });
          })
          .catch((e) => {
            console.log(e);
          });
      },
      upload: (params) => {
        var file = params.file; //获取input的图片file值
        var formData = new FormData();
        formData.append("myfile", file); //对应后台接收图片名
        axios
          .post("upload", formData)
          .then((response) => {
            data.newsForm.url = response.data.result;
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
