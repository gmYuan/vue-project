## 1 Vue的初始化流程

1 new Vue(options)==> initMixin(Vue): 写成插件形式 来对原型进行扩展
  2 vm._init(options)==> MVVM
    3 initState(vm)
      4 initData(vm)
        5 observe(data)

## 2 实现响应式原理

1 observe(data)
  2 new Observer(data)
    3.1 defineValue__ob__ 
    3.2 处理数组类型：原型代理 + ob.observeArray(value)
    3.3 处理对象类型：ob.walk(data)==> 
      4 defineReactive(data, key, value)

注意点：<br/>
S1 嵌套对象的深层监测：
    - defineReactive里 递归调用observe(value)
    - 所以多层次的对象嵌套，会造成多层递归从而影响性能
> 即情况1: 对象嵌套

S2 对象设置的新值也有可能是对象：
  - Object.defineProperty的setter里，对新值也要进行监听 observe(newValue)

S3.1 处理数组类型：数组原型代理
> 即情况2: 对象里包含数组类型

S3.2 数组内部里，有成员类型是对象，也要对它进行劫持：
  - ob.observeArray(value)==> 遍历递归调用 observe(item)
> 即情况3: 数组里包含对象

S4 数组新增的值可能还是一个 对象/数组类型，所以也需要对其进行劫持：
  - ob.observeArray(inserted)
  - 因为要让数组类型值内部能调用到ob.observeArray方法，所以要在观测值value上定义 value.__ob__ = ob属性，从而让value也能访问到对应的ob对象
> 即情况4: 数组里的push等新增成员包含对象


S5 为了便于使用，Vue内部通过代理模式，在vm.dataKey时，实际访问的是vm._data.dataKey


## 3.1 Vue的渲染流程1==> template转化为render

1 vm.$mount(vm.$options.el)
  2 compileToFunctions(template)
    3-1 parseHTML(template) ==> 尝试匹配 标签的开始字符"<"
      3.1 首位置 匹配成功==> 说明当前 必然是开始/结束 标签
        4.1 startTagMatch = parseStartTag()
          5 设置并返回 mathchObj + advance(length)
        
        4.2 如果存在startTagMatch==> start(mathc.tagName, match.attrs)

        4.3 类似开始标签，尝试判断当前标签是 结束标签，如果存在endTagMatch==> end(tagName)
          
      3.2 首位置匹配失败==> 简化它必然是文本内容：chars(text);
    
    3-2 code = generate(ast)
      - 通过ast树状节点关系，利用字符串拼接 拼接出 _c('div',{id:'app'}, _v('hello'+_s(name))）

    3-3 render = new Function(`with(this){return ${code}}`)
      - 通过 new Function + wit，从而构造出 render函数 + 内部变量值指向的是传入的this作用域

S1 vm.$mount(el): 在Vue初始化过程中，会通过render函数==> 生成虚拟DOM
  - 1 默认会先找render方法;
  - 2 如果没有传入render方法，会去查找template==> render
  - 3 如果还没有，就找当前el指定的元素中的内容==> 赋值给template
  - 调用 options.render = compileToFunctions(template)==> 通过template，生成render函数

S2 compileToFunctions(template)
  - 把html字符串转化成 AST语法树==> ast = parseHTML(template)

S3 parseHTML(template): 尝试匹配 标签的开始字符"<"
  - S3.1 首位置 匹配成功==> 说明当前 必然是开始/结束 标签==>
      - 尝试匹配和处理开始标签字符 startTagMatch = parseStartTag();
      - 获取到startTagMatch后，如果存在结果==> S4.2 start(tagName, attrs)

  - S3.2 首位置 匹配失败==> 说明必然不是标签，忽略注释文本等情况下，简化它必然是文本内容==> 处理文本类型chars(text)
    - 创建文本类型的AST节点 + 作为子节点放入到父节点中

S4.1 parseStartTag()
  - 尝试匹配开始标签的 开始字符和标签名称
  - S5 匹配成功，说明是开始标签：
    - 处理开始标签的 开始字符和标签名称，记做a==> 存入match.tagName + 删除a
    - 只要没匹配到 开始标签的结束标签 + 存在属性b==> 存入match.attrs + 删除b
    - 匹配到 开始标签的结束标签c==> 删除c + 返回match对象

  - 匹配失败：说明不是开始标签：不处理默认返回undifined

S4.2 start(mathc.tagName, match.attrs)
  - 创建一个AST元素节点 + 如果没有根元素，就把它作为根元素
  - 把创建的AST元素节点 放入栈内

S4.3 end(tagName)
  - 创建 AST结构的父子关系：element.parent + currentParent.children


## 3.2 Vue的渲染流程2==> render生成vdom，再由vdom生成真实DOM

1 整个Vue的index.js入口文件==> 
  - 定义Vue函数
  - 执行了各种Mixin插件，用于拓展Vue的原型对象
    - initMixin: 定义了 Vue.prototype._init/Vue.prototype.$mount 等方法
    - lifecycleMixin: 定义了Vue.prototype._update/ mountComponent 等方法
    - renderMixin: 定义了Vue.prototype._c/Vue.prototype._render 等方法

2 new Vue(options)==>
  2.1 vm._init(): 定义于initMixin里==> 
    3.1 initState(vm): 初始化props/data/methods等属性
    3.2 vm.$mount(el): 实现 渲染和挂载流程
      4.1 template==> render = compileToFunctions(template)
      4.2 mountComponent(vm, el): render==>vdom==> 真实dom

3 mountComponent(vm, el)
  3-1 vdom = vm._render()
    4-1 调用了vm.$options.render.call(vm)，从而返回vnode
      - vm._c/vm._v/: 内部都是通过调用vnode，生成了虚拟节点
  3-2 vm._update(vdom)
    4-1 patch(vm.$el, vnode): vm.$el指向了el、
      5-1 createElm(vnode): 通过vdom，生成真实dom
        6 createElm生成div/文本等真实dom + 子节点递归调用createElm

      5-2 获取旧的真实dom节点的 父dom + 插入新的真实dom + 删除旧的真实dom


## 4 Vue.mixin(Vue.options)合并 + 生命周期钩子实现

1 initGlobalApi(Vue): Vue除了原型方法，还定义了很多 静态方法
  2 定义Vue.mixin(mixin): 调用 mergeOptions(this.options, mixin):
    - 把全局Vue.options和 Vue.mixin等进行合并

2 mergeOptions(parentObj, childObj)
  - 2.1 一开始parentObj为空，所以直接执行childObj合并到parentObj上: 
    - 3 mergeField(key): 根据不同key，采取不同对应的合并对象 策略
      - 3.1 之前定义/注册了 策略模式strats[key] + 具体合并策略==> 对于生命周期[key]，都使用相同的合并策略：mergeHook(parent[key], child[key])
        - 4 mergeHook(parentVal, childVal): 转化为数组拼接
  - 2.2 后续parentObj不为空时，mergeField==>透传到mergeHook里实现数组拼接

3 new Vue(options)==> vm._init(options)==> 
  4.1 vm.$options = mergeOptions(vm.constructor.options, options): 合并构造函数的options和实例options，并更新到实例的$options上
  4.2 callHook(vm, 'beforeCreate'): 在对应时间，执行合并好的生命周期钩子
  4.3 initState(vm)/ vm.$mount(el)等.....


## 5 响应式实现2：数据更新后自动重渲染页面

1 修复更新响应式数据值后，调用vm._update(vnode)==> patch(vm.$el, vnode)时 vm.$el报错：
  - 原因是vm.$el是在vm._init(options)==> vm.$mount(el)时生成的，它只会执行1次，保留了对一开始div#app的初始化时引用，但是在后续执行 mountComponent(vm, el)==> vm._update(vm._render())==> patch(vm.$el, vnode)内部，会在生成真实dom后，删除oldVnode，即 div#app节点

  - 因此在后续跟新时，vm.$el保留的还是旧的 div#app节点的引用，但实际上它已经被删除了，导致报错

  - 解决方法是每次执行patch后,都把新生成的真实dom-el元素返回，并赋值给vm.$el

2 实现响应式更新：数据更新后自动重渲染页面
  S1 new Vue(options)==> vue.constructor(options)==> v._init(options)==> vm.$mount(el)==> mountComponent(vm, el)
  
  S2 mountComponent() ==>  new Watcher()==> watcher.constructor()==> watcher.get()
  
  S3 watcher.get()==> 入栈/出栈 Dep.target + watcher.getter()（即exprOrFn）==> updateComponent()==>  vm._update(vm._render())==> render()内部 读取了响应式data的属性==> data.key的 getter拦截

  S4 data.key的 getter拦截==>
    - 每个key都会有一个 keyDep实例 
    - Dep.target有值(watcher.get()时会入栈当前watcher)==> keyDep.depend()==> keyDep.subs.push(Dep.target)==> 页面上所有被读取/使用的属性，都会把渲染watcher存入自己的dep里
   
  S5 data.key被修改值==> data.key的 setter拦截==>
    - 修改值前会先触发getter操作，但是由于watcher.getter 执行完成后，会让Dep.target出栈，导致不会再进行多余的 watcher收集
    - observe(newValue) + keyDep.notify()==> watcherX.update()==> watcher.get()重新执行渲染逻辑，从而更新页面
    - 重新执行watcher.get()==> 再次触发S4的 getter操作==> keyDep.depend()==> 重复收集同一个watcher，所以后续要进行优化，从而避免对同一个watcher实例进行收集








