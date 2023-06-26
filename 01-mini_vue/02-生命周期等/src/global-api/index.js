import { mergeOptions } from "../util";

export function initGlobalApi(Vue) {
  Vue.options = {}; // Vue.components/ Vue.diretive
  Vue.mixin = function (mixin) {
    // 合并对象: 目前先考虑生命周期，不考虑其他的合并 data/ computed/ watch
    // 把 全局Vue.options和 Vue.mixin等进行合并
		this.options = mergeOptions(this.options, mixin);
  };
}
