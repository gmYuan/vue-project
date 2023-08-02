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

1 Vue.use(Router) ==> VueRouter.install ==> 
    
S1 在Vue上，注册了2个全局组件: <router-link> + <router-view>

S2 在Vue原型对象上，注册了2个全局属性: Vue.pty.$route + Vue.pty.$router
  
S3 把根组件传入的router实例 共享给所有的子组件

  - 通过 Vue.mixin( { beforeCreate } ) 在每个组件上都引用同一个根组件实例 this._routerRoot +  this._router = this.$options.router

  - 这个this.$options.router，就是创建根实例时 传入的router (具体见main.js)
  - 这样任何组件 都可以通过this._routerRoot._router 获取共同的实例


S4 调用 vueRouter实例.init(vue根实例)


-----------------------------------------------------
2 new Router(options)==> constructor(options)

S1 创建 vueRouter实例的 匹配器(matcher): createMatcher(options.routes)
  - match方法:      通过路由来 匹配组件
  - addRoutes方法:  动态添加路由匹配规则：原理就是 createRouteMap

  - createRouteMap(routes, pathMap):  扁平化 树形路由配置
    ==> 递归函数 addRouteRecord(route, pathMap, parent): 创建 路径-组件 扁平化的映射关系



