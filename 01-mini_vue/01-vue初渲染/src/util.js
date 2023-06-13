export function defineProperty(target,key,value){
    Object.defineProperty(target,key,{
        enumerable:false, // 不能被枚举，不能被循环出来
        configurable:false,
        value
    });
}