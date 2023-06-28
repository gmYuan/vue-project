import { patch } from "./vdom/patch";
import Watcher from "./observer/watcher";

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this;
    // debugger

    // 用新的创建的元素 替换老的vm.$el
    vm.$el = patch(vm.$el, vnode);
  };
}

export function mountComponent(vm, el) {
  callHook(vm, "beforeMount");

  // 先调用render方法创建虚拟节点，再将虚拟节点渲染到页面上
  let updateComponent = () => {
    vm._update(vm._render());
  };

  // 初始化就会创建 渲染watcher==> 要把属性 和 watcher 绑定在一起
  let watcher = new Watcher(vm, updateComponent,
    () => {
      callHook(vm, "beforeUpdate");
    },
    true
  ); 

  callHook(vm, "mounted");
}

export function callHook(vm, hook) {
  // vm.$options.created  = [a1,a2,a3]
  const handlers = vm.$options[hook];
  if (handlers) {
    for (let i = 0; i < handlers.length; i++) {
      handlers[i].call(vm); // 更改生命周期中的this
    }
  }
}
