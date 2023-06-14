## 1 Vue的初始化流程

1 new Vue(options)==> initMixin(Vue): 写成插件形式 来对原型进行扩展
  2 vm._init(options)==> MVVM
    3 initState(vm)
      4 initData(vm)
        5 observe(data)

## 2 实现响应式原理

1 observe(data)
  2 new Observer(data)
    3.1 defineValue__ob__ 
    3.2 处理数组类型：原型代理 + ob.observeArray(value)
    3.3 处理对象类型：ob.walk(data)==> 
      4 defineReactive(data, key, value)

注意点：<br/>
S1 嵌套对象的深层监测：
    - defineReactive里 递归调用observe(value)
    - 所以多层次的对象嵌套，会造成多层递归从而影响性能
> 即情况1: 对象嵌套

S2 对象设置的新值也有可能是对象：
  - Object.defineProperty的setter里，对新值也要进行监听 observe(newValue)

S3.1 处理数组类型：数组原型代理
> 即情况2: 对象里包含数组类型

S3.2 数组内部里，有成员类型是对象，也要对它进行劫持：
  - ob.observeArray(value)==> 遍历递归调用 observe(item)
> 即情况3: 数组里包含对象

S4 数组新增的值可能还是一个 对象/数组类型，所以也需要对其进行劫持：
  - ob.observeArray(inserted)
  - 因为要让数组类型值内部能调用到ob.observeArray方法，所以要在观测值value上定义 value.__ob__ = ob属性，从而让value也能访问到对应的ob对象
> 即情况4: 数组里的push等新增成员包含对象