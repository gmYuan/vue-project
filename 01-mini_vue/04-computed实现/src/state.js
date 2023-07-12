import { observe } from "./observer/index";
import { proxy, nextTick } from "./util.js";
import Watcher from "./observer/watcher";

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

function initComputed(vm) {
  debugger
  let computed = vm.$options.computed;
  // 1.需要有watcher  2.还需要通过defineProperty 3.dirty

  // 用来稍后存放计算属性的watcher
  // const watchers = (vm._computedWatchers = {});

  for (let key in computed) {
    const userDef = computed[key]; // 取出对应的值来
    // 获取get方法
    // const getter = typeof userDef == "function" ? userDef : userDef.get; // watcher使用的

    defineComputed(vm, key, userDef); // defineReactive();
  }
}

const sharedPropertyDefinition = {};
function defineComputed(target, key, userDef) {
  // 这样写是没有缓存的，需要加缓存
  if (typeof userDef == "function") {
    sharedPropertyDefinition.get = userDef
  } else {
    sharedPropertyDefinition.get = userDef.get;
    sharedPropertyDefinition.set = userDef.set;
  }
  Object.defineProperty(target, key, sharedPropertyDefinition);
}



function initWatch(vm) {
  // debugger
  let watch = vm.$options.watch;
  for (let key in watch) {
    const handler = watch[key]; // handler可能是
    if (Array.isArray(handler)) {
      // 数组
      handler.forEach((handle) => {
        createWatcher(vm, key, handle);
      });
    } else {
      // 字符串\对象\函数
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher(vm, exprOrFn, handler, options) {
  // options 可以用来标识 是用户watcher
  if (typeof handler == "object") {
    options = handler;
    handler = handler.handler; // 是一个函数
  }
  if (typeof handler == "string") {
    handler = vm[handler]; // 将实例的方法作为handler
  }
  // key + handler: 用户传入的选项
  return vm.$watch(exprOrFn, handler, options);
}

// stateMixin导出
export function stateMixin(Vue) {
  Vue.prototype.$nextTick = function (cb) {
    nextTick(cb);
  };

  Vue.prototype.$watch = function (exprOrFn, cb, options = {}) {
    // 数据应该依赖这个watcher  数据变化后应该让watcher从新执行
    let watcher = new Watcher(this, exprOrFn, cb, { ...options, user: true });
    if (options.immediate) {
      cb(); // 如果是immdiate应该立刻执行
    }
  };
}
