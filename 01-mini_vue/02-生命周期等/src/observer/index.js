import { arrayMethods } from "./array";
import { defineProperty } from "../util";
import Dep from "./dep";

class Observer {
  // 使用defineProperty 重新定义属性
  constructor(value) {
    // debugger
    this.dep = new Dep(); // value = {}  value = []

    // 判断一个对象是否被观测过看他有没有 __ob__这个属性
    defineProperty(value, "__ob__", this);
    if (Array.isArray(value)) {
      // 函数劫持/ 切片编程
      value.__proto__ = arrayMethods;
      // 观测数组中的对象类型，对象变化也要做一些事，注意普通类型是不做观测的
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }
  observeArray(value) {
    value.forEach((item) => {
      // 注意点2: 观测数组中的对象类型
      observe(item);
    });
  }

  walk(data) {
    let keys = Object.keys(data); // 获取对象的key
    keys.forEach((key) => {
      defineReactive(data, key, data[key]); // Vue.util.defineReactive
    });
  }
}

function defineReactive(data, key, value) {
  // debugger
  //注意点1: 嵌套对象的深层监测/ 获取到数组对应的dep
  let childDep = observe(value);

  let dep = new Dep(); // 每个属性都有一个dep
  //当页面取值时 说明这个值用来渲染了==> 将这个watcher和这个属性对应起来
  Object.defineProperty(data, key, {
    get() {
      console.log(`读取了: ${data}${key}`);
      // debugger;
      if (Dep.target) {
        dep.depend(); // 让这个属性记住这个watcher
        if (childDep) {
          // 可能是数组可能是对象
          // 默认给数组增加了一个dep属性，当对数组这个对象取值的时候
          childDep.dep.depend(); // 数组存起来了这个渲染watcher
        }
      }
      return value;
    },

    set(newValue) {
      if (newValue === value) return;
      console.log(`准备设置新值了: ${data}${key}`);
      // debugger
      //注意点3: 如果用户将值改为对象, 需要继续监控
      observe(newValue);
      value = newValue;
      // debugger;
      dep.notify(); // 更新操作
    },
  });
}

export function observe(data) {
  if (typeof data !== "object" || data == null) {
    return;
  }
  if (data.__ob__) {
    return data;
  }
  return new Observer(data);
}
