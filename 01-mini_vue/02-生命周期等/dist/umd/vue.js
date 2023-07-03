(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _iterableToArrayLimit(arr, i) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
      var _s,
        _e,
        _x,
        _r,
        _arr = [],
        _n = !0,
        _d = !1;
      try {
        if (_x = (_i = _i.call(arr)).next, 0 === i) {
          if (Object(_i) !== _i) return;
          _n = !1;
        } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
      } catch (err) {
        _d = !0, _e = err;
      } finally {
        try {
          if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
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
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  // 拿到数组原型上的方法 （原来的方法）
  var oldArrayProtoMethods = Array.prototype;

  // 继承一下ES5的方法
  var arrayMethods = Object.create(oldArrayProtoMethods);
  var methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      // 当调用数组我们劫持后的这7个方法，页面应该更新：要知道数组对应哪个dep
      // this就是observer里的value
      var result = oldArrayProtoMethods[method].apply(this, args);
      var inserted;
      var ob = this.__ob__;
      // debugger

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

      // debugger
      // 注意点4：对通过数组方法新增的值，也需要进行观测每一项内容
      if (inserted) ob.observeArray(inserted);
      ob.dep.notify(); // 通知数组更新
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

  var LIFECYCLE_HOOKS = ["beforeCreate", "created", "beforeMount", "mounted", "beforeUpdate", "updated", "beforeDestroy", "destroyed"];
  var strats = {};
  strats.data = function (parentVal, childValue) {
    return childValue; // 这里应该有合并data的策略
  };
  // strats.computed = function() {}
  // strats.watch = function() {}
  LIFECYCLE_HOOKS.forEach(function (hook) {
    strats[hook] = mergeHook;
  });
  function mergeHook(parentVal, childValue) {
    // 生命周期的合并
    if (childValue) {
      if (parentVal) {
        return parentVal.concat(childValue); // 爸爸和儿子进行拼接
      } else {
        return [childValue]; //儿子需要转化成数组
      }
    } else {
      return parentVal; // 不合并了 采用父亲的
    }
  }

  // 合并父子对象
  function mergeOptions(parent, child) {
    var options = {};
    for (var key in parent) {
      // 父亲和儿子都有的key, 在这就处理了
      mergeField(key);
    }

    // 父亲没有儿子有的属性 在这处理
    for (var _key in child) {
      // 将儿子多的赋予到父亲上
      if (!parent.hasOwnProperty(_key)) {
        mergeField(_key);
      }
    }
    function mergeField(key) {
      // 合并字段
      // 根据key 不同的策略来进行合并
      if (strats[key]) {
        options[key] = strats[key](parent[key], child[key]);
      } else {
        // todo默认合并
        options[key] = child[key];
      }
    }
    return options;
  }

  // nextTick相关
  var callbacks = [];
  var pending$1 = false;
  function flushCallbacks() {
    while (callbacks.length) {
      var cb = callbacks.shift();
      cb();
    } // 让nextTick中传入的方法依次执行
    pending$1 = false; // 标识已经执行完毕
  }

  // debugger
  var timerFunc;
  if (Promise) {
    timerFunc = function timerFunc() {
      Promise.resolve().then(flushCallbacks); // 异步处理更新
    };
  } else if (MutationObserver) {
    // 可以监控dom变化,监控完毕后是异步更新
    var observe$1 = new MutationObserver(flushCallbacks);
    var textNode = document.createTextNode(1); // 先创建一个文本节点
    observe$1.observe(textNode, {
      characterData: true
    }); // 观测文本节点中的内容
    timerFunc = function timerFunc() {
      textNode.textContent = 2; // 文中的内容改成2
    };
  } else if (setImmediate) {
    timerFunc = function timerFunc() {
      setImmediate(flushCallbacks);
    };
  } else {
    timerFunc = function timerFunc() {
      setTimeout(flushCallbacks);
    };
  }
  function nextTick(cb) {
    // 因为内部会调用nextTick 用户也会调用，但是异步只需要一次
    callbacks.push(cb);
    if (!pending$1) {
      // vue3 里的nextTick原理就是promise.then 没有做兼容性处理了
      timerFunc(); // 这个方法是异步方法 做了兼容处理了
      pending$1 = true;
    }
  }

  var id$1 = 0;

  // dep和watcher是多对多的关系 1个属性就有一个dep，用来收集watcher
  // 1个dep 可以存多个watcher
  // 1个watcher可以对应 多个dep
  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);
      this.subs = [];
      this.id = id$1++;
    }
    // 实现watcher和dep的双向存储记忆
    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        Dep.target.addDep(this);
        // this.subs.push(Dep.target);
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);
    return Dep;
  }();
  Dep.target = null; // 静态属性
  function pushTarget(watcher) {
    Dep.target = watcher; // 保留watcher
  }

  function popTarget() {
    Dep.target = null; // 将变量删除掉
  }

  var Observer = /*#__PURE__*/function () {
    // 使用defineProperty 重新定义属性
    function Observer(value) {
      _classCallCheck(this, Observer);
      // debugger
      this.dep = new Dep(); // value = {}  value = []

      // 判断一个对象是否被观测过看他有没有 __ob__这个属性
      defineProperty(value, "__ob__", this);
      if (Array.isArray(value)) {
        // 函数劫持/ 切片编程
        value.__proto__ = arrayMethods;
        // 观测数组中的对象类型，对象变化也要做一些事，注意普通类型是不做观测的
        this.observeArray(value);
      } else {
        this.walk(value);
      }
    }
    _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(value) {
        value.forEach(function (item) {
          // 注意点2: 观测数组中的对象类型
          observe(item);
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
    // debugger
    //注意点1: 嵌套对象的深层监测/ 获取到数组对应的dep
    var childDep = observe(value);
    var dep = new Dep(); // 每个属性都有一个dep
    //当页面取值时 说明这个值用来渲染了==> 将这个watcher和这个属性对应起来
    Object.defineProperty(data, key, {
      get: function get() {
        console.log("\u8BFB\u53D6\u4E86: ".concat(data).concat(key));
        // debugger;
        if (Dep.target) {
          dep.depend(); // 让这个属性记住这个watcher
          if (childDep) {
            // 可能是数组可能是对象
            // 默认给数组增加了一个dep属性，当对数组这个对象取值的时候
            childDep.dep.depend(); // 数组存起来了这个渲染watcher
          }
        }

        return value;
      },
      set: function set(newValue) {
        if (newValue === value) return;
        console.log("\u51C6\u5907\u8BBE\u7F6E\u65B0\u503C\u4E86: ".concat(data).concat(key));
        // debugger
        //注意点3: 如果用户将值改为对象, 需要继续监控
        observe(newValue);
        value = newValue;
        // debugger;
        dep.notify(); // 更新操作
      }
    });
  }

  function observe(data) {
    if (_typeof(data) !== "object" || data == null) {
      return;
    }
    if (data.__ob__) {
      return data;
    }
    return new Observer(data);
  }

  var id = 0;
  // 在数据劫持的时候 定义defineProperty的时候 已经给每个属性都增加了一个dep
  // 1.是想把这个渲染watcher 放到了Dep.target属性上
  // 2.开始渲染 取值会调用get方法,需要让这个属性的dep 存储当前的watcher
  // 3.页面上所需要的属性都会将这个watcher存在自己的dep中
  // 4.等会属性更新了 就重新调用渲染逻辑 通知自己存储的watcher来更新
  var Watcher = /*#__PURE__*/function () {
    // vm: 实例  exprOrFn: vm._update(vm._render())
    function Watcher(vm, exprOrFn, cb, options) {
      _classCallCheck(this, Watcher);
      this.vm = vm;
      this.exprOrFn = exprOrFn;
      this.cb = cb;
      this.options = options;
      this.user = options.user; // 这是一个用户watcher

      this.id = id++; // watcher的唯一标识
      this.deps = []; // watcher记录有多少dep依赖他
      this.depsId = new Set();
      debugger;
      // 设置this.getter引用
      if (typeof exprOrFn == "function") {
        this.getter = exprOrFn;
      } else {
        this.getter = function () {
          // exprOrFn 可能传递过来的是一个字符串a
          // 当去当前实例上取值时 才会触发依赖收集
          var path = exprOrFn.split("."); // ['a','a','a']
          var obj = vm;
          for (var i = 0; i < path.length; i++) {
            obj = obj[path[i]]; // vm.a --> vm.a.a
          }

          return obj;
        };
      }
      this.get(); // 默认会调用1次get方法，用于进行初次和渲染
    }
    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        // Dep.target = watcher
        pushTarget(this); // 当前watcher实例
        // 调用exprOrFn==> render方法()==> 取值（执行了get方法）
        var result = this.getter();
        popTarget(); //渲染完成后 将watcher删掉了
        return result;
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        // debugger
        var id = dep.id;
        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this);
        }
        // debugger
      }
    }, {
      key: "update",
      value: function update() {
        // 这里不要每次都调用get方法 get方法会重新渲染页面
        queueWatcher(this); // 引入暂存的概念

        // --------------- old -------------------------
        // this.get(); // 重新渲染
        // debugger
        // console.log('触发了重渲染--')
      }
    }, {
      key: "run",
      value: function run() {
        var newValue = this.get(); // 渲染逻辑
        var oldValue = this.value;
        this.value = newValue; // 更新一下老值
        if (this.user) {
          this.cb.call(this.vm, newValue, oldValue);
        }
      }
    }]);
    return Watcher;
  }(); // 将需要批量更新的watcher 存到一个队列中，稍后让watcher执行
  var queue = [];
  var has = {};
  var pending = false;
  function flushSchedulerQueue() {
    queue.forEach(function (watcher) {
      // debugger
      watcher.run();
      if (!watcher.user) {
        watcher.cb();
      }
    });
    queue = [];
    has = {};
    pending = false;
  }
  function queueWatcher(watcher) {
    var id = watcher.id; // 对watcher进行去重
    // debugger;
    if (has[id] == null) {
      queue.push(watcher); // 将watcher存到队列中
      has[id] = true;
      // 等待所有同步代码执行完毕后在执行
      if (!pending) {
        // 如果还没清空队列，就不要在开定时器了  防抖处理
        // setTimeout(flushSchedulerQueue);
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
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
    if (opts.watch) {
      initWatch(vm);
    }
  }
  function initData(vm) {
    // 数据的初始化操作
    var data = vm.$options.data;
    vm._data = data = typeof data == "function" ? data.call(vm) : data;

    // 当我去vm上取属性时 ，帮我将属性的取值代理到vm._data上
    for (var key in data) {
      proxy(vm, "_data", key);
    }
    observe(data);
  }
  function initWatch(vm) {
    debugger;
    var watch = vm.$options.watch;
    var _loop = function _loop(key) {
      var handler = watch[key]; // handler可能是
      if (Array.isArray(handler)) {
        // 数组
        handler.forEach(function (handle) {
          createWatcher(vm, key, handle);
        });
      } else {
        // 字符串\对象\函数
        createWatcher(vm, key, handler);
      }
    };
    for (var key in watch) {
      _loop(key);
    }
  }
  function createWatcher(vm, exprOrFn, handler, options) {
    // options 可以用来标识 是用户watcher
    if (_typeof(handler) == "object") {
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
  function stateMixin(Vue) {
    Vue.prototype.$nextTick = function (cb) {
      nextTick(cb);
    };
    Vue.prototype.$watch = function (exprOrFn, cb) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      // 数据应该依赖这个watcher  数据变化后应该让watcher从新执行
      new Watcher(this, exprOrFn, cb, _objectSpread2(_objectSpread2({}, options), {}, {
        user: true
      }));
      if (options.immediate) {
        cb(); // 如果是immdiate应该立刻执行
      }
    };
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // 标签名
  // ?:匹配不捕获
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // </my:xx>
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则 捕获的内容是标签名
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾的 </div>
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的    aaa="aaa"  a='aaa'   a=aaa
  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >    >   <div></div>  <br/>

  // 数据结构 树、栈、链表、队列、
  var html = "";
  var root;
  var currentParent;
  var stack = [];

  // 解析html字符串
  function parseHTML(htmlContent) {
    html = htmlContent;

    // 只要html不为空字符串就一直解析
    while (html) {
      var text = void 0;
      // 尝试获取 "<" 字符
      var textEnd = html.indexOf("<");
      // 如果当前内容以"<" 字符开头，说明它肯定是一个标签（开始/结束标签）
      if (textEnd == 0) {
        // 尝试匹配 是否是开始标签
        var startTagMatch = parseStartTag();
        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          // console.log("处理完开始标签的html--", html);
          continue;
        }
        // 尝试匹配 是否是结束标签
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]); // 将结束标签传入
          // console.log("处理完结束标签的html--", html);
          continue;
        }
      }
      // 简化的情况下，说明此时的字符内容是 文本类型
      if (textEnd > 0) {
        text = html.substring(0, textEnd);
      }
      if (text) {
        // 处理文本
        advance(text.length);
        chars(text);
        // console.log("处理完文本类型的html--", html);
      }
      // break;
    }

    // console.log('最后生成的AST树--', root)
    return root;
  }

  // 解析开始标签
  function parseStartTag() {
    var start = html.match(startTagOpen);
    // 如果start命中，说明是开始标签
    if (start) {
      // console.log('start', start)
      var match = {
        tagName: start[1],
        attrs: []
      };
      // 获取到 "<div" 里的div后，就删除开始标签("<div")
      advance(start[0].length);
      // console.log('html--', html)

      // 如果直接是闭合标签了 说明没有属性
      var _end, attr;
      // 不是结尾标签 && 能匹配到属性
      while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        // attrs的value,可能分别是正则匹配组的第3/4/5个索引值
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5]
        });
        // 处理/缓存下了开始标签里的属性后，就去掉当前属性对应的 字符内容
        advance(attr[0].length);
      }
      // 如果匹配到开始标签的结束字符，就删除它 ">" + 返回开始标签的缓存对象
      if (_end) {
        // console.log('end--', end)
        advance(_end[0].length);
        return match;
      }
    }
  }

  // 将字符串进行截取操作 在更新html内容
  function advance(n) {
    html = html.substring(n);
  }

  // 创建AST单个节点
  function createASTElement(tagName, attrs) {
    return {
      tag: tagName,
      // 标签名
      type: 1,
      // 元素类型
      children: [],
      // 孩子列表
      attrs: attrs,
      // 属性集合
      parent: null // 父元素
    };
  }

  function start(tagName, attrs) {
    // 创建一个AST元素节点 + 如果没有根元素，就把它作为根元素
    var element = createASTElement(tagName, attrs);
    if (!root) {
      root = element;
    }
    // 当前解析的标签 保存起来，用于之后构建树形关系
    currentParent = element;
    // 将生成的单个ast元素节点放到栈中
    stack.push(element);
  }
  // 创建文本类型的AST节点 + 作为子节点放入到父节点中
  function chars(text) {
    text = text.trim();
    if (text) {
      currentParent.children.push({
        type: 3,
        text: text
      });
    }
  }

  // <div> <p></p> hello</div>    currentParent=p
  // 处理结束标签的情况： 创建父子关系
  function end(tagName) {
    // 在结尾标签处 创建父子关系
    var element = stack.pop(); // 取出栈中的最后一个AST元素节点
    currentParent = stack[stack.length - 1];
    if (currentParent) {
      // 在闭合时可以知道这个标签的父亲是谁
      element.parent = currentParent;
      currentParent.children.push(element);
    }
  }

  // 编写 <div id="app" style="color:red"> hello {{name}} <span>hello</span></div>

  // 结果:render(){
  //    return _c('div',{id:'app',style:{color:'red'}},_v('hello'+_s(name)),_c('span',null,_v('hello')))
  //}
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
  function generate(el) {
    var children = genChildren(el); // 儿子的生成
    var code = "_c('".concat(el.tag, "',").concat(el.attrs.length ? "".concat(genProps(el.attrs)) : "undefined").concat(children ? ",".concat(children) : "", ")");
    return code;
  }

  //  语法层面的转义
  function genProps(attrs) {
    // [{name: id, value: "app"}, {name: style, value: "fontSize:12px;color:red"} ]
    var str = "";
    var _loop = function _loop() {
      var attr = attrs[i];
      // 对样式进行特殊的处理
      if (attr.name === "style") {
        var obj = {};
        attr.value.split(";").forEach(function (item) {
          var _item$split = item.split(":"),
            _item$split2 = _slicedToArray(_item$split, 2),
            key = _item$split2[0],
            value = _item$split2[1];
          obj[key] = value;
        });
        attr.value = obj;
      }
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    };
    for (var i = 0; i < attrs.length; i++) {
      _loop();
    }
    // 去除最后一个多余的“,” 逗号字符串
    return "{".concat(str.slice(0, -1), "}");
  }
  function genChildren(el) {
    var children = el.children;
    if (children) {
      // 将所有转化后的儿子，用逗号拼接起来
      return children.map(function (child) {
        return gen(child);
      }).join(",");
    }
  }
  function gen(node) {
    if (node.type == 1) {
      // 递归调用generate，从而生成元素节点的 字符串
      return generate(node);
    } else {
      var text = node.text; // 获取文本
      // 如果是普通文本，即不带{{}}
      // _v('hello {{ name }} world {{msg}} aa')   => _v('hello'+_s(name) +'world' + _s(msg))
      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      }

      // 处理带有变量的文本内容
      var tokens = []; // 存放每一段的代码
      var lastIndex = defaultTagRE.lastIndex = 0; // 如果正则是全局模式 需要每次使用前置为0
      var match, index; // 每次匹配到的结果
      while (match = defaultTagRE.exec(text)) {
        // console.log('match--', match)
        index = match.index; // 保存匹配到的索引
        // 存入变量文本前的 普通文本内容
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }
        // 存入变量文本内容 + 更新lastIndex指向
        tokens.push("_s(".concat(match[1].trim(), ")"));
        lastIndex = index + match[0].length;
      }
      // 存入变量文本后的 普通文本内容
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }
      // console.log('tokens--', tokens)
      return "_v(".concat(tokens.join("+"), ")");
    }
  }

  //  <div id="app">hello {{name}} <span>world</span> <p></p></div>
  function compileToFunctions(template) {
    // html模板 => render函数  (ast是用来描述代码的)
    // 1.需要将html代码转化成"ast"语法树 可以用ast树来描述语言本身
    var ast = parseHTML(template);

    // 2.优化静态节点

    // 3.通过这课树 重新的生成代码
    var code = generate(ast);
    // console.log('generateCode--', code)

    // 4.将字符串变成函数 限制取值范围 通过with来进行取值 
    // 稍后调用render函数就可以通过改变this 让这个函数内部取到结果了
    var render = new Function("with(this){return ".concat(code, "}"));
    console.log('compileToFunctions里生成的render函数是--', render);
    console.log('------------------------------------------');
    return render;
  }

  function patch(oldVnode, vnode) {
    // 第1次渲染：oldVnode: id#app; vnode: 生成的虚拟dom

    // 将虚拟节点转化成真实节点
    var el = createElm(vnode); // 产生真实的dom
    var parentElm = oldVnode.parentNode; // 获取老的app的父亲 => body
    parentElm.insertBefore(el, oldVnode.nextSibling); // 当前的真实元素插入到app的后面
    parentElm.removeChild(oldVnode); // 删除老的节点
    console.log('el是---', el);
    console.log('------------------------------------');
    // debugger
    return el;
  }
  function createElm(vnode) {
    var tag = vnode.tag,
      children = vnode.children;
      vnode.key;
      vnode.data;
      var text = vnode.text;
    if (typeof tag == "string") {
      // 创建元素 放到vnode.el上
      vnode.el = document.createElement(tag);

      // 只有元素才有属性
      updateProperties(vnode);
      children.forEach(function (child) {
        // 遍历儿子 将儿子渲染后的结果扔到父亲中
        vnode.el.appendChild(createElm(child));
      });
    } else {
      // 创建文件 放到vnode.el上
      vnode.el = document.createTextNode(text);
    }
    return vnode.el;
  }

  // vue 的渲染流程
  //  先初始化数据==> 将模板进行编译==> render函数==>
  //  生成虚拟节点==> 生成真实的dom==> 渲染到页面上

  function updateProperties(vnode) {
    var el = vnode.el;
    var newProps = vnode.data || {};
    for (var key in newProps) {
      if (key == "style") {
        // {color:red}
        for (var styleName in newProps.style) {
          el.style[styleName] = newProps.style[styleName];
        }
      } else if (key == "class") {
        el.className = el["class"];
      } else {
        el.setAttribute(key, newProps[key]);
      }
    }
  }

  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      var vm = this;
      // debugger

      // 用新的创建的元素 替换老的vm.$el
      vm.$el = patch(vm.$el, vnode);
    };
  }
  function mountComponent(vm, el) {
    callHook(vm, "beforeMount");

    // 先调用render方法创建虚拟节点，再将虚拟节点渲染到页面上
    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    };

    // 初始化就会创建 渲染watcher==> 要把属性 和 watcher 绑定在一起
    new Watcher(vm, updateComponent, function () {
      callHook(vm, "updated");
    }, true);
    callHook(vm, "mounted");
  }
  function callHook(vm, hook) {
    // vm.$options.created  = [a1,a2,a3]
    var handlers = vm.$options[hook];
    if (handlers) {
      for (var i = 0; i < handlers.length; i++) {
        handlers[i].call(vm); // 更改生命周期中的this
      }
    }
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      // vm.$options = options;
      // 需要将用户自定义的options 和全局的options做合并
      vm.$options = mergeOptions(vm.constructor.options, options);
      callHook(vm, 'beforeCreate');

      // 初始化状态 （将数据做一个初始化的劫持 当我改变数据时应该更新视图）
      // vue组件中有很多状态 data props watch computed
      initState(vm);

      // 在处理完state之后，调用created钩子
      callHook(vm, 'created');

      // vue里面核心特性 响应式数据原理
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
      vm.$el = el;
      // debugger

      if (!options.render) {
        // 没render 将template转化成render方法
        var template = options.template;
        if (!template && el) {
          template = el.outerHTML;
        }
        // 编译原理 将模板编译成render函数
        // 渲染时用的都是这个render方法
        var render = compileToFunctions(template);
        options.render = render;
      }

      // 需要挂载这个组件
      mountComponent(vm);
    };
  }

  function renderMixin(Vue) {
    Vue.prototype._render = function () {
      var vm = this;
      var render = vm.$options.render;
      var vnode = render.call(vm);
      console.log('render函数是--', render);
      console.log('render函数生成的vdom是--', vnode);
      return vnode;
    };

    // 用对象来描述dom的解构
    Vue.prototype._c = function () {
      // 创建虚拟dom元素
      return createElement.apply(void 0, arguments);
    };
    Vue.prototype._v = function (text) {
      // 创建虚拟dom文本元素
      return createTextVnode(text);
    };
    Vue.prototype._s = function (val) {
      // stringify
      return val == null ? "" : _typeof(val) == "object" ? JSON.stringify(val) : val;
    };
  }

  // _c('div',{},_v(),_c())
  function createElement(tag) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }
    return vnode(tag, data, data.key, children);
  }
  function createTextVnode(text) {
    return vnode(undefined, undefined, undefined, undefined, text);
  }
  // 用来产生虚拟dom的
  function vnode(tag, data, key, children, text) {
    return {
      tag: tag,
      data: data,
      key: key,
      children: children,
      text: text
    };
  }

  function initGlobalApi(Vue) {
    Vue.options = {}; // Vue.components/ Vue.diretive
    Vue.mixin = function (mixin) {
      // 合并对象: 目前先考虑生命周期，不考虑其他的合并 data/ computed/ watch
      // 把 全局Vue.options和 Vue.mixin等进行合并
      this.options = mergeOptions(this.options, mixin);
    };
  }

  function Vue(options) {
    this._init(options); // 入口方法,做初始化操作
  }

  // 写成一个个的插件进行对原型的扩展
  initMixin(Vue); // init方法
  lifecycleMixin(Vue); // _update
  renderMixin(Vue); // _render
  stateMixin(Vue); // $nextTick()、$watch()等实现

  // 静态方法 Vue.component、Vue.directive、Vue.extend、Vue.mixin ...
  initGlobalApi(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
