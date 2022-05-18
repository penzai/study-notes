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

## 策略模式
当一个算法分支很多时，就可以考虑策略模式。**把并列的算法拆出来单独放在一起（策略对象），执行逻辑单独一处**。这样就分别独立了开来。比如表单校验。

利用到了组合、委托和多态的思想。

当然在js中，函数作为一等公民，很多策略其实就是函数。而非面向对象语言里的一个类实例。