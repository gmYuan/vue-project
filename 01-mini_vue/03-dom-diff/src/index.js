import { initMixin } from "./init";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./vdom/index";
import { stateMixin } from './state';

import { initGlobalApi } from './global-api/index';

function Vue(options) {
  this._init(options); // 入口方法,做初始化操作
}

// 写成一个个的插件进行对原型的扩展
initMixin(Vue);  // init方法
lifecycleMixin(Vue);  // _update
renderMixin(Vue);  // _render
stateMixin(Vue);   // $nextTick()、$watch()等实现


// 静态方法 Vue.component、Vue.directive、Vue.extend、Vue.mixin ...
initGlobalApi(Vue);


// 为了看到diff的整个流程 创建两个虚拟节点来进行比对操作
import {compileToFunctions} from './compiler/index';
import {createElm,patch} from './vdom/patch'

let vm1 = new Vue({data:{name:'zf'}});
// S1 比较同级节点
// let render1 = compileToFunctions('<div id="a" style="color: red" class="a">{{name}}</div>');

// S2 比较当前子节点
let render1 = compileToFunctions(`<div>
   <li style="background:red" key="A">A</li>
   <li style="background:yellow" key="B">B</li>
   <li style="background:pink" key="C">C</li>
   <li style="background:green" key="D">D</li>
   <li style="background:green" key="F">F</li>
</div>`);

let vnode1 = render1.call(vm1); // render方法返回的是虚拟dom

document.body.appendChild(createElm(vnode1))


let vm2 = new Vue({data:{name:'jg'}});
// S1
// let render2 = compileToFunctions('<div id="b" style="background: yellow" class="b">{{name}}</div>');

// S2
let render2 = compileToFunctions(`<div>
  <li style="background:green" key="M">M</li>
  <li style="background:pink" key="B">B</li>
  <li style="background:yellow" key="A">A</li>
  <li style="background:red" key="Q">Q</li>
</div>`);

let vnode2 = render2.call(vm2);

// 用新的虚拟节点对比老的虚拟节点，找到差异 去更新老的dom元素
setTimeout(() => {
  patch(vnode1,vnode2); // 传入新的虚拟节点和老的 做一个对比
}, 3000);






export default Vue;
