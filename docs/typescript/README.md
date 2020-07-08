## 定义
TypeScript是JavaScript类型的超集，它会编译成纯JavaScript。

在原生上加入了更多的功能和限制，能让你的代码更健壮。
## 类型
- 枚举变量对于number类型的值会进行反向映射

### never类型
never 类型表示的是那些永不存在的值的类型。 例如，never 类型是那些总是会抛出异常或根本就不会有返回值的函数表达式或箭头函数表达式的返回值类型。

可以利用其进行全面性检查：
``` typescript
type Foo = string | number;

function controlFlowAnalysisWithNever(foo: Foo) {
  if (typeof foo === "string") {
  } else if (typeof foo === "number") {
  } else {
    // foo 在这里是 never
    const check: never = foo;
  }
}
```

## 断言
尖括号与as的使用

## 接口
对类的一部分抽象或者对**对象的形状**进行描述
