<template>
  <el-row class="login" style="height: 100vh">
    <el-col class="login-page">
      <el-col :span="16" :offset="3" class="form">
        <el-form-item>
          <!-- 添加 logo -->
          <el-col :offset="0" class="logo-container" style="max-width: 16%">
            <img
              src="https://camo.githubusercontent.com/e30b24e8768c4a5b9386baba74c2352d3f217e767b33c2dea051c7a0fb3e7310/68747470733a2f2f74656368737461636b2d67656e657261746f722e76657263656c2e6170702f6b756265726e657465732d69636f6e2e737667"
              alt="Logo"
            />
          </el-col>
          <el-col style="text-align: center; font-size: 60px"
            >大事件新闻管理系统
          </el-col>
        </el-form-item>
        <div class="login-main">
          <div class="login-form-container">
            <!-- 将登录表单放在中间 -->
            <div class="login-form">
              <el-form :model="user" :rules="rules" ref="form">
                <div class="login-form-title" style="font-size: 30px">
                  账户密码登录
                </div>
                <el-form-item prop="name">
                  <el-input
                    v-model="user.name"
                    prefix-icon="Avatar"
                    placeholder="请输入用户名称"
                    style="width: 100%"
                  ></el-input>
                </el-form-item>
                <el-form-item prop="password">
                  <el-input
                    type="password"
                    v-model="user.password"
                    prefix-icon="Lock"
                    show-password
                    placeholder="请输入密码"
                    style="width: 100%"
                  ></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    round
                    @click="login_1"
                    style="width: 100%"
                    >登录
                  </el-button>
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    round
                    @click="reg"
                    style="width: 100%"
                    >注册
                  </el-button>
                </el-form-item>
                <p style="color: red; text-align: left">{{ returnMsg }}</p>
              </el-form>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 底部链接 -->
      <el-col
        class="footer"
        style="
          background-color: #0e75b8;
          color: #fff;
          width: 100%;
          margin: 30px;
          padding: 20px;
        "
      >
        <el-col>
          <a href="mailto:your_admin@example.com" class="button-link"
            >忘记密码请联系管理员</a
          >
          <a
            href="https://github.com/qianguyihao/Web"
            target="_blank"
            style="color: #f56c6c"
            >前端学习</a
          >
          <el-icon>
            <Right />
          </el-icon>
          <el-icon>
            <Link />
          </el-icon>
          <a
            href="https://github.com/qianguyihao/Web"
            target="_blank"
            style="color: #ff4949"
            >后端学习</a
          >
        </el-col>
        <el-col>
          <img
            style="width: 60px"
            src="https://camo.githubusercontent.com/af29beac2540834efd4be7e1f215af0d11e287b4cb3fbc40d531457c10db6ef7/68747470733a2f2f63646e2e6a7364656c6976722e6e65742f67682f73756e3032323553554e2f73756e3032323553554e2f6173736574732f696d616765732f6769746875622e77656270"
            alt="Logo"
          />
          我的主页 链接 GitHub：<a
            href="https://github.com/Xuyuyu520"
            target="_blank"
            style="color: #e6a23c"
            >Xuyuyu520</a
          >
        </el-col>
      </el-col>
    </el-col>
  </el-row>
</template>

<script>
import { ref, onMounted, reactive, toRefs } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { ElMessage } from "element-plus";
import { useUserStore } from "/src/store/settings.js";
import Icon from "@/components/Icon.vue";

export default {
  components: { Icon },
  props: {
    //入口参数
  },

  setup() {
    const formRef = ref(null); // 创建表单组件实例的引用
    //实例化userouter
    const router = useRouter();
    //onMounted()生命周期
    onMounted(() => {});
    const data = reactive({
      loginStyle: {
        height: "",
      },
      user: {
        name: "",
        password: "",
        userType: "",
      },
      returnMsg: "",
      rules: {
        name: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 4, message: "用户名至少为4位", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, message: "密码至少为6位", trigger: "blur" },
        ],
      },
      login_1: () => {
        // 校验用户名和密码是否为空
        if (!data.user.name || !data.user.password) {
          ElMessage.error({
            message: "用户名和密码不能为空",
            type: "error",
          });
          return;
        }

        axios
          .post("login", {
            username: data.user.name,
          })
          .then((response) => {
            var temps = response.data;
            if (temps.code == 0) {
              ElMessage.success({
                message: "登录成功",
                type: "success",
              });
              const userStore = useUserStore();
              userStore.setUser(temps.data);
              router.push({ path: "/home" });
            } else {
              // 显示后端返回的错误提示信息
              if (temps.code == 1001) {
                // 用户名错误
                ElMessage.error({
                  message: "用户名错误",
                  type: "error",
                });
              } else if (temps.code == 1002) {
                // 密码错误
                ElMessage.error({
                  message: "密码错误",
                  type: "error",
                });
              } else {
                data.returnMsg = temps.msg;
                ElMessage.error({
                  message: "请检查用户名或密码是否有误",
                  type: "error",
                });
              }
            }
          })
          .catch((error) => {
            // 请求失败处理
            console.log(error);
            ElMessage.error({
              message: "请求失败，请稍后重试",
              type: "error",
            });
          });
      },

      reg: () => {
        router.push({
          path: "register",
        });
      },
    });
    const login = () => {
      formRef.value.validate((valid) => {
        if (valid) {
          // 表单验证通过，执行登录逻辑
          console.log("表单验证通过，可以执行登录逻辑");
        } else {
          // 表单验证失败，显示错误信息
          console.log("表单验证失败");
        }
      });
    };

    return {
      // 返回组件中需要的属性和方法
      formRef,
      login,
      ...toRefs(data),
    };
  },
};
</script>

<style lang="scss" scoped="scoped">
html,
body {
  height: 100%;
  margin: 0;
}

.logo-container {
  width: 65px;
  height: 100px;
  max-width: 100%;
  max-height: 100%;
}

.login {
  background-image: url("https://pic3.zhimg.com/v2-3b83e03ec8352b504e7a3dab903a9c66_r.jpg");
  background-size: cover;
  background-color: transparent;
  height: 100%;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;

  .el-card__body {
    padding: 0;
    background-color: transparent;

    .footer {
      border: none; /* 去掉边框 */
    }
  }

  .login-main {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    .login-form {
      width: 40rem;
      height: 250px;

      .login-form-title {
        margin-top: 100px;
        font-size: 18px;
        font-weight: 70;
        text-align: center;
        padding-bottom: 2rem;
      }
    }
  }
}

.button-link {
  display: inline-block;
  padding: 10px 20px;
  background-color: #e6a23c;
  color: #fff;
  text-decoration: none;
  border-radius: 10px;
  border: none; /* 去掉边框 */
}

.button-link:hover {
  background-color: #40a9ff;
}
</style>
