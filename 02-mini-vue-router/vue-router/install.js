export let _Vue;
import Link from "./components/link";
import View from "./components/view";

export default function install(Vue, options) {
  // 缓存 Vue构造函数, 这样别的文件都可以使用Vue变量 + 用于判断是否已注册过Vue-Router
  _Vue = Vue; 

  Vue.mixin({
    // 把根组件实例rootVm 共享给所有子组件 + 定义rootVm各个属性
    beforeCreate() {
      // 说明是根组件实例 rootVm
      if (this.$options.router) {
        // 定义 rootVm._routerRoot = rootVm
        this._routerRoot = this;
        // 定义 rootVm._router = $options.router
        this._router = this.$options.router;

        // 调用 rootRouter.init(rootVm)
        this._router.init(this)

        // 定义响应式属性 rootVm._route: 
        // 当rootVm._router.history.current值变化后，会自动更新_route值
        Vue.util.defineReactive(this, "_route", this._router.history.current);

      } else {
         // 子组件: 通过 vm.$parent._routerRoot 获取共同的 rootVm实例
        this._routerRoot = this.$parent && this.$parent._routerRoot;
      }
    },
  });


  // 插件一般用于定义全局组件/ 全局指令/ 过滤器/ 原型方法....
  Vue.component("router-link", Link);
  Vue.component("router-view", View);

  // 包含路由中所有属性 path/matched/...
  Object.defineProperty(Vue.prototype, "$route", {
    get() {
      return this._routerRoot._route; //
    },
  });

  // 包含路由中所有方法 push/go/...
  Object.defineProperty(Vue.prototype, "$router", {
    get() {
      return this._routerRoot._router; 
    },
  });
}
