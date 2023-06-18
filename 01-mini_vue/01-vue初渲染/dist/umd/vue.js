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
  function proxy(vm, data, key) {
    Object.defineProperty(vm, key, {
      // vm.a
      get: function get() {
        return vm[data][key]; // vm._data.a
      },
      set: function set(newValue) {
        // vm.a = 100;
        vm[data][key] = newValue; // vm._data.a = 100;
      }
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
    vm._data = data = typeof data == "function" ? data.call(vm) : data; // 当我去vm上取属性时 ，帮我将属性的取值代理到vm._data上

    for (var key in data) {
      proxy(vm, '_data', key);
    }

    observe(data);
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // 标签名
  // ?:匹配不捕获

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // </my:xx>

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则 捕获的内容是标签名

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的    aaa="aaa"  a='aaa'   a=aaa

  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >    >   <div></div>  <br/>
  // 数据结构 树、栈、链表、队列、

  var html = "";
  function parseHTML(htmlContent) {
    html = htmlContent; // 只要html不为空字符串就一直解析

    while (html) {
      // 尝试获取 "<" 字符
      var textEnd = html.indexOf("<"); // 如果当前内容以"<" 字符开头，说明它肯定是一个标签（开始/结束标签）

      if (textEnd == 0) {
        // 尝试匹配 是否是开始标签
        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          console.log('处理完开始标签的html--', html);
          start(startTagMatch.tagName, startTagMatch.attrs); // continue;
        }

        break;
      }
    }
  }

  function parseStartTag() {
    var start = html.match(startTagOpen); // 如果start命中，说明是开始标签

    if (start) {
      console.log('start', start);
      var match = {
        tagName: start[1],
        attrs: []
      }; // 获取到 "<div" 里的div后，就删除开始标签("<div")

      advance(start[0].length); // console.log('html--', html)
      // 如果直接是闭合标签了 说明没有属性

      var end, attr; // 不是结尾标签 && 能匹配到属性

      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        // attrs的value,可能分别是正则匹配组的第3/4/5个索引值
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5]
        }); // 处理/缓存下了开始标签里的属性后，就去掉当前属性对应的 字符内容

        advance(attr[0].length);
      } // 如果匹配到开始标签的结束字符，就删除它 ">" + 返回开始标签的缓存对象


      if (end) {
        // console.log('end--', end)
        advance(end[0].length);
        return match;
      }
    }
  } // 将字符串进行截取操作 在更新html内容


  function advance(n) {
    html = html.substring(n);
  } // 创建一个元素 作为根元素


  function start(tagName, attrs) {
    console.log('tagName--', tagName, attrs);
  }

  //  <div id="app">hello {{name}} <span>world</span> <p></p></div>
  function compileToFunctions(template) {
    // html模板 => render函数  (ast是用来描述代码的)
    // 1.需要将html代码转化成"ast"语法树 可以用ast树来描述语言本身
    var ast = parseHTML(template); // 2.优化静态节点
    // 3.通过这课树 重新的生成代码
    // let code = generate(ast);
    // 4.将字符串变成函数 限制取值范围 通过with来进行取值 稍后调用render函数就可以通过改变this 让这个函数内部取到结果了
    // let render = new Function(`with(this){return ${code}}`);
    // return render;
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
      // 如果当前有el属性说明要渲染模板

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      // 挂载操作
      var vm = this;
      var options = vm.$options;
      el = document.querySelector(el);

      if (!options.render) {
        // 没render 将template转化成render方法
        var template = options.template;

        if (!template && el) {
          template = el.outerHTML;
        } // 编译原理 将模板编译成render函数
        // 渲染时用的都是这个render方法


        var render = compileToFunctions(template);
        options.render = render;
      }
    };
  }

  function Vue(options) {
    this._init(options); // 入口方法,做初始化操作

  } // 写成一个个的插件进行对原型的扩展


  initMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
