const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 标签名
// ?:匹配不捕获
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // </my:xx>
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的    aaa="aaa"  a='aaa'   a=aaa
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >    >   <div></div>  <br/>
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配中括号{{}}

// 数据结构 树、栈、链表、队列、
let html = "";
let root;
let currentParent;
let stack = [];

// 解析html字符串
export function parseHTML(htmlContent) {
  // 每次重新生成vnode时都先重置值，防止上一次有干扰
  root = null, currentParent = null, stack = [];
  html = htmlContent;
  // debugger

  // 只要html不为空字符串就一直解析
  while (html) {
    let text;
    // 尝试获取 "<" 字符
    let textEnd = html.indexOf("<");
    // 如果当前内容以"<" 字符开头，说明它肯定是一个标签（开始/结束标签）
    if (textEnd == 0) {
      // 尝试匹配 是否是开始标签
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        // console.log("处理完开始标签的html--", html);
        continue;
      }
      // 尝试匹配 是否是结束标签
      const endTagMatch = html.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        end(endTagMatch[1]); // 将结束标签传入
        // console.log("处理完结束标签的html--", html);
        continue;
      }
    }
    // 简化的情况下，说明此时的字符内容是 文本类型
    if (textEnd > 0) {
      text = html.substring(0, textEnd);
    }
    if (text) {
      // 处理文本
      advance(text.length);
      chars(text);
      // console.log("处理完文本类型的html--", html);
    }
    // break;
  }

  // console.log('最后生成的AST树--', root)
  return root;
}

// 解析开始标签
function parseStartTag() {
  const start = html.match(startTagOpen);
  // 如果start命中，说明是开始标签
  if (start) {
    // console.log('start', start)
    const match = {
      tagName: start[1],
      attrs: [],
    };
    // debugger
    // 获取到 "<div" 里的div后，就删除开始标签("<div")
    advance(start[0].length);
    // console.log('html--', html)

    // 如果直接是闭合标签了 说明没有属性
    let end, attr;
    // 不是结尾标签 && 能匹配到属性
    while (
      !(end = html.match(startTagClose)) &&
      (attr = html.match(attribute))
    ) {
      // attrs的value,可能分别是正则匹配组的第3/4/5个索引值
      match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] });
      // 处理/缓存下了开始标签里的属性后，就去掉当前属性对应的 字符内容
      advance(attr[0].length);
    }
    // 如果匹配到开始标签的结束字符，就删除它 ">" + 返回开始标签的缓存对象
    if (end) {
      // console.log('end--', end)
      advance(end[0].length);
      return match;
    }
  }
}

// 将字符串进行截取操作 在更新html内容
function advance(n) {
  html = html.substring(n);
}

// 创建AST单个节点
function createASTElement(tagName, attrs) {
  // debugger
  return {
    tag: tagName, // 标签名
    type: 1, // 元素类型
    children: [], // 孩子列表
    attrs, // 属性集合
    parent: null, // 父元素
  };
}

function start(tagName, attrs) {
  // 创建一个AST元素节点 + 如果没有根元素，就把它作为根元素
  let element = createASTElement(tagName, attrs);
  if (!root) {
    root = element;
  }
  // 当前解析的标签 保存起来，用于之后构建树形关系
  currentParent = element;
  // 将生成的单个ast元素节点放到栈中
  stack.push(element);
}
// 创建文本类型的AST节点 + 作为子节点放入到父节点中
function chars(text) {
  text = text.trim();
  if (text) {
    currentParent.children.push({
      type: 3,
      text,
    });
  }
}

// <div> <p></p> hello</div>    currentParent=p
// 处理结束标签的情况： 创建父子关系
function end(tagName) {
  // 在结尾标签处 创建父子关系
  let element = stack.pop(); // 取出栈中的最后一个AST元素节点
  currentParent = stack[stack.length - 1];
  if (currentParent) {
    // 在闭合时可以知道这个标签的父亲是谁
    element.parent = currentParent;
    currentParent.children.push(element);
  }
}
