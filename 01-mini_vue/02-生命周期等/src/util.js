export function defineProperty(target, key, value) {
  Object.defineProperty(target, key, {
    enumerable: false, // 不能被枚举，不能被循环出来
    configurable: false,
    value,
  });
}

export function proxy(vm, data, key) {
  Object.defineProperty(vm, key, {
    // vm.a
    get() {
      return vm[data][key]; // vm._data.a
    },
    set(newValue) {
      // vm.a = 100;
      vm[data][key] = newValue; // vm._data.a = 100;
    },
  });
}


export const LIFECYCLE_HOOKS = [
  "beforeCreate",
  "created",
  "beforeMount",
  "mounted",
  "beforeUpdate",
  "updated",
  "beforeDestroy",
  "destroyed",
];

const strats = {};
strats.data = function (parentVal, childValue) {
  return childValue; // 这里应该有合并data的策略
};
// strats.computed = function() {}
// strats.watch = function() {}
LIFECYCLE_HOOKS.forEach((hook) => {
  strats[hook] = mergeHook;
});

function mergeHook(parentVal, childValue) {
  // 生命周期的合并
  if (childValue) {
    if (parentVal) {
      return parentVal.concat(childValue); // 爸爸和儿子进行拼接
    } else {
      return [childValue]; //儿子需要转化成数组
    }
  } else {
    return parentVal; // 不合并了 采用父亲的
  }
}


// 合并父子对象
export function mergeOptions(parent, child) {
  const options = {};
  for (let key in parent) {
    // 父亲和儿子都有的key, 在这就处理了
    mergeField(key);
  }

  // 父亲没有儿子有的属性 在这处理
  for (let key in child) {
    // 将儿子多的赋予到父亲上
    if (!parent.hasOwnProperty(key)) {
      mergeField(key);
    }
  }

  function mergeField(key) {
    // 合并字段
    // 根据key 不同的策略来进行合并
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key]);
    } else {
      // todo默认合并
      options[key] = child[key];
    }
  }

  return options;
}








