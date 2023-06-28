let id = 0;

// dep和watcher是多对多的关系 1个属性就有一个dep，用来收集watcher
// 1个dep 可以存多个watcher
// 1个watcher可以对应 多个dep

class Dep {
  constructor() {
    this.subs = [];
    this.id = id++;
  }
  depend() {
    this.subs.push(Dep.target); 
  }

  notify() {
    this.subs.forEach((watcher) => watcher.update());
  }
}

Dep.target = null; // 静态属性
export function pushTarget(watcher) {
  Dep.target = watcher; // 保留watcher
}

export function popTarget() {
  Dep.target = null; // 将变量删除掉
}

export default Dep;


