## Vue-Router相关

## 一 路由模式

### 1 history模式 

1 用于生产环境

2 需要服务端支持，否则一刷新页面就404了(配置路径资源)==> 为什么
  
3 原理
  - window.addEventListener('popstate', cb) 
  - history.pushState({},null, path)


### 2 hash模式

1 原理:  window.addEventListener('hashchange', cb)


## 二 Vue-Router实现流程

实现流程伪代码见下:

```js
// src/main.js
A1 import router from "./router" ==> 

  // src/router.js ==>
  - A2 Vue.use(Router) ==> VueRouter.install(Vue) ==> 
    - z.1 缓存 Vue构造函数
    - z.2 把根组件传入的router实例 共享给所有组件:
      - 通过 Vue.mixin( { beforeCreate } ) 在每个组件上都引用同一个根组件实例 rootVm._routerRoot = rootVm  + rootVm._router = this.$options.router
      - 这个this.$options.router，就是创建根组件实例时 传入的router(具体见main.js)
      - 这样任何组件都可以通过 this._routerRoot==> rootVm==> rootVm._router 
    
    - z.3 调用 rootRouter.init(vue根实例: rootVm)

    - z.4 defineReactive(this, "_route", this._router.history.current)==>
      - 在rootVm上 定义响应式属性 rootVm._route: 当current值变化后，会自动更新_route值


    - z.5 在Vue上，注册了2个全局组件: router-link + router-view

    - z.6 在Vue原型对象上，注册了2个全局属性: Vue.pty.$route + Vue.pty.$router
      - 读取 Vue.pty.$router，内部其实真正读取的是 rootVm._router
      - 读取 Vue.pty.$route，内部其实真正读取的是 rootVm._route 


  // src/router.js ==>
  - A3 new Router(options)==>
    - y.1 router.matcher = createMatcher(options.routes || [])==>
      - let { pathMap } = createRouteMap(routes): 扁平化 树形路由配置 ==>
        - 递归函数 addRouteRecord(route, pathMap, parent): 创建 { 路径-record }的 map

      - 返回匹配器对象 router.matcher =  { addRoutes, match }
        - addRoutes方法:  动态添加路由匹配规则==> 原理就是 createRouteMap
        - match方法: 通过 path/loaction来 匹配组件信息(record), 具体实现流程见下文

    - y.2 router.history = new HashHistory / BrowserHistory (vmRouter)
      - baseHistory.Con(vmRouter)==>
        - 存储 vmRouter实例
        - 初始化 router.current值==> createRoute(null, { path: "/" })
          - 返回嵌套路径 对应的多个 路由信息对象 {...loaction, matched: [recodeP, record] }

      - ensureSlash(): 确保hash模式下 有一个/根路径

    - y.3 定义 router.beforeHooks = []

  // src/router.js ==>
  - A4 [可选的] 注册了多个 router.beforeEach(fn)路由守卫: roter.beforeHooks.push(fn)


// src/main.js
A5 
const vm = new Vue({ el: "#app", router}) ==> [rootVm.beforeCreated()] ==> 
rootRouter.init(rootVm)==>

  - x.1 history.transitionTo(history.getCurrentLocation(), history.setupListener()) ==>
    - history.getCurrentLocation(): 获取当前路径上的 hash值/loaction值
    - history.setupListener(): 注册 监听hashchange事件，回调是 history.transitionTo(getHash())
    
  - x.1 history.transitionTo(locationStr, onComplete)
    - w.1 newRoute = router.matcher(locationStr)==> router.matcher.match(locationStr)==>
      - createRoute( record, { path: locationStr } ): 
        返回嵌套路径 对应的多个 路由信息对象 {...loactionObj, matched: [recodeP, record] }

    - w.2 避免 重复跳转相同路由: 
      当前current.path === 即将跳转的目标locationStr &&  当前current.matched.length === newRoute.matched.length

    - w.3 把各个类型的 路由守卫数组，合并成1个执行队列 queue = [].concat(router.beforeHooks)
    - w.4 runQueue(queue, iterator, () => { history.updateRoute(newRoute); onComplete() })

    - w.4 runQueue(queue, iterator, cb)==>
      - v.1 定义递归函数 setp(index)==>
        - queue都执行完成后，才会执行cb()
        - 依次从头取出 守卫钩子hook, 调用 iterator(hook, () => step(index + 1))==>
          - iterator(hook, next): 执行定义的守卫钩子 hook(this.current, newRoute, ()=> next())
          - 这里的next，即传入的 () => step(index + 1)，他会递归执行step

      - v.2 调用 step(0)
      
    - w.5 执行完所有路由守卫queue后，会执行cb，即 history.updateRoute(newRoute) + onComplete()
      - u.1 history.updateRoute(newRoute):
        - 更新 this.current = newRoute, 注意 this.current是 _route响应式对象上的 1个属性
        - 如果有通过 hisotry.listen(cb) 注册了 hisotry.cb，就会执行 hisotry.cb()

      - u.2 onComplete(),即 history.setupListener(): 注册 监听hashchange事件


  - x.2 注册监听 更新rootVm._route值为最新route: history.listen(route => app._route = route) 

```