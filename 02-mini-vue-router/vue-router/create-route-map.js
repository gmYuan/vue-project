export default function createRouteMap(routes, oldPathMap) {
  let pathMap = oldPathMap || Object.create(null);
  routes.forEach((route) => {
    addRouteRecord(route, pathMap);
  });
  return {
    pathMap,
  };
}

// 先序深度遍历
function addRouteRecord(route, pathMap, parent) {
  let path = parent ? `${parent.path}/${route.path}` : route.path;
  let record = {
    path,
    component: route.component,
    parent, //  这个属性用来标识当前路由的父亲是谁
  };
  if (!pathMap[path]) {
    // 不能定义重复的路由 否则只生效第一个
    pathMap[path] = record;
  }
  if (route.children) {
    route.children.forEach((childRoute) => {
      // 在遍历儿子时，将父节点的record对象信息 传入进去
      addRouteRecord(childRoute, pathMap, record);
    });
  }
}
