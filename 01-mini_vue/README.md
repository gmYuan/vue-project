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
  S1 new Vue(options)==> vue.constructor(options)==> v._init(options)==> mergeOptions() + callHook() + initState(vm): 拦截了getter和setter的对象/数组==> vm.$mount(el)==> mountComponent(vm, el)
    - initState()==>initData(data)==> observe(data)==> Observer.constructor()==> ob.dep + data.__ob__：(凡是引用类型：数组/对象，必定会有属于它的一个ob对象)==> defineReactive(data, key, val)==> childOb闭包 + keyDep闭包 + getter/setter拦截
    
    - observe(data)的作用：
      - 定义data_key的keyDep闭包
      - 定义 data.key那一层引用对象的childOb闭包(data.key.__ob__)
      - 拦截data_key的 getter/setter

    - dep的创建顺序：childObDep > data_key(深度优先遍历)
    - dep收集watcher的顺序是：data_key(key_Dep) > data.key(childOb_Dep) + 
  
  S2 mountComponent() ==>  new Watcher()==> watcher.constructor()==> watcher.get()
  
  S3 watcher.get()==> 入栈/出栈 Dep.target + watcher.getter()（即exprOrFn）==> updateComponent()==>  vm._update(vm._render())==> render()内部 读取了响应式data的属性==> data.key的 getter拦截

  S4 data.key的 getter拦截==>
    - 每个key都会有一个 keyDep实例 

    - Dep.target有值(watcher.get()时会入栈当前watcher)==> keyDep.depend()==> watcher存储dep + dep存储watcher：为了避免存储重复的dep和watcher(当模板中多次读取data.key时)，需要在watcher入口通过depId的set来进行去重dep (dep去重后自然就会让依赖的dep存储watcher去重)==> 页面上所有被读取/使用的属性，都会把渲染watcher存入自己的dep里

  S5 data.key被修改值==> data.key的 setter拦截==>
    - 修改值前会先触发getter操作，但是由于watcher.getter 执行完成后，会让Dep.target出栈，导致不会再进行多余的 watcher收集
    - observe(newValue) + keyDep.notify()==> watcherX.update()==> watcher.get()重新执行渲染逻辑，从而更新页面
    - 重新执行watcher.get()==> 再次触发S4的 getter操作==> keyDep.depend()==> 

      - 当一个对象obj的引用地址被重新赋值后，由于obj.newKey被观测 + 读取info时会通过JSON.stringify深层遍历读取，从而可以让newKey有dep来存储watcher，从而让其实现了后续的响应式渲染

  S6 特殊的，当data.arr调用数组的push等7种原型方法时，不会触发setter拦截，且此时data.arr的keyDep虽然收集到了watcher依赖，但它只有在能被setter拦截时才能出发keyDep.notify()，所以需要特殊处理==> 在每个拦截对象的ob实例上，建立ob.dep==> 
    - 当data.key为一个引用类型时，当访问data_key时，就同时会触发data_key_dep + data.key_childOb的 dep收集
    - 在数组调用push后，调用ob.dep.notify()进行


## 6 响应式实现3：更新队列异步更新

1 当前更新存在的问题：在同一个操作里进行多次更新，目前会出发多次wathcer.update操作==> 页面多次触发重渲染，性能低下

2 解决方法：

S1 dep.notify() ==> watcherX.update()==> queueWatcher(watcherX)
  - 把watcherX 存入 watcher队列
  - S2 nextTick(flushSchedulerQueue)
  - 如果没执行完 flushSchedulerQueue，就不要在调用nextcick了==> 防抖

S2 nextTick(flushSchedulerQueue)
  - cbs.push(flushSchedulerQueue)
  - timerFunc()==> flushCallbacks函数进入微任务队列

  - 当pending为真，表示nextTick的cbs还未被清空，就不需要重复调用timerFunc()，让多个flushCallbacks进入微任务队列，因为在flushCallbacks内部，会清空掉nextTick存储的所有cbs==> 也是用于防抖

S3 同步代码执行完成后，异步执行flushCallbacks()
  - 取出nextTick的cbs队列里所有的cb,依次执行==>
    - S4.1 flushSchedulerQueue() ==> watcherX.run()==> watcher.get()触发重渲染
    - S4.2 用户定义的$nextTick(cb2)里的cb2()执行

  - 重置nextTick的pending标识为false


## 7 实现 $watcher/watch: {}

1 watch: {} 入口：initWatch(vm)==> new Watcher()

S1 new Vue(options)==> vue.constructor(options)==> vm._init(options)==> mergeOptions() + callHook() + initState(vm)==> initData(vm) + initWatch(vm)

S2 initWatch(vm)==> createWatcher(vm, exprOrFn, handler, options)==> vm.$watch(exprOrFn, cb, options)==> new Watcher(vm, exprOrFn, cb, options)

S3 new Watcher()==> 定义watcher.getter为函数 + watcher.get() ==> 调用watcher.getter()==> 触发对象的getter拦截==> keyDep+valueDep收集watcher依赖==> 可选的立刻执行cb() 


2 渲染watcher入口：基本同上

S1 ....==>  vm._init(options)==> vm.$mount(el)==> compileToFunctions() +  mountComponent(vm, el) ==> 

S2 mountComponent() ==> callHook() + new Watcher(vm, updateComponent, hook) ==> 基本同上


## 8.1 实现 dom-diff1- 比较vnode中的 当前节点

1 dom-diff的入口: pathch(oldVnode, vnode)

  S1 render1 = compileToFunctions(template1)==> vnode1 = render1.call(vm) ==> dom1 = createElm(vnode1)

  S2 ..... ==> vnode2 = render2.call(vm2) ==> patch(vnode1,vnode2)

2 初次渲染时(oldVnode.nodeType === 1): createElm(vnode) + 替换插入body中

3 更新dom时: 
  - 比较两个元素的标签, 标签不一样: 直接替换为新的dom即可(同层标签类型比较)
  - 处理文本节点: 更新文本内容即可
  - 标签类型一样 + 非文本节点: 复用旧有dom节点dom1 + 更新dom1的属性为新vnode的属性


## 8.2 实现 dom-diff2- 比较vnode中的 子节点: 头节点相同

1 入口流程：patch(oldVnode, vnode)==> updateChildren(oldChildren, newChildren, parent)==> 新旧节点 + 头尾双指针碰撞技巧

2.1 while(存在旧节点 && 存在新节点)
  S1 头节点相同 ==> 
    - 递归调用patch(oldStartVnode, newStartVnode): 更新属性 + 递归更新子节点
    - 移动新旧头节点指针

2.2 有遗留的新节点==> 插入新节点:  parent.appendChild(createElm(newChild))

## 8.3 实现 dom-diff3- 比较vnode中的 子节点: 尾节点相同

1 入口流程：patch(oldVnode, vnode)==> updateChildren(oldChildren, newChildren, parent)==> 新旧节点 + 头尾双指针碰撞技巧

2.2 while(存在旧节点 && 存在新节点)
  S1 头节点相同，见上 8.2
  S2 尾节点相同==>
    - 递归调用 patch(oldEndVnode, newEndVnode)
    - 移动新旧尾节点指针

2.2 有遗留的新节点==> 在头部/尾部真实dom前面 插入新节点：
  parent.insertBefore(newChildX, nextEle)

## 8.4 实现 dom-diff4- 比较vnode中的 子节点: 头-尾/尾-头 节点相同

1 入口流程：patch(oldVnode, vnode)==> updateChildren(oldChildren, newChildren, parent)==> 新旧节点 + 头尾双指针碰撞技巧

2.2 while(存在旧节点 && 存在新节点)
  S1 头节点相同，见上 8.2
  S2 尾节点相同==> 见上 8.3
  S3 旧头-新尾 相同
    - 递归调用 patch(oldStartVnode, newEndVnode)
    - 将当前 旧头真实dom插入到 旧尾节点的 下一个真实dom元素的 前面
    - 移动旧的头节点指针 + 新的尾节点指针

  S4 旧尾-新头 相同
    - 递归调用 patch(oldEndVnode, newStartVnode)
    - 将当前 旧尾真实dom元素插入到 旧的头部真实dom元素 的前面
    - 移动旧的尾节点指针 + 新的头节点指针

具体过程，见 [diff-旧头_新尾](./03-dom-diff/img/01-旧头_新尾.jpg)


## 8.5 实现 dom-diff5- 比较vnode中的 子节点: 4种情况都不相同- keyMap & 暴力对比

1 入口流程：patch(oldVnode, vnode)==> updateChildren(oldChildren, newChildren, parent)==> 新旧节点 + 头尾双指针碰撞技巧

2.2 while(存在旧节点 && 存在新节点)
  S1 头节点相同==> 见上 8.2
  S2 尾节点相同==> 见上 8.3
  S3 & S4 旧头-新尾 相同/ 旧尾-新头 相同 ==> 见上 8.4

  S5 头尾 & 交叉都不相同时，则以新的头结点作为依据：
    - 不断拿新头的虚拟节点的key，去旧节点的keyIndexMap中 尝试寻找index
    - 如果没找到，说明没有可复用的节点，直接在 旧头真实dom前插入 新头dom
    - 如果找到，说明有可复用节点，记作递归调用
      - 递归调用 patch(moveVNode, newStartVnode)
      - 把旧的moveVNode，移动到旧的头节点真实dom 的前面
      - 把旧的moveVNode 对应index的值置为null

2.3 循环结束后，如果还有 旧节点还没处理：直接删除这些旧节点元素即可


## 8.6 实现 dom-diff6- 在vm._update的内部区分初次渲染和更新渲染

1 mountComponent()==> new Watcher() ==> watcher.get()/ watcher.getter() ==> updateComponent() ==>  vm._update(render)==> 
  - 根据是否存在prevVnode，来区分是首次渲染/ 更新渲染
  - 首次渲染: vm.$el = patch(vm.$el, vnode)
  - 更新渲染: vm.$el = patch(prevVnode, vnode)
  - 每次都更新preVnode: vm._vnode = vnode
