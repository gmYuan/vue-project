import { initMixin } from "./init";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./vdom/index";
import { initGlobalApi } from './global-api/index';

function Vue(options) {
  this._init(options); // 入口方法,做初始化操作
}

// 写成一个个的插件进行对原型的扩展
initMixin(Vue);  // init方法
lifecycleMixin(Vue);  // _update
renderMixin(Vue);  // _render

// 静态方法 Vue.component、Vue.directive、Vue.extend、Vue.mixin ...
initGlobalApi(Vue);


export default Vue;
