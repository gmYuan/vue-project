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

  var Observer = /*#__PURE__*/function () {
    function Observer(value) {
      _classCallCheck(this, Observer);
      // 使用defineProperty 重新定义属性

      // 判断一个对象是否被观测过看他有没有 __ob__这个属性
      defineProperty(value, "__ob__", this);
      if (Array.isArray(value)) {
        // 函数劫持/ 切片编程
        value.__proto__ = arrayMethods;
        // 观测数组中的对象类型，对象变化也要做一些事
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
    vm._data = data = typeof data == "function" ? data.call(vm) : data;

    // 当我去vm上取属性时 ，帮我将属性的取值代理到vm._data上
    for (var key in data) {
      proxy(vm, '_data', key);
    }
    observe(data);
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
          console.log("处理完开始标签的html--", html);
          continue;
        }
        // 尝试匹配 是否是结束标签
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]); // 将结束标签传入
          console.log("处理完结束标签的html--", html);
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
        console.log("处理完文本类型的html--", html);
      }
      // break;
    }

    console.log('最后生成的AST树--', root);
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
        console.log('match--', match);
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
      console.log('tokens--', tokens);
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
    console.log('generateCode--', code);

    // 4.将字符串变成函数 限制取值范围 通过with来进行取值 
    // 稍后调用render函数就可以通过改变this 让这个函数内部取到结果了
    var render = new Function("with(this){return ".concat(code, "}"));
    console.log('render--', render);
    return render;
  }

  function patch(oldVnode, vnode) {
    // 第1次渲染：oldVnode: id#app; vnode: 生成的虚拟dom

    // 将虚拟节点转化成真实节点
    var el = createElm(vnode); // 产生真实的dom
    var parentElm = oldVnode.parentNode; // 获取老的app的父亲 => body
    parentElm.insertBefore(el, oldVnode.nextSibling); // 当前的真实元素插入到app的后面
    parentElm.removeChild(oldVnode); // 删除老的节点
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
      patch(vm.$el, vnode);
    };
  }
  function mountComponent(vm, el) {
    callHook(vm, 'beforeMount');

    // 先调用render方法创建虚拟节点，再将虚拟节点渲染到页面上
    vm._update(vm._render());
    callHook(vm, 'mounted');
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
      console.log('vdom/vnode结构是--', vnode);
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

  // 静态方法 Vue.component、Vue.directive、Vue.extend、Vue.mixin ...
  initGlobalApi(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
