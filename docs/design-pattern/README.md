# 设计模式

## 基本原则

- 单一职责

## 单例模式

注意惰性的引入。

```js
const createSingleton = function (fn) {
  let instance;

  return function (...args) {
    return instance || (instance = fn.apply(this, args));
  };
};
```

## 策略模式

当一个算法分支很多时，就可以考虑策略模式。**把并列的算法拆出来单独放在一起（策略对象），执行逻辑单独一处**。这样就分别独立了开来。比如表单校验。

利用到了组合、委托和多态的思想。

当然在 js 中，函数作为一等公民，很多策略其实就是函数。而非面向对象语言里的一个类实例。

## 代理模式

### 保护代理

### 缓存代理

### 虚拟代理

一些开销大的操作等待代理觉得可以执行了的时候才去执行。

### 面向对象设计的原则

- SRP（single responsibility principle），单一职责原则。
- OCP（open closed principle），开放封闭原则。
  > 一个软件实体应该对扩展进行开发，对修改进行封闭。你设计的模块应该从不改变。当需求发生变化时，你可以通过添加新的代码来扩展这个模块的行为（react 以前的 HOC），**而不去更改那些已经存在的可以工作的代码**。
- LSP（liskov substitution principle），里氏替换原则。
- ISP（interface segregation principle），接口分离原则。
- DIP（dependency inversion principle），依赖倒置原则。
- LKP（least knowledge principle），最少只是原则。
