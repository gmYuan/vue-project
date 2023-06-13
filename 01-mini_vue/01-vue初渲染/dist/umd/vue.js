(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  // 拿到数组原型上的方法 （原来的方法）
  var oldArrayProtoMethods = Array.prototype; // 继承一下ES5的方法

  var arrayMethods = Object.create(oldArrayProtoMethods);
  var methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // this就是observer里的value
      var result = oldArrayProtoMethods[method].apply(this, args);
      var inserted;
      var ob = this.__ob__;

      switch (method) {
        case "push": // arr.push({a:1},{b:2})

        case "unshift":
          //这两个方法都是追加 追加的内容可能是对象类型，应该被再次进行劫持
          inserted = args;
          break;

        case "splice":
          // vue.$set原理
          inserted = args.slice(2);
      }

      if (inserted) ob.observeArray(inserted); // 给数组新增的值也要进行观测

      return result;
    };
  });

  function defineProperty(target, key, value) {
    Object.defineProperty(target, key, {
      enumerable: false,
      // 不能被枚举，不能被循环出来
      configurable: false,
      value: value
    });
  }

  var Observer = /*#__PURE__*/function () {
    function Observer(value) {
      _classCallCheck(this, Observer);

      // 使用defineProperty 重新定义属性
      // 判断一个对象是否被观测过看他有没有 __ob__这个属性
      defineProperty(value, "__ob__", this);

      if (Array.isArray(value)) {
        // 函数劫持/ 切片编程
        value.__proto__ = arrayMethods; // 观测数组中的对象类型，对象变化也要做一些事

        this.observeArray(value);
      } else {
        this.walk(value);
      }
    }

    _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(value) {
        value.forEach(function (item) {
          observe(item); // 观测数组中的对象类型
        });
      }
    }, {
      key: "walk",
      value: function walk(data) {
        var keys = Object.keys(data); // 获取对象的key

        keys.forEach(function (key) {
          defineReactive(data, key, data[key]); // Vue.util.defineReactive
        });
      }
    }]);

    return Observer;
  }();

  function defineReactive(data, key, value) {
    //注意点1: 嵌套对象的深层监测
    observe(value);
    Object.defineProperty(data, key, {
      get: function get() {
        console.log("\u8BFB\u53D6\u4E86: ".concat(data).concat(key));
        return value;
      },
      set: function set(newValue) {
        if (newValue === value) return;
        console.log("\u51C6\u5907\u8BBE\u7F6E\u65B0\u503C\u4E86: ".concat(data).concat(key));
        observe(newValue); // 如果用户将值改为对象继续监控

        value = newValue;
      }
    });
  }

  function observe(data) {
    if (_typeof(data) !== "object" || data == null) {
      return data;
    }

    if (data.__ob__) {
      return data;
    }

    return new Observer(data);
  }

  function initState(vm) {
    // vm.$options
    var opts = vm.$options;

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      initData(vm);
    }

    if (opts.computed) ;

    if (opts.watch) ;
  }

  function initData(vm) {
    // 数据的初始化操作
    var data = vm.$options.data;
    vm._data = data = typeof data == "function" ? data.call(vm) : data; // 数据的劫持方案 对象Object.defineProperty
    // 数组 单独处理的

    observe(data);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options; // 初始化状态 （将数据做一个初始化的劫持 当我改变数据时应该更新视图）
      // vue组件中有很多状态 data props watch computed

      initState(vm); // vue里面核心特性 响应式数据原理
      // Vue 是一个什么样的框架 MVVM
      // 数据变化视图会更新，视图变化数据会被影响 
      // （MVVM）不能跳过数据去更新视图，$ref
    };
  }

  function Vue(options) {
    this._init(options); // 入口方法,做初始化操作

  } // 写成一个个的插件进行对原型的扩展


  initMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
