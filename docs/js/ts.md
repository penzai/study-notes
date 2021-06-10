## Tips

- 转译后的 typescript 与 javascript 无本质的区别，类型注解之类的只会在开发阶段进行报错。
- 基础类型 string/number 而不是 String/Number。

## 类型

### 数组、string、number、boolean、symbol

### 元组（tuple）

数组合并了相同类型的对象，而元组合并了不同类型的对象。

```javascript
let pz: [string, number] = ["penzai", 26];
```

### any

任意类型，一种绕过静态检测的方式，应当尽量减少使用。

任意类型 <=> any 类型。

### unknown

用来描述类型不确定的变量。

任意类型 => unknown 类型，但是不能 unknown 类型只能赋值给 unknown 或者 any 类型。

使用 unknown 类型后，需要缩小类型（Type Narrowing）才能继续使用其操作。

```javascript
let result: unknown;
if (typeof result === "number") {
  result.toFixed(); // 此处 hover result 提示类型是 number，不会提示错误
}
```

### void、undefined、null

void 用来表示没有返回值的函数返回结果类型。而 void 变量一般没什么用处，且它只能再次赋值给 unknown 和 any 类型。

undefined 类型可以赋值给 void 类型。

???我们不建议随意使用非空断言（下面要讲的“类型断言”中会详细介绍非空断言）来排除值可能为 null 或 undefined 的情况，因为这样很不安全。而比非空断言更安全、类型守卫更方便的做法是使用单问号（Optional Chain）、双问号（空值合并），我们可以使用它们来保障代码的安全性，如下代码所示：

### never

表示永远不会发生的类型。比如一个死循环的函数返回值类型。

never 是所有类型的子类型，它可以给所有类型赋值。

可以用来创造接口类型中的只读属性。

### object

## 断言

### 类型断言

类型断言（类似仅作用在类型层面的强制类型转换）告诉 TypeScript 按照我们的方式做类型检查。比如让下面的代码合理运行：

```javascript
const arrayNumber: number[] = [1, 2, 3, 4];
const greaterThan2: number = arrayNumber.find(num => num > 2) as number;
// const greaterThan2: number = <number>arrayNumber.find(num => num > 2);
```

### 常量断言

as const

### 非空断言

!操作符（与 any 一样，尽量少用），使用类型守卫来代替非空断言。
