export function renderMixin(Vue) {
	Vue.prototype._render = function () {
    const vm = this;
    const render = vm.$options.render;
    let vnode = render.call(vm);
    console.log('render函数是--', render);
    console.log('render函数生成的vdom是--', vnode);
    return vnode;
  }; 

  // 用对象来描述dom的解构
  Vue.prototype._c = function () {
    // 创建虚拟dom元素
    return createElement(...arguments);
  };
  Vue.prototype._v = function (text) {
    // 创建虚拟dom文本元素
    return createTextVnode(text);
  };
  Vue.prototype._s = function (val) {
    // stringify
    return val == null
      ? ""
      : typeof val == "object"
      ? JSON.stringify(val)
      : val;
  };
}

// _c('div',{},_v(),_c())
function createElement(tag, data = {}, ...children) {
  return vnode(tag, data, data.key, children);
}
function createTextVnode(text) {
  return vnode(undefined, undefined, undefined, undefined, text);
}
// 用来产生虚拟dom的
function vnode(tag, data, key, children, text) {
  return {
    tag,
    data,
    key,
    children,
    text,
  };
}
