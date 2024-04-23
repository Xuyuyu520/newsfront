<template>
  <el-container class="layout-container">
    <el-aside
      :style="{ height: defaultHeight + 'px' }"
      style="
         {
          padding-bottom: 4rem;
        }
      "
      :width="asideWidth"
    >
      <el-card v-show="!isCollapse" shadow="always">
        <div>
          <el-icon :size="26" style="vertical-align: middle">
            <Promotion />
          </el-icon>
          <span style="vertical-align: middle; padding-left: 1rem"
            >新闻后台管理界面</span
          >
        </div>
      </el-card>
      <el-menu
        router
        :default-active="$route.path"
        :collapse="isCollapse"
        text-color="#242e42"
        active-text-color="#2F9688"
        background-color="var(--bg1)"
      >
        <el-sub-menu index="1">
          <template #title>
            <el-icon style="vertical-align: middle">
              <Avatar />
            </el-icon>
            <span style="vertical-align: middle">个人主页</span>
          </template>
          <el-menu-item index="/home">
            <span style="vertical-align: middle">主页</span>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="2">
          <template #title>
            <el-icon style="vertical-align: middle">
              <HelpFilled />
            </el-icon>
            <span style="vertical-align: middle">新闻总部</span>
          </template>
          <el-menu-item index="/newsManage">
            <span style="vertical-align: middle">新闻总部</span>
          </el-menu-item>
          <el-menu-item index="/branchManage">
            <span style="vertical-align: middle">分部管理</span>
          </el-menu-item>
          <el-menu-item index="/divisionManage">
            <span style="vertical-align: middle">支部管理</span>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="3">
          <template #title>
            <el-icon style="vertical-align: middle">
              <Share />
            </el-icon>
            <span style="vertical-align: middle">用户发布</span>
          </template>
          <el-menu-item index="/fileType">
            <span style="vertical-align: middle">发布类型管理</span>
          </el-menu-item>
          <el-menu-item index="/fileManage">
            <span style="vertical-align: middle">用户上传</span>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="4">
          <template #title>
            <el-icon style="vertical-align: middle">
              <UploadFilled />
            </el-icon>
            <span style="vertical-align: middle">新闻上传下载-管理员</span>
          </template>
          <el-menu-item index="/category">
            <span style="vertical-align: middle">新闻类型</span>
          </el-menu-item>
          <el-menu-item index="/articleInfo">
            <span style="vertical-align: middle">新闻信息</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <!-- todo 头标签 -->
      <el-header style="height: 100px">
        <div class="header">
          <div style="padding-left: 0.4rem">
            <el-icon
              @click="onCollapse"
              :size="20"
              style="vertical-align: middle; cursor: pointer"
            >
              <component :is="isCollapse ? 'Expand' : 'Fold'"></component>
            </el-icon>
            <el-icon
              :size="16"
              color="#55bc8a"
              style="vertical-align: middle; padding-left: 2rem"
            >
              <Timer />
            </el-icon>
            <span style="padding-right: 2rem; vertical-align: middle">{{
              nowTimes
            }}</span>
          </div>
          <div
            style="
              padding-bottom: 0.8rem;
              color: #e6a23c;
              font-size: 16px;
              font-weight: bold;
            "
          >
            <el-icon>
              <MostlyCloudy />
            </el-icon>
            新闻后台管理页面
          </div>
          <div style="padding-right: 0.4rem">
            <el-dropdown style="line-height: 60px">
              <span class="el-dropdown-link" style="color: var(--theme)">
                <span style="cursor: pointer; vertical-align: middle"
                  >{{ userName }}欢迎您</span
                >
                <el-icon style="vertical-align: middle"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="onLogout" icon="SwitchButton"
                    >退出</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        <TabsMenu></TabsMenu>
      </el-header>
      <!-- todo 主体标签 -->
      <el-main :style="{ height: defaultHeight + 'px' }">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
import { onBeforeMount, onMounted, reactive, toRefs } from "vue";
import { timeFormate } from "../utils/utils.js";
import { useRouter } from "vue-router";
import TabsMenu from "../components/TabsMenu.vue";
import { useTokenStore, useUserStore } from "/src/store/settings.js";

export default {
  components: {
    //引入组件
    TabsMenu,
  },

  setup() {
    //实例化userouter
    const router = useRouter();
    onBeforeMount(() => {
      data.defaultHeight =
        document.body.clientHeight || document.documentElement.clientHeight;
    });

    //onMounted()生命周期
    onMounted(() => {
      const script = document.createElement("script");
      script.src = "https://files.cnblogs.com/files/quaint/sakuraPlus.js";
      script.async = true;
      document.body.appendChild(script);

      const userStore = useUserStore();
      data.userName = userStore.getUser.nickname;
      data.onNowTimes();
      window.addEventListener("resize", data.onDefaultHeight);
    });
    const data = reactive({
      nowTimes: "",
      isCollapse: false,
      asideWidth: "240px",
      defaultHeight: null,
      userName: "张三",
      userType: "",
      menuList: [],

      onNowTimes: () => {
        setInterval(() => {
          data.nowTimes = timeFormate(new Date());
        }, 1000);
      },
      onCollapse: () => {
        if (data.isCollapse) {
          data.asideWidth = "240px";
          data.isCollapse = false;
        } else {
          data.isCollapse = true;
          data.asideWidth = "64px";
        }
      },
      onDefaultHeight: () => {
        data.defaultHeight = window.innerHeight;
      },
      onLogout: () => {
        const tokenStore = useTokenStore();
        tokenStore.delToken();
        router.push({ path: "loginPage" });
      },
    });

    return {
      ...toRefs(data),
    };
  },
};
</script>
<style lang="scss">
.layout-container {
  .el-header {
    padding: 0;
    background: var(--bg1);

    .header {
      display: flex;
      justify-content: space-between;
      line-height: 50px;
      color: var(--theme);
      // border:1px transparent solid;
      // border-image:linear-gradient(to right,var(--bg1),#DCDFE6,var(--bg1)) 1 10;
      // box-shadow: 0 4px 8px 0 rgba(36,46,66,.06)!important;
      padding-right: 0.4rem;

      .el-dialog__header {
        background: var(--theme);
        padding: 0 10px;

        .el-dialog__title {
          color: var(--theme);
        }
      }
    }
  }

  .el-aside {
    height: 100%;
    transition: all 0.5s;
    background: var(--bg1);
    overflow-y: auto;
    overflow-x: hidden;

    .el-menu {
      border: none;

      .el-menu-item,
      .el-sub-menu__title {
        height: 40px;
        line-height: 40px;
      }

      .el-sub-menu__title:hover {
        background: var(--bg1) !important;
      }

      .el-menu-item:hover {
        background: var(--bg1) !important;
      }
    }

    .el-card {
      margin: 0.4rem 0.6rem;
      background-color: var(--theme);
      color: #fff;

      .el-card__body {
        padding: 1rem 2rem;
      }
    }
  }

  .el-aside::-webkit-scrollbar {
    width: 0px;
  }

  .el-main {
    padding: 0;
    overflow-x: hidden;
    overflow-y: auto;
    background: var(--bg1);

    .el-dialog__header {
      background: var(--theme);
      padding: 10px;

      .el-dialog__title {
        color: #fff;
      }
    }
  }

  .el-main::-webkit-scrollbar {
    width: 0px;
  }
}

/* 设置行高 */
</style>
