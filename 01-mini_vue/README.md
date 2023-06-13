## 1 Vue的初始化流程

1 new Vue(options)==> initMixin(Vue): 写成插件形式 来对原型进行扩展
  2 vm._init(options)==> MVVM
    3 initState(vm)
      4 initData(vm)
        5 observe(data)

## 2 实现响应式原理

1 