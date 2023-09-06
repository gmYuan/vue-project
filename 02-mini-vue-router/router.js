import Vue from "vue";
import Router from "./vue-router"; // Router是一个插件
import Home from "./views/Home";
import About from "./views/About";
// 使用这个插件，内部会提供2个全局组件 router-link 和 router-view  
// 并且还会提供 2个原型上的属性 vm.$router 和 vm.$route
Vue.use(Router); 


// 路由导出后 需要被注册到实例中
let router = new Router({
  mode: "hash",
  routes: [
    {
      path: "/",
      component: Home,
    },
    {
      path: "/about",
      component: About,
      children: [
        {
          path: "a", // 这里有/ 就是根路径了，不是子路径
          component: {
            render: (h) => <h1>about A</h1>,
          },
        },
        {
          path: "b",
          component: {
            render: (h) => <h1>about B</h1>,
          },
        },
      ],
    },
  ],
});


// 当导航变化时 会依次执行这两个方法
router.beforeEach((to,from,next) => {
  console.log(1);
  setTimeout(() => {
    next();
  }, 1000);
});
router.beforeEach((to,from,next) => {
  console.log(2);
  setTimeout(() => {
    next();
  }, 1000);
});

export default router;
