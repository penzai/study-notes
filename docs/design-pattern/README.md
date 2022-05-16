# 设计模式
## 基本原则
- 单一职责
## 单例模式
注意惰性的引入。
``` js
const createSingleton = function (fn) {
  let instance

  return function (...args) {
    return instance || (instance = fn.apply(this, args))
  }
}
```