## Vue-Router源码详解

## 一 基本使用


	

## 二 简易版源码实现


```js
// src/main.js
A1 import router from "./router" ==> 进入并执行 src/router/index.js文件==>
  // src/router.js
  - B1 import Router from "./vue-router" ==> 
    // vue-router/index.js
    - C1 定义了 VueRouter.install = install
  
  - B2 Vue.use(Router)
  - B3 router = new Router(options)
  - B4 router.beforeEach((from, to, next)=> {})

A2 new Vue({......, router实例})

A3 最后形成的数据结构:  <br/>
rootVm = {
  _routerRoot: rootVm,

  // 增加属性后的 $options.router
  // 读取 Vue.pty.$router，实质就是读取该值
  _router: { 
    // 属性
    mode, 
    routes, 
    matcher: {
      addRoutes(routes) {} ==> 
        createRouteMap() {} ==> addRouteRecord() {} ==> pathMap
      // pathMap结构: 
      // {locationStr(/about || /about/a): {path,component, parent} as <Reacord>}
      
      match(locationStr) {}==> createRoute()==> 
        // 返回结果route 的结构为
        { path, matched: [recodeParent, recordChild] } as <ROUTE>
    },

    history: {
      router: rootVm._router,
      // 也是由createRoute()构造出的
      current<ROUTE>: { 
        path: String
        matched: [recodeParent, recordChild]
      },
      cb:() => {},
      // 方法
      transitionTo(locationStr, onComplete) {}
      updateRoute() {},
      listen(cb) {}
      push() {}
    },

    beforeHooks: [],
 
    // 方法
    match: () => this.matcher.match(locationStr)
    push() {} // 其实就是调用了history.push()
  },

  // 响应式数据，当rootVm._router.history.current值发生变化后，就会自动更新该值
  // 读取 Vue.pty.$route，实质就是读取该值
  _route<ROUTE>: {}
}

//------------------------------------------------------------------------
S1 B3 执行 new Router({mode, routes: [{path, component, children}] })==>
  - z.1 创建 router.matcher属性: createMatcher(options.routes)==>
    - 扁平化 树形路由配置: let { pathMap } = createRouteMap(routes)  ==>
      - 创建 { 路径-record }的map: 递归函数 addRouteRecord(route, pathMap, parent) 

    - 返回匹配器对象 router.matcher =  { addRoutes, match }
      - addRoutes方法: 动态添加路由匹配规则==> 原理就是 createRouteMap
      - match方法: 通过locationStr来匹配record对象，从而调用 createRoute()生成 路由对象

  - z.2 根据不同mode，生成对应类型的router.history对象==>
    - router.history = new HashHistory / BrowserHistory(router)
      - baseHistory.Con(router)==>
        - 存储 router路由实例
        - 初始化 router.history.current值: createRoute(null, { path: "/" })
          - 返回嵌套路径对应的多个 路由信息对象 {...loactionObj, matched: [recodeParent, recordChild] }

  - z.3 定义 roter.beforeHooks = []


S2 B4 [可选的]注册了多个 router.beforeEach(fn)路由守卫: router.beforeHooks.push(fn)


S3 B1 && B2 在new Vue(vmPptions)初始化过程中，会调用 Vue.use(Router)==> 
  C1 执行定义的 VueRouter.install(Vue):
  - y.1 缓存 Vue构造函数
  
  - y.2 通过Vue.mixin() 把根组件实例rootVm 共享给所有子组件 + 定义rootVm各个属性
    - x.1 定义 rootVm._routerRoot = rootVm 和 rootVm._router = $options.router
    - x.2 调用 rootVm._routerRoot.init(rootVm)
    - x.3 定义响应式属性 rootVm._route: 当rootVm._router.history.current值变化后，会自动更新_route值
    
    - 这样任何组件都可以通过 vm._routerRoot==> vm.$parent._routerRoot==> rootVm==> ==> 来读取 rootVm._router、rootVm._route等属性
    
  - y.3 注册2个全局组件: router-link + router-view

  - y.4 在Vue原型对象上，注册2个全局属性: Vue.pty.$router + Vue.pty.$route
    - 读取 Vue.pty.$router，内部其实真正读取的是 rootVm._router
    - 读取 Vue.pty.$route，内部其实真正读取的是 rootVm._route 


S4 以hash模式为例==> 调用 x.2 rootVm._routerRoot.init(rootVm)
  - q.1 todo: router.history.transitionTo(history.getCurrentLocation(), history.setupListener())==>
    - history.getCurrentLocation(): 获取当前路径的 hash值/path值
    - history.setupListener(): 注册 监听hashchange事件，回调是 history.transitionTo(getHash())
    - history.transitionTo(locationStr, onComplete): 
      - p.1 根据locationStr，获取到对应的route信息 {...loactionObj, matched: [recodeP, record] }==>
        newRoute = history.router.match(locationStr)==> router.matcher.match(locationStr)==> 
        - 根据pathMap[locationStr]查询到的record，调用 createRoute(record, { path: locationStr }): 返回嵌套路径对应的多个 路由信息对象 {...loactionObj, matched: [recodeP, record] }
      
      - p.2 避免 相同路由重复跳转: locationStr == this.current.path &&
      newRoute.matched.length == this.current.matched.length

      - p.3 把各个类型的 路由守卫数组，合并成1个执行队列: queue = [].concat(router.beforeHooks)

      - p.4 runQueue(queue, iterator, cb1)==>
        - 依次执行路由钩子 + 更新history.current + 更新rootVm._route值 + 监听路由变化，调用transitionTo处理
          step(0)==> 
          - hooks还未执行完成时: iterator(hook0, () => step(index + 1))==>
            - hook0/1/2(newRoute, this.current, ()=> next() )
          - hooks都执行完成时: cb1(),即 history.updateRoute(route)() + onComplete()
            - 更新 history.current = newRoute
            - 如果有通过 hisotry.listen(cb) 注册了 hisotry.cb，就会执行 hisotry.cb()

        - 注册 监听hashchange事件: onComplete(),即 history.setupListener()

  - q.2	更新rootVm._route值: router.history.listen((route) => { rootVm._route = route})


// src/vue-router/components/link.js
S5 <tag onClick={this.handler.bind(this, to)}>{this.$slots.default}</tag> ==>
  - vm.handler(to)==> vm.$router.push(to)==> router.push(to)==> 
    - router.history.push(to)==> 
      - history.transitionTo(locationStr, () => { window.location.hash = location })

// src/vue-router/components/view.js
S6 每一处 使用了routerView组件 ==>
  routerView.render(h, { parent, data })==>
    - 每一处的 routerView组件都对它进行标记: data.routerView = true
    - 通过 parent.$vnode && parent.$vnode.data.routerView，识别遇到了的是第几层的 router-view
    - record = route.matched[depth]: 获取到第N层router-view 对应的 那一个record
      - 第一层router-view 渲染第一个record; 第二个router-view 渲染第二个
    - 渲染对应组件: h(record.component, data)
```


## 三 其他Vue-Router相关






## 四 参考文档

[01 ](): todo
