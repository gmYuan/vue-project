import { observe } from "./observer/index";
import { proxy, nextTick } from "./util.js";

export function initState(vm) {
  // vm.$options
  const opts = vm.$options;
  if (opts.props) {
    initProps(vm);
  }
  if (opts.methods) {
    initMethods(vm);
  }
  if (opts.data) {
    initData(vm);
  }
  if (opts.computed) {
    initComputed(vm);
  }
  if (opts.watch) {
    initWatch(vm);
  }
}

function initData(vm) {
  // 数据的初始化操作
  let data = vm.$options.data;
  vm._data = data = typeof data == "function" ? data.call(vm) : data;

  // 当我去vm上取属性时 ，帮我将属性的取值代理到vm._data上
  for (let key in data) {
    proxy(vm, "_data", key);
  }

  observe(data);
}

function initProps() {}
function initMethods() {}

function initComputed() {}
function initWatch() {}

// stateMixin导出
export function stateMixin(Vue) {
  Vue.prototype.$nextTick = function (cb) {
    nextTick(cb);
  };
}
