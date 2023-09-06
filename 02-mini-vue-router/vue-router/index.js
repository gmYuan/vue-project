import install from "./install";
import createMatcher from "./create-matcher";
import HashHistory from "./history/hash";
import BrowserHistory from "./history/history";

class VueRouter {
  // 创建 router.matcher属性 + 根据不同mode，生成对应类型的router.history对象
  constructor(options) {

    // 创建router.matcher属性:  {match: 通过路由来匹配组件, addRoutes: 动态添加匹配规则}
    this.matcher = createMatcher(options.routes || []);

    // 根据不同mode，生成对应类型的router.history对象
    options.mode = options.mode || "hash"; // 默认没有传入就是hash模式
    switch (options.mode) {
      case "hash":
        this.history = new HashHistory(this);
        break;
      case "history":
        this.history = new BrowserHistory(this);
        break;
    }
    this.beforeHooks = [];
  }


  init(app) {
    const history = this.history;

    // 监听路由变化 + 获取到最新hash值 + 进行跳转
    const setUpHashListener = () => {
      history.setupListener(); 
    };

    // 初始化 会先获得当前hash值 进行跳转, 并且监听hash变化
    history.transitionTo(
      // 获取当前路径的 window.location.hash值 / window.location.path值
      history.getCurrentLocation(), 
      setUpHashListener
    );
		
    history.listen((route) => {
      // 每次路径变化 都会调用此方法: 订阅
      app._route = route;
    });
  }

  push(to) {
    this.history.push(to);
  }

  go() {}

  match(location) {
    return this.matcher.match(location);
  }

 
  beforeEach(fn) {
    this.beforeHooks.push(fn);
  }
}


VueRouter.install = install;

// 默认vue-router插件导出一个类，用户会new Router({})

export default VueRouter;
