import { History } from "./base";

class HashHistory extends History {
  constructor(router) {
    super(router);
    this.router = router;
    // 确保hash模式下 有一个/路径
    ensureSlash();
  }

  getCurrentLocation() {
    // 这里也是要拿到hash值
    return getHash();
  }
  
  setupListener() {
    // 当hash值变化了，就获取到最新的hash值，并通过调用transitionTo() 进行跳转
    window.addEventListener("hashchange", () => {
      this.transitionTo(getHash()); 
    });
  }

  push(location) {
    this.transitionTo(location, () => {
      // 去更新hash值
      window.location.hash = location;
    });
  }
}

function ensureSlash() {
  if (window.location.hash) {
    // location.hash 是有兼容性问题的，这里只是简单实现
    return;
  }
  window.location.hash = "/"; // 默认就是 / 路径即可
}

function getHash() {
  return window.location.hash.slice(1);
}

export default HashHistory;
