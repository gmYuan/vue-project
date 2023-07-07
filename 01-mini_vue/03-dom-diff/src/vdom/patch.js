export function patch(oldVnode, vnode) {
  // 默认初始化时 是直接用虚拟节点创建出真实节点来 替换掉老真实节点
  // 第1次渲染：oldVnode: id#app;  vnode: 生成的虚拟dom
  if (oldVnode.nodeType === 1) {
    let el = createElm(vnode); // 产生真实的dom
    let parentElm = oldVnode.parentNode; // 获取老的app的父亲 => body
    parentElm.insertBefore(el, oldVnode.nextSibling); // 当前的真实元素插入到app的后面
    parentElm.removeChild(oldVnode); // 删除老的节点
    console.log("el是---", el);
    console.log("------------------------------------");
    // debugger
    return el;
  } else {
    
    console.log('patch999-----', oldVnode, vnode)
    // 在更新的时 拿老的虚拟节点 和 新的虚拟节点做对比 
    // 将不同的地方更新真实的dom


  }
}

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

function updateProperties(vnode) {
  let el = vnode.el;
  let newProps = vnode.data || {};
  for (let key in newProps) {
    if (key == "style") {
      // {color:red}
      for (let styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName];
      }
    } else if (key == "class") {
      el.className = el.class;
    } else {
      el.setAttribute(key, newProps[key]);
    }
  }
}
