import Vue from "vue";
import router from "./router";
import App from "./App.vue";
// 没有提供的文件 会采用vue-cli中自带的默认文件

const vm = new Vue({
  el: "#app",
  name: "root",
  router, // 注入router的实例
  render: (h) => {
    // _c => createElement
    return h(App);
  },
});
