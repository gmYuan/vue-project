export function patch(oldVnode, vnode) {
  // 默认初始化时 是直接用虚拟节点创建出真实节点来 替换掉老真实节点
  // 第1次渲染：oldVnode: id#app;  vnode: 生成的虚拟dom
  if (oldVnode.nodeType === 1) {
    let el = createElm(vnode); // 产生真实的dom
    let parentElm = oldVnode.parentNode; // 获取老的app的父亲 => body
    parentElm.insertBefore(el, oldVnode.nextSibling); // 当前的真实元素插入到app的后面
    parentElm.removeChild(oldVnode); // 删除老的节点
    console.log("初次渲染生成的el是---", el);
    console.log("------------------------------------");
    // debugger
    return el;
  } else {
    // debugger;
    // 在更新的时 拿老的虚拟节点 和 新的虚拟节点做对比
    // 对于不同的地方 更新真实的dom

    // 1.比较两个元素的标签 ，标签不一样直接替换掉即可
    if (oldVnode.tag !== vnode.tag) {
      // 老的dom元素
      return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
    }

    // 2.有种可能是标签一样 1 <==> 2
    //  文本节点的虚拟节点tag 都是undefined==> 处理文本节点
    if (!oldVnode.tag) {
      if (oldVnode.text !== vnode.text) {
        return (oldVnode.el.textContent = vnode.text);
      }
    }

    // 3.标签一样 并且需要开始比对标签的属性 和 儿子了
    // 标签一样直接复用即可
    let el = (vnode.el = oldVnode.el); // 复用老节点

    // 更新属性，用新的虚拟节点的属性和老的比较，去更新节点
    // 新老属性做对比
    updateProperties(vnode, oldVnode.data);

    // 比较孩子节点
    let oldChildren = oldVnode.children || [];
    let newChildren = vnode.children || [];

    if (oldChildren.length > 0 && newChildren.length > 0) {
      // 老的有儿子 新的也有儿子  diff 算法
      updateChildren(oldChildren, newChildren, el);
    } else if (oldChildren.length > 0) {
      // 新的没有 + 老的有
      el.innerHTML = "";
    } else if (newChildren.length > 0) {
      // 新的有 +  老的没有
      for (let i = 0; i < newChildren.length; i++) {
        let child = newChildren[i];
        // 浏览器有性能优化 不用自己在搞文档碎片了
        el.appendChild(createElm(child));
      }
    }
  }
}

function isSameVnode(oldVnode, newVnode) {
  return oldVnode.tag == newVnode.tag && oldVnode.key == newVnode.key;
}
// 儿子间的比较
function updateChildren(oldChildren, newChildren, parent) {
  // 旧的开头和结尾 双指针
  let oldStartIndex = 0; // 老的索引
  let oldEndIndex = oldChildren.length - 1;
  let oldStartVnode = oldChildren[0]; // 老的索引指向的节点
  let oldEndVnode = oldChildren[oldEndIndex];
  // 新的开头和结尾 双指针
  let newStartIndex = 0;
  let newEndIndex = newChildren.length - 1;
  let newStartVnode = newChildren[0]; // 新的索引指向的节点
  let newEndVnode = newChildren[newEndIndex];

  // vue 中的diff算做了很多了优化
  // DOM中操作有很多常见的逻辑 把节点插入到当前儿子的头部、尾部、儿子倒叙正序
  // vue2中采用的是双指针的方式

  function makeIndexByKey(children) {
    let map = {};
    children.forEach((item, index) => {
      if (item.key) {
        map[item.key] = index; // {A:0, B:1, C:2, D:3}
      }
    });
    return map;
  }
  let map = makeIndexByKey(oldChildren);

  // 做一个循环，同时循环老的和新的，哪个先结束 循环就停止，将多余的删除或者添加进去
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (!oldStartVnode) {
      // 指针指向了null 跳过这次的处理
      oldStartVnode = oldChildren[++oldStartIndex];
    } else if (!oldEndVnode) {
      // 指针指向了null 跳过这次的处理
      oldEndVnode = oldChildren[--oldEndIndex];
      
      // 新头-旧头 相同
    } else if (isSameVnode(oldStartVnode, newStartVnode)) {
      // 如果俩人是同一个元素，比对儿子
      patch(oldStartVnode, newStartVnode); // 更新属性和再去递归更新子节点
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
      // 新尾-旧尾 相同
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      patch(oldEndVnode, newEndVnode);
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
      // 旧头-新尾 相同
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      patch(oldStartVnode, newEndVnode);
      // 将当前元素插入到 旧的尾部的下一个元素的 前面
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
      // 旧尾-新头 相同
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      patch(oldEndVnode, newStartVnode);
      // 将当前元素插入到 旧的头部节点 的前面
      parent.insertBefore(oldEndVnode.el, oldStartVnode.el);
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
      // 为什么要有key，循环的时候为什么不能用index作为key
    } else {
      // 儿子之间没关系==> 暴力比对

      // 拿新头的虚拟节点的key，去旧节点的keyIndexMap中 尝试寻找index
      let moveIndex = map[newStartVnode.key];
      if (moveIndex == undefined) {
        // 不需要移动说明没有key复用的：直接在旧头真实dom前插入 新头dom
        parent.insertBefore(createElm(newStartVnode), oldStartVnode.el);
      } else {
        let moveVNode = oldChildren[moveIndex]; // 这个老的虚拟节点需要移动
        // 比较 旧的moveVNode 和 新头vnode
        patch(moveVNode, newStartVnode);
        // 把旧的moveVNode，移动到旧的头节点真实dom 的前面
        parent.insertBefore(moveVNode.el, oldStartVnode.el);
        // 把旧的moveVNode对应index的值置为null
        oldChildren[moveIndex] = null;
      }
      // 用新的头节点 不停的去老的里面找
      newStartVnode = newChildren[++newStartIndex];
    }
  }

  // 在头部或者尾部 插入新节点
  if (newStartIndex <= newEndIndex) {
    // debugger
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      // 将新的多余的插入进去即可 ,可能是向前添加 还有可能是向后添加
      // parent.appendChild(createElm(newChildren[i]));

      // 向后插入 ele = null
      // 像前插入 ele 就是当前向谁前面插入
      let ele =
        newChildren[newEndIndex + 1] == null
          ? null
          : newChildren[newEndIndex + 1].el;
      parent.insertBefore(createElm(newChildren[i]), ele);
    }
  }

  // 老的节点还有没处理的，说明这些老节点是不需要的节点
  // 如果这里面有null，说明这个节点已经被处理过了，跳过即可 + 否则删除该节点即可
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      let child = oldChildren[i];
      if (child != null) {
        parent.removeChild(child.el);
      }
    }
  }
}

// 创建真实元素
export function createElm(vnode) {
  let { tag, children, key, data, text } = vnode;
  if (typeof tag == "string") {
    // 创建元素 放到vnode.el上
    vnode.el = document.createElement(tag);

    // 只有元素才有属性
    updateProperties(vnode);

    children.forEach((child) => {
      // 遍历儿子 将儿子渲染后的结果扔到父亲中
      vnode.el.appendChild(createElm(child));
    });
  } else {
    // 创建文件 放到vnode.el上
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

// vue 的渲染流程
//  先初始化数据==> 将模板进行编译==> render函数==>
//  生成虚拟节点==> 生成真实的dom==> 渲染到页面上

function updateProperties(vnode, oldProps = {}) {
  let el = vnode.el;
  let newProps = vnode.data || {};
  // 老的有 + 新的没有，需要删除属性
  for (let key in oldProps) {
    if (!newProps[key]) {
      el.removeAttribute(key); // 移除真实dom的属性
    }
  }
  // 样式处理  老的 style={color:red}  新的 style={background:red}
  let newStyle = newProps.style || {};
  let oldStyle = oldProps.style || {};
  // 老的样式中有 + 新的没有， 删除老的样式
  for (let key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = "";
    }
  }

  // 新的有 那就直接用新的去做更新即可
  for (let key in newProps) {
    if (key == "style") {
      // {color:red}
      for (let styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName];
      }
    } else if (key == "class") {
      // el.className = el.class;
      el.className = newProps.class;
    } else {
      el.setAttribute(key, newProps[key]);
    }
  }
}
