# Vue源码分析

## 1 确定 Vue入口文件

1 package.json==> npm run build: scripts/build.js

2 scripts/build.js 内容分析==> 
  - 获得打包的配置==> scripts/config.js
  - 根据生成的所有配置使用rollup依次去打包
  - 把打包后的文件写入到dist目录

3 scripts/config.js
  - 设置文件路径映射别名: scripts/ alias.js
  - 入口: web/entry-runtime-with-compiler.js ==> web/entry-runtime.js

4 src/platforms/web/entry-runtime.js ==> 
  src/platforms/web/runtime/index.js ==> 
  src/core/index.js ==> 
  src/core/instance/index.js

5 所以Vue的入口文件，就是 src/core/instance/index.js