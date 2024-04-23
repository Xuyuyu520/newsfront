<template>
  <div class="tabs-menu">
    <el-tabs
      v-model="tabsMenuValue"
      type="card"
      @tab-click="onTabMenuClick"
      @tab-remove="onTabMenuRemove"
    >
      <el-tab-pane
        v-for="item in tabsMenuList"
        :key="item.path"
        :path="item.path"
        :label="item.title"
        :name="item.path"
        :closable="item.close"
      >
        <template #label>
          <el-icon
            v-if="item.icon"
            style="vertical-align: middle; padding-right: 0.2rem"
          >
            <component :is="item.icon"></component>
          </el-icon>
          <span style="vertical-align: middle">{{ item.title }}</span>
        </template>
      </el-tab-pane>
    </el-tabs>
    <el-dropdown trigger="hover">
      <el-button size="small" type="primary">
        <span>更多</span>
        <el-icon class="el-icon--right">
          <arrow-down />
        </el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item icon="CircleCloseFilled" @click="onCloseCurrentTab"
            >关闭当前</el-dropdown-item
          >
          <el-dropdown-item icon="CircleClose" @click="onCloseOtherTab"
            >关闭其他</el-dropdown-item
          >
          <el-dropdown-item icon="CloseBold" @click="onCloseAllTab"
            >关闭所有</el-dropdown-item
          >
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
<script>
import { onMounted, watch, reactive, toRefs } from "vue";
import { useRoute, useRouter } from "vue-router";
import { HOME_URL, TABS_BLACK_LIST } from "../configure/config.js";

export default {
  props: {
    //入口参数
  },
  components: {},
  setup() {
    const route = useRoute();
    const router = useRouter();
    onMounted(() => {});
    const data = reactive({
      tabsMenuValue: HOME_URL,
      tabsMenuList: [
        { title: "首页", path: HOME_URL, icon: "HomeFilled", close: false },
      ],
      onAddTabManu: (tabItem) => {
        if (TABS_BLACK_LIST.includes(tabItem.path)) return;

        if (data.tabsMenuList.every((item) => item.path !== tabItem.path)) {
          data.tabsMenuList.push(tabItem);
        }
        data.tabsMenuValue = tabItem.path;
        router.push(tabItem.path);
      },
      onTabMenuClick: (tabItem) => {
        let path = tabItem.props.name;
        router.push(path);
      },
      onTabMenuRemove: (tabItem) => {
        let _tabsMenuValue = data.tabsMenuValue;
        let _tabsMenuList = data.tabsMenuList;
        if (_tabsMenuValue === tabItem) {
          _tabsMenuList.forEach((item, index) => {
            if (item.path !== tabItem) return;

            let nextTab = _tabsMenuList[index + 1] || _tabsMenuList[index - 1];
            if (!nextTab) return;

            _tabsMenuValue = nextTab.path;
            router.push(nextTab.path);
          });
        }
        data.tabsMenuValue = _tabsMenuValue;
        data.tabsMenuList = _tabsMenuList.filter(
          (item) => item.path !== tabItem
        );
      },
      onCloseCurrentTab: () => {
        if (data.tabsMenuValue === HOME_URL) return;
        onTabMenuRemove(data.tabsMenuValue);
      },
      onCloseOtherTab: () => {
        data.tabsMenuList = data.tabsMenuList.filter((item) => {
          return item.path === data.tabsMenuValue || item.path === HOME_URL;
        });
      },
      onCloseAllTab: () => {
        data.tabsMenuList = data.tabsMenuList.filter((item) => {
          return item.path === HOME_URL;
        });
        router.push(HOME_URL);
      },
    });
    watch(
      () => route.path,
      () => {
        let params = {
          title: route.meta.title,
          path: route.path,
          close: true,
        };
        data.onAddTabManu(params);
      },
      {
        immediate: true,
      }
    );
    return {
      ...toRefs(data),
    };
  },
};
</script>
<style lang="scss">
.tabs-menu {
  position: relative;
  width: 100%;
  border-top: 1px transparent solid;
  border-image: linear-gradient(to right, var(--bg1), #dcdfe6, var(--bg1)) 1 10;
  box-shadow: 0 4px 8px 0 rgba(36, 46, 66, 0.06) !important;
  // margin-bottom: 0.2rem;

  .el-dropdown {
    position: absolute;
    top: 8px;
    right: 13px;
  }

  .el-tabs__nav-wrap {
    position: absolute;
    width: calc(100% - 120px);
  }

  .el-tabs--card > .el-tabs__header {
    box-sizing: border-box;
    height: 40px;
    padding: 0;
    margin: 0;
  }

  .el-tabs--card > .el-tabs__header .el-tabs__nav {
    border: none;
  }

  .el-tabs--card > .el-tabs__header .el-tabs__item {
    color: var(--theme);
    border: none;
  }

  .el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
    color: var(--theme2);
    border-bottom: 2px solid var(--theme2);
  }

  .el-tabs__item .is-icon-close svg {
    margin-top: 0.5px;
  }
}
</style>
