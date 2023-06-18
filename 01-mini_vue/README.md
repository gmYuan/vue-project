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


S5 为了便于使用，Vue内部通过代理模式，在vm.dataKey时，实际访问的是vm._data.dataKey


## 3 Vue的渲染流程

1 vm.$mount(vm.$options.el)
  2 compileToFunctions(template)
    3 parseHTML(template);
      4.1 startTagMatch = parseStartTag()
        5 设置并返回 mathchObj + advance(length)

      4.2 start(mathc.tagName, match.attrs)

S1 vm.$mount(el): 在Vue初始化过程中，会通过render函数==> 生成虚拟DOM
  - 1 默认会先找render方法;
  - 2 如果没有传入render方法，会去查找template==> render
  - 3 如果还没有，就找当前el指定的元素中的内容==> 赋值给template
  - 调用 options.render = compileToFunctions(template)==> 通过template，生成render函数

S2 compileToFunctions(template)
  - 把html字符串转化成 AST语法树==> ast = parseHTML(template)

S3 parseHTML(template)
  - 尝试匹配 标签的开始字符"<" ==> 
    - 匹配成功==> 说明必然是开始或者结束 标签==>
      - 尝试匹配和处理开始标签字符 startTagMatch = parseStartTag();
      - 获取到startTagMatch后，如果存在结果==> start(tagName, attrs) + todo
    - 匹配失败==> 说明必然不是标签 +  todo

S4.1 parseStartTag()
  - 尝试匹配开始标签的 开始字符和标签名称
  - 匹配成功，说明是开始标签：
    - 处理开始标签的 开始字符和标签名称，记做a==> 存入match.tagName + 删除a
    - 只要没匹配到 开始标签的结束标签 + 存在属性b==> 存入match.attrs + 删除b
    - 匹配到 开始标签的结束标签c==> 删除c + 返回match对象

  - 匹配失败：说明不是开始标签：不处理默认返回undifined + todo

S4.2 start(mathc.tagName, match.attrs)：todo