import { defineStore } from "pinia";
// 存储用户信息
export const useUserStore = defineStore("user", {
  state: () => ({
    username: "",
    nickname: "",
    loginTime: "",
    id: "",
    role: "",
  }),
  getters: {
    getUser() {
      if (!this.username) {
        let user = JSON.parse(sessionStorage.getItem("user"));
        this.username = user.username;
        this.nickname = user.nickname;
        this.loginTime = user.loginTime;
        this.id = user.id;
        this.role = user.role;
      }
      return {
        username: this.username,
        nickname: this.nickname,
        loginTime: this.loginTime,
        id: this.id,
        role: this.role,
      };
    },
  },
  actions: {
    setUser(data) {
      this.username = data.username;
      this.nickname = data.nickname;
      this.loginTime = data.loginTime;
      this.id = data.id;
      this.role = data.role;

      sessionStorage.setItem(
        "user",
        JSON.stringify({
          username: data.username,
          nickname: data.nickname,
          loginTime: data.loginTime,
          id: data.id,
          role: data.role,
        })
      );
    },
    delUser() {
      sessionStorage.removeItem("user");
      this.username = "";
      this.nickname = "";
      this.loginTime = "";
      this.id = "";
      this.role = "";
    },
  },
});

// 存储 token
export const useTokenStore = defineStore("token", {
  state: () => ({
    token: "",
  }),
  getters: {
    getToken() {
      if (!this.token) {
        this.token = sessionStorage.getItem("token");
      }
      return this.token;
    },
  },
  actions: {
    setToken(data) {
      this.token = data;
      sessionStorage.setItem("token", data);
    },
    delToken() {
      sessionStorage.removeItem("token");
      this.token = "";
    },
  },
});
