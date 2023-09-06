export function createRoute(record, locationObj) {
  let res = [];
  if (record) {
    while (record) {
      // res值表示为: [ '/about', '/about/a' ]
      res.unshift(record);
      record = record.parent;
    }
  }
  return {
    ...locationObj,
    matched: res,
  };
}

function runQueue(queue, iterator, cb) {
  // 异步迭代
  function step(index) {
    // 可以实现中间件逻辑
    if (index >= queue.length) return cb();
    let hook = queue[index]; // 先执行第一个 将第二个hook执行的逻辑当做参数传入
    iterator(hook, () => step(index + 1));
  }
  step(0);
}

class History {
  constructor(router) {
    this.router = router;
    // matched属性的值: 
    // { '/': Record, "about': Record, "/about/a':record, "/about/b':record }
    // about/a/ ==> matches:[ Record_About, Record_About/A]

    // 当我们创建完路由，会先有一个默认值路径 和 匹配到的记录，做成一个映射表
    // 默认当创建history时 路径应该是/ 并且匹配到的记录是[]，即
    // this.current = {path:'/',matched:[]}

    this.current = createRoute(null, {
      path: "/",
    });
  }

  // 跳转时都会调用此方法: 路径变化了: 视图还要刷新 (响应式数据原理)
  transitionTo(locationStr, onComplete) {
    let route = this.router.match(locationStr); // {'/'.matched:[]}
    // 这个route 就是当前最新的匹配到的结果
    if (
      locationStr == this.current.path &&
      route.matched.length == this.current.matched.length
    ) {
      // 防止重复跳转
      return;
    }
    // 拿到了路由守卫钩子
    let queue = [].concat(this.router.beforeHooks); 

    const iterator = (hook, next) => {
      hook(route, this.current, () => {
        next();
      });
    };

    runQueue(queue, iterator, () => {
      // 在更新之前先调用注册好的导航守卫
      this.updateRoute(route);
      // 根据路径加载不同的组件  this.router.matcher.match(location)  组件
      // 渲染组件
      onComplete && onComplete();
    });
  }

  listen(cb) {
    this.cb = cb;
  }

  updateRoute(route) {
    // 每次路由切换都会更改current属性
    this.current = route; 
    this.cb && this.cb(route); // 发布
  }
}

export { History };
