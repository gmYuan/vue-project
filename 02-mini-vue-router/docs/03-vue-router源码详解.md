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


// ----------------------------------------------------------------------------
S1 B3 执行 new Router({mode, routes: [{path, component, children}] })==>
  - z.1 创建 router.matcher属性:  createMatcher(options.routes)==>
    - let { pathMap } = createRouteMap(routes): 扁平化 树形路由配置 ==>
      - 递归函数 addRouteRecord(route, pathMap, parent): 创建 { 路径-record }的map

    - 返回匹配器对象 router.matcher =  { addRoutes, match }
      - addRoutes方法: 动态添加路由匹配规则==> 原理就是 createRouteMap
      - match方法: 通过locationStr来匹配record对象，从而调用 createRoute()生成 路由对象

  - z.2 根据不同mode，生成对应类型的router.history对象==>
    - router.history = new HashHistory / BrowserHistory(router)
      - baseHistory.Con(router)==>
        - 存储 router路由实例
        - 初始化 router.current值==> createRoute(null, { path: "/" })
          - 返回嵌套路径对应的多个 路由信息对象 {...loactionObj, matched: [recodeParent, recordChild] }

  - z.3 定义 roter.beforeHooks = []


S2 B4 [可选的]注册了多个 router.beforeEach(fn)路由守卫: router.beforeHooks.push(fn)


S3 B1 && B2 在new Vue(vmPptions)初始化过程中，会调用 Vue.use(Router)==> 
  C1 执行定义的 VueRouter.install(Vue)
  - y.1 缓存 Vue构造函数
  
  - y.2 通过Vue.mixin() 把根组件实例rootVm 共享给所有子组件 + 定义rootVm各个属性
    - x.1 定义 rootVm._routerRoot = rootVm 和 rootVm._router = $options.router
    - x.2 调用 rootRouter.init(rootVm)
    - x.3 定义响应式属性 rootVm._route: 当rootVm._router.history.current值变化后，会自动更新_route值
    
    - 这样任何组件都可以通过 vm._routerRoot==> vm.$parent.routerRoot==> rootVm==> ==> 来读取 rootVm._router、rootVm._route等属性
    
  - y.3 注册2个全局组件: router-link + router-view

  - y.4 在Vue原型对象上，注册2个全局属性: Vue.pty.$router + Vue.pty.$route
    - 读取 Vue.pty.$router，内部其实真正读取的是 rootVm._router
    - 读取 Vue.pty.$route，内部其实真正读取的是 rootVm._route 


S4 以hash模式为例==> 调用 x.2 rootRouter.init(rootVm)
  - q.1 router.history.transitionTo(history.getCurrentLocation(), history.setupListener())
    - history.getCurrentLocation(): 获取当前路径的 hash值/path值
    - history.setupListener(): 注册 监听hashchange事件，回调是 history.transitionTo(getHash())
    - history.transitionTo(locationStr, onComplete): 
      - p.1 根据locationStr，获取到对应的route信息 {...loactionObj, matched: [recodeP, record] }==>
        newRoute = history.router.match(locationStr)==> router.matcher.match(locationStr)==> 
        - 根据pathMap[locationStr]查询到的record，调用 createRoute(record, { path: locationStr }): 返回嵌套路径对应的多个 路由信息对象 {...loactionObj, matched: [recodeP, record] }
      
      - p.2 避免 重复跳转相同路由: locationStr == this.current.path &&
      newRoute.matched.length == this.current.matched.length

      - p.3 把各个类型的 路由守卫数组，合并成1个执行队列: queue = [].concat(router.beforeHooks)
      - p.4 runQueue(queue, iterator, () => { history.updateRoute(newRoute); onComplete() })


  - q.2	router.history.listen((route) => { app._route = route})





```


## 三 其他Vue-Router相关






## 四 参考文档

[01 ](): todo
