//  <div id="app">hello {{name}} <span>world</span> <p></p></div>
import { parseHTML } from "./parse.js";
import { generate } from "./generate";


export function compileToFunctions(template) {
  // html模板 => render函数  (ast是用来描述代码的)
  // 1.需要将html代码转化成"ast"语法树 可以用ast树来描述语言本身
  let ast = parseHTML(template);
  // console.log('ast---------', ast)
  
  // 2.优化静态节点

  // 3.通过这课树 重新的生成代码
  let code = generate(ast);
  // console.log('generateCode--', code)

  // 4.将字符串变成函数 限制取值范围 通过with来进行取值 
  // 稍后调用render函数就可以通过改变this 让这个函数内部取到结果了
  let render = new Function(`with(this){return ${code}}`);
  // debugger
  console.log('compileToFunctions里生成的render函数是--', render)
  console.log('------------------------------------------')
  return render;

}
