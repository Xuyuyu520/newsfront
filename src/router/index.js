import { createRouter, createWebHashHistory } from "vue-router";
import { useUserStore } from "@/store/settings";

const defaultRoles = ["user", "admin"];

const routes = [
  {
    path: "/",
    redirect: "/loginPage",
  },

  {
    path: "/loginPage",
    name: "LoginPage",
    meta: {
      title: "登录",
      role: defaultRoles, // 添加默认的角色
    },
    component: () => import("views/login/LoginView.vue"),
  },
  {
    path: "/register",
    name: "RegisterPage",
    meta: {
      title: "注册",
      role: defaultRoles, // 添加默认的角色
    },
    component: () => import("views/login/register.vue"),
  },

  {
    path: "/layOut",
    name: "LayOut",
    meta: {
      title: "布局",
      role: defaultRoles, // 添加默认的角色
    },
    component: () => import("views/LayOutView.vue"),
    children: [
      {
        path: "/home",
        name: "Home",
        meta: { title: "首页", role: defaultRoles },
        component: () => import("views/home/HomeView.vue"),
      },
      {
        path: "/branchManage",
        name: "BranchManage",
        meta: { title: "分部管理", role: defaultRoles },
        component: () => import("views/news/BranchManage.vue"),
      },
      {
        path: "/divisionManage",
        name: "DivisionManage",
        meta: {
          title: "支部管理",
          role: defaultRoles,
        },
        component: () => import("views/news/DivisionManage.vue"),
      },
      {
        path: "/newsManage",
        name: "NewsManage",
        meta: { title: "新闻总部管理", role: ["admin"] },
        component: () => import("views/news/NewsManage.vue"),
      },
      {
        path: "/fileType",
        name: "FileType",
        meta: { title: "发布类型管理", role: ["admin"] },
        component: () => import("views/news/FileType.vue"),
      },
      {
        path: "/fileManage",
        name: "FileManage",
        meta: { title: "用户上传管理", role: defaultRoles },
        component: () => import("views/news/FileManage.vue"),
      },
      {
        path: "/Category",
        name: "Category",
        meta: { title: "新闻类型", role: ["admin"] },
        component: () => import("views/article/TypeView.vue"),
      },
      {
        path: "/articleInfo",
        name: "ArticleInfo",
        meta: { title: "新闻信息", role: defaultRoles },
        component: () => import("views/article/ArticleView.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
// router.beforeEach((to, from, next) => {
//   document.title = to.meta.title;
//   next();
// });

router.beforeEach((to, from, next) => {
  if (to.path === "/loginPage") {
    next();
    return;
  }
  const userStore = useUserStore(); // 获取用户存储对象
  // 获取用户角色
  const userRole = userStore.getUser.role;

  document.title = to.meta.title;

  // 根据用户的角色进行相应的权限控制
  if (to.meta.role && !to.meta.role.includes(userRole)) {
    // 如果用户角色不在允许的角色列表中，则重定向到无权限页面或其他逻辑处理
    alert("你没有权限,联系管理员");
    next("/home"); // 例如跳转到无权限页面
  } else {
    next(); // 否则继续路由跳转
  }
});

export default router;
