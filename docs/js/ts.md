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

void 一般只用来表示没有返回值的函数返回结果类型。而 void 变量一般没什么用处，且它只能再次赋值给 unknown 和 any 类型。

undefined 类型可以赋值给 void 类型。

???我们不建议随意使用非空断言（下面要讲的“类型断言”中会详细介绍非空断言）来排除值可能为 null 或 undefined 的情况，因为这样很不安全。而比非空断言更安全、类型守卫更方便的做法是使用单问号（Optional Chain）、双问号（空值合并），我们可以使用它们来保障代码的安全性，如下代码所示：

### never

表示永远不会发生的类型。比如一个死循环的函数返回值类型。

never 是所有类型的子类型，它可以给所有类型赋值。

可以用来创造接口类型中的只读属性。

利用特性进行类型缩减：
``` typescript
type UnionType = {
  age: number
} | {
  age: never,
  [key: string]: string
}

const unionType: UnionType = {
  age: 27,
  name: 'tony'
}
```

### object

### 字面量类型
字符串字面量类型、数字字面量类型、布尔值字面量类型。属于各自集合类型的子类型，是为了更精确的定义类型需要。

### 联合类型`|`、交叉类型`&`
混用时`&`优先级大于`|`。

联合类型会造成类型缩减，可使用` & {}`控制。
``` typescript
type Color = 'red' | string & {}
```

### 类型推断
在各种上下文中，ts能进行一定的类型推断。例如：变量为字面量类型、函数设置了默认值的参数、函数返回值。

> 注意const与let为字面量值时的类型推断不同之处。另外，null与undefined在let时会被推断为any类型（这样我们可以赋予任何其他类型的值给具有 null 或 undefined 初始值的变量 x 和 y。），但是使用后又会被推断为具体的null/undefined。
``` javascript
let x = null // x: any
let x1 = x // x: null
```

### type widening
### type narrowing
方式：类型守卫、控制流语句（if/switch/三目运算符）

## interface
- 使用索引定义时，其它属性需要为索引的子集
``` javascript
interface Dic {
  [key: number]: string,
  age: 3,
  1: 3 // Property '1' of type '3' is not assignable to numeric index type 'string'.ts(2412)
}
```
- 重复定义会叠加，而不是像变量一样被覆盖

## 函数
### this
类型设置为this只能在class以及interface中使用。

### 重载
由上到下依次匹配，因此注意精确的重载项放在前面。

### 类型谓词
???我们通过“参数名 + is + 类型”的格式明确表明了参数的类型，进而引起类型缩小，所以类型谓词函数的一个重要的应用场景是实现自定义类型守卫

## 类
### 修饰符
- public，默认
- private，只在自身类中可用
- protected，仅在自身及子类中可用
- readonly

### 抽象类
abstract属性与方法只定义类型，不实现，子类必须实现。

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

