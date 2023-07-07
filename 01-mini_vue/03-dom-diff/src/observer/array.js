// 拿到数组原型上的方法 （原来的方法）
let oldArrayProtoMethods = Array.prototype;

// 继承一下ES5的方法
export let arrayMethods = Object.create(oldArrayProtoMethods);

let methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];

methods.forEach((method) => {
  arrayMethods[method] = function (...args) {
    // 当调用数组我们劫持后的这7个方法，页面应该更新：要知道数组对应哪个dep
    // this就是observer里的value
    const result = oldArrayProtoMethods[method].apply(this, args);
    let inserted;
    let ob = this.__ob__;
    // debugger

    switch (method) {
      case "push": // arr.push({a:1},{b:2})
      case "unshift": //这两个方法都是追加 追加的内容可能是对象类型，应该被再次进行劫持
        inserted = args;
        break;
      case "splice": // vue.$set原理
        inserted = args.slice(2); // arr.splice(0,1,{a:1},{a:1},{a:1})
      default:
        break;
    }
    
    // debugger
    // 注意点4：对通过数组方法新增的值，也需要进行观测每一项内容
    if (inserted) ob.observeArray(inserted); 

    ob.dep.notify(); // 通知数组更新
    return result;
  };
});
