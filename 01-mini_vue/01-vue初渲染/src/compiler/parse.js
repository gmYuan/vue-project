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

export function parseHTML(htmlContent) {
  html = htmlContent;

  // 只要html不为空字符串就一直解析
  while (html) {
    // 尝试获取 "<" 字符
    let textEnd = html.indexOf("<");
    // 如果当前内容以"<" 字符开头，说明它肯定是一个标签（开始/结束标签）
    if (textEnd == 0) {
      // 尝试匹配是否是开始标签
      const startTagMatch = parseStartTag(); 
      break;
    }
  }
}

function parseStartTag() {
  const start = html.match(startTagOpen);
  console.log('ss', start)
  if (start) {
  }
}
