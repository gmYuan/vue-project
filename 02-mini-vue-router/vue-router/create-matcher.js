import createRouteMap from "./create-route-map";
import { createRoute } from "./history/base";

export default function createMatcher(routes) {
  // 扁平化路由配置信息
  // pathMap = {'/':Home,'/about':About,'/about/a':'aboutA','/about/b':'aboutB'}
  let { pathMap } = createRouteMap(routes); 

  // 添加路由
  function addRoutes(routes) {
    createRouteMap(routes, pathMap);
  }

  // 用于匹配路径
  function match(locationStr) {
    let record = pathMap[locationStr]; // 可能一个路径有多个记录
    if (record) {
      return createRoute(record, {
        path: locationStr,
      });
    }
    //  这个记录可能没有
    return createRoute(null, {
      path: locationStr,
    });
  }

  return {
    addRoutes,
    match,
  };
	
}
