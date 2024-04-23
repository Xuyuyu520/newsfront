<template>
  <div class="login">
    <el-row shadow="always" style="margin-top: 50px">
      <div class="login-main">
        <div class="login-form">
          <el-form
            :model="userForm"
            :label-position="labelPosition"
            label-width="120px"
          >
            <div class="login-form-title">用户注册</div>
            <el-form-item label="请输入用户名：">
              <el-input
                v-model="userForm.username"
                placeholder="请输入您的用户名"
                style="width: 100%"
              ></el-input>
            </el-form-item>
            <el-form-item label="请输入密码：">
              <el-input
                v-model="userForm.password"
                placeholder="请输入密码"
                style="width: 100%"
              ></el-input>
            </el-form-item>
            <el-form-item label="请确认密码：">
              <el-input
                v-model="userForm.repassword"
                placeholder="请确认密码"
                style="width: 100%"
              ></el-input>
            </el-form-item>
            <el-form-item label="电话：">
              <el-input
                v-model="userForm.phone"
                placeholder="请输入电话"
                style="width: 100%"
              ></el-input>
            </el-form-item>
            <el-form-item label="请输入昵称：">
              <el-input
                v-model="userForm.nickname"
                placeholder="请输入您的昵称"
                style="width: 100%"
              ></el-input>
            </el-form-item>
            <el-form-item label="权限：">
              <el-select v-model="userForm.role" placeholder="权限">
                <el-option label="user" value="user"></el-option>
                <el-option label="admin" value="admin"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="medium" round @click="register_1"
                >提交注册</el-button
              >
              <el-button type="primary" size="medium" round @click="backToLogin"
                >返回登录</el-button
              >
              <a href="mailto:your_admin@example.com" class="button-link"
                >请牢记密码</a
              >
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-row>
  </div>
</template>
<script>
import { computed, reactive, toRefs, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { ElMessage } from "element-plus";
import { registerAction } from "echarts/lib/echarts";

export default {
  props: {
    //入口参数
  },
  setup() {
    //实例化userouter
    const router = useRouter();
    //onMounted()生命周期
    onMounted(() => {});
    const data = reactive({
      labelPosition: "right",
      userForm: {
        username: "",
        password: "",
        repassword: "",
        phone: "",
        nickname: "",
        role: "user",
      },
    });

    const backToLogin = () => {
      router.push({
        path: "loginPage",
      });
    };

    const register_1 = () => {
      if (data.userForm.password != data.userForm.repassword) {
        alert("两次密码不一致");
        return;
      }
      axios
        .post("register", data.userForm)
        .then((response) => {
          debugger;
          if (response.data.code == 200) {
            ElMessage.success({
              message: "注册成功",
              type: "success",
            });
          }
          router.push({
            path: "loginPage",
          });
        })
        .catch((error) => console.log(error));
    };

    return {
      ...toRefs(data),
      backToLogin,
      register_1,
    };
  },
};
</script>
<style lang="scss" scoped="scoped">
.login {
  background-image: url("https://pic3.zhimg.com/v2-3b83e03ec8352b504e7a3dab903a9c66_r.jpg");
  background-size: 150% 150%;
  height: 120%;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;

  .el-card__body {
    padding: 0;
  }

  .login-main {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    .login-form {
      width: 30rem;
      height: 700px;

      .login-form-title {
        margin-top: 100px;
        font-size: 18px;
        font-weight: 700;
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
  margin-top: 10px; /* 添加上边距 */
}

.button-link:hover {
  background-color: #40a9ff;
}
</style>
