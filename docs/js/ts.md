## Tips

- 转译后的 typescript 与 javascript 无本质的区别，类型注解之类的只会在开发阶段进行报错。
- 基础类型是 string/number 而不是 String/Number。

## 编译设置
- 默认转换为es3，需要手动设置compilerOptions.target为es2015
- noImplicitAny，不能有隐式推断为any的类型
- strictNullChecks，在使用null和undefined之前，必须检测它。

## 类型

### 分类

#### string、number、boolean、symbol、bigint
原始类型兼容相应的对象类型，反之则不然。

#### null

#### undefined

undefined 类型可以赋值给 void 类型。

严格模式下。null、undefined 表现出与 void 类似的兼容性，即不能赋值给除 any 和 unknown 之外的其他类型，反过来其他类型都不可以赋值给 null 或 undefined。

> ???我们不建议随意使用非空断言（下面要讲的“类型断言”中会详细介绍非空断言）来排除值可能为 null 或 undefined 的情况，因为这样很不安全。而比非空断言更安全、类型守卫更方便的做法是使用单问号（Optional Chain）、双问号（空值合并），我们可以使用它们来保障代码的安全性，如下代码所示： ###数组。例如：`string[]`、`number[]`、`Array<number>`。

#### 元组（tuple）

数组合并了相同类型的对象，而元组合并了不同类型的对象。

```javascript
let pz: [string, number] = ["penzai", 26];
```

#### any

表示任意类型，特性为可以在任意类型与any直接互相赋值，会造成极大的不稳定困扰。

任意类型 => any类型，any类型 => 除了never以外的类型。

尽量减少使用。

any与除了never以外的类型交叉得到的都是any。

#### never

表示永远不会发生的类型。比如一个死循环的函数返回值类型、一个抛出错误的函数返回值类型。

任意类型都不能赋值给never，never类型 => 任意类型。

可以用来创造接口类型中的只读属性。

利用特性进行类型缩减：

```typescript
type UnionType =
  | {
      age: number;
    }
  | {
      age: never;
      [key: string]: string;
    };

const unionType: UnionType = {
  age: 27,
  name: "tony",
};
```
#### unknown

用来描述类型不确定的变量。特性设计为一旦使用此类型，就不能赋值给其它类型，必须保持unknown类型，或者赋值给any类型。

任意类型 => unknown 类型，但是 unknown 类型只能赋值给 unknown 或者 any 类型。

遇见不确定的类型推荐unknown替代any使用。有2个好处：
- unknown类型不可更改为其它类型，这里any暂时不考虑
- 使用准确的类型推断后，可以当作其它类型使用



使用 unknown 类型后，需要缩小类型（Type Narrowing）才能继续使用其操作。

```javascript
let result: unknown;
if (typeof result === "number") {
  result.toFixed(); // 此处 hover result 提示类型是 number，不会提示错误
}
```

#### void

一般只用来表示没有返回值的函数返回结果类型。而 void 变量一般没什么用处。
且它只能再次赋值给 unknown 和 any 类型。

any/never/undefined类型 => void类型，void => any/unknown类型。

#### object、Object
object代表字面量的对象。

大Object代表有toString、hasOwnProperty方法的类型，原始类型、非原始类型都可以赋值给Object，毕竟万物之源。

???{}、大 Object 是比小 object 更宽泛的类型（least specific），{} 和大 Object 可以互相代替，用来表示原始类型（null、undefined 除外）和非原始类型；而小 object 则表示非原始类型。

### 类型断言（type assertion）

告诉 typescript 按照设定的类型进行处理，可以理解为写代码的人帮助 typescript 判断类型了。

### 字面量类型（literal types）

即字符串字面量类型、数字字面量类型、布尔值字面量类型。属于各自集合类型的子类型，是为了更精确的定义类型需要。

### 联合类型`|`、交叉类型`&`

混用时`&`优先级大于`|`。

联合类型会造成类型缩减，可使用`& {}`控制。

```typescript
type Color = "red" | (string & {});
```

### 类型推断

在各种上下文中，ts 能进行一定的类型推断。

#### 变量为字面量类型

注意 const 与 let 为字面量值时的类型推断不同之处。另外，null 与 undefined 在 let 时会被推断为 any 类型（这样我们可以赋予任何其他类型的值给具有 null 或 undefined 初始值的变量 x 和 y。），但是使用后又会被推断为具体的 null/undefined。

```javascript
let v1 = "hello"; // v1: string
const v2 = "hello"; //v2: 'hello'

let x = null; // x: any
let x1 = x; // x: null
```

#### 函数设置了默认值的参数

字面量进行拓宽，但是 null 和 undefined 还是不变，不会推断成 any。

#### 函数返回值

#### 函数类型兼容性
- 返回值。协变。
- 参数类型。逆变。
- 参数个数。个数少的兼容个数多的。
- 可选参数兼容剩余参数、不可选参数。

#### type narrowing 情况

类型守卫、控制流语句（if/switch/三目运算符）

### 类型断言

类型断言（类似仅作用在类型层面的强制类型转换）告诉 TypeScript 按照我们的方式做类型检查。比如让下面的代码合理运行：

```javascript
const arrayNumber: number[] = [1, 2, 3, 4];
const greaterThan2: number = arrayNumber.find(num => num > 2) as number;
// const greaterThan2: number = <number>arrayNumber.find(num => num > 2);
```

#### 常量断言

as const

#### 非空断言

!操作符（与 any 一样，尽量少用），使用类型守卫来代替非空断言。因为相当于你自己保证了这个值不可能是null或者undefined，可是又拿什么来保证呢。

### 工具类型
- Partial、Required、Readonly
``` typescript
type Partial<T> = {
  [P in keyof T]?: T[P]
}

type Required<T> = {
  [P in keyof T]-?: T[P]
}

type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}
```
- Pick、Omit。返回的是提取/去除属性值后的数据。
``` typescript
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>

```
> keyof any指代可以作为对象键的类型，即`string | number | symbol`。但是js本身还是会在对象数据结构里把number类型key转为string。
- Exclude、Extract。返回的是提取/去除后的属性值。
``` typescript
type Exclude<T, U> = T extends U ? never : T

type Extract<T, U> = T extends U ? T : never;
```
- NonNullable
``` typescript
type NonNullable<T> = T extends null | undefined ? never : T
```
- Record
``` typescript
type Record<K extends keyof any,  T> = {
  [P in K]: T
}
```
- ConstructorParameters。返回的是元组类型tuple。
``` typescript
type ConstructorParameters<T extends new (...args: any) => any> = T extends new (...args: infer P) => any ? P : never
```
- Parameters、ReturnType、ThisParameterType
``` typescript
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

type ThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any ? U : unknown;

```
- ThisType???。ThisType 工具类型只是提供了一个空的泛型接口，仅可以在对象字面量上下文中被 TypeScript 识别。
``` typescript
interface ThisType<T> {}
```
- OmitThisParameter。用来去除函数类型中的 this 类型
``` typescript
type OmitThisParameter<T> = unknown extends ThisParameterType<T> ? T : T extends (...args: infer A) => infer R ? (...args: A) => R ? T;
```
- 字符串类型Uppercase、Lowercase、Capitalize、Uncapitalize
## interface
命名对象类型的另一种方式，方便扩展。
- 使用索引定义时，其它属性需要为索引的子集

```javascript
interface Dic {
  [key: number]: string;
  age: 3;
  1: 3; // Property '1' of type '3' is not assignable to numeric index type 'string'.ts(2412)
}
```

- 重复定义会叠加，而不是像变量一样被覆盖
- 在 TypeScript 4.2 以前，类型别名的名字可能会出现在报错信息中，有时会替代等价的匿名类型（也许并不是期望的）。接口的名字则会始终出现在错误信息中。
- 类型别名也许不会实现声明合并，但是接口可以
- 接口可能只会被用于声明对象的形状，不能重命名原始类型
- 接口通过名字使用的时候，他们的名字会总是出现在错误信息中，如果直接使用，则会出现原始结构

## 函数

### this

类型设置为 this 只能在 class 以及 interface 中使用。

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

abstract 属性与方法只定义类型，不实现，子类必须实现。


## 枚举类型

### 字面量枚举成员

对于成员为缺省值（自动从 0 开始）、数字字面量、字符串字面量的枚举类型，称之为字面量枚举。

字面量枚举成员，即代表了值，又代表了类型。而非字面量只代表了值。

```typescript
enum Day {
  MONDAY = 7,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
  SUNDAY,
}

enum MyDay {
  SUNDAY,
  MONDAY = Day.MONDAY,
}

const v2 = Day.SATURDAY; // v2: Day.SATURDAY

const v1 = MyDay.MONDAY; // v1: MyDay
const v3 = MyDay.SUNDAY; // v3: MyDay
```

### 常量枚举

转移后引用处代码会被替换为枚举值，因此只支持字面量设置。一般用来提高代码的可读性。

### 外部枚举

## 泛型

泛型指类型参数化，即将原来的某种具体类型进行参数化。与定义函数参数类似，给泛型定义若干个类型参数，在调用时再传入具体的类型参数，就得到了我们想要类型关系。

泛型的目的在于有效约束类型成员之间的关系。比如在函数参数、函数返回值、类接口成员和方法。

### 泛型类型参数

用在函数的参数里。

### 泛型类

用在类中。

### 泛型类型

用在类型设置中。
???这种写法

```typescript
interface IReflectFuncton {
  <P>(param: P): P;
}
```

#### 分配条件类型

在条件类型判断的情况下（比如 extends），如果入参是联合类型，则会被拆解成一个个独立的（原子）类型（成员）进行类型运算。

```typescript
type StringOrNumberArray<E> = E extends string | number ? E[] : E;
type BooleanOrString = string | boolean;
type WhatIsThis = StringOrNumberArray<BooleanOrString>; // boolean | string[]
type BooleanOrStringGot = BooleanOrString extends string | number
  ? BooleanOrString[]
  : BooleanOrString; // 未使用泛型，因此是string | boolean
```
> 注意never的特殊性，never在extends关键字左侧被视为原子类型时，整个类型返回never，否则按照正常逻辑调用。
``` ts
type T3 = never extends number ? number[] : never extends string ? string[] : never; // number[];

type WhatIs1<T> = T extends number ? number[] : T extends string ? string[] : never;
type T1 = WhatIs1<never>; // never

type WhatIs2<T> = [T] extends [number] ? number[] : [T] extends [string] ? string[] : never;
type T2 = WhatIs2<never>; // number[]
```
### 泛型约束

把泛型入参限定在一个相对更明确的集合内。

## 类型守卫
常用类型守卫：switch、===、typeof、instanceof、in、自定义类型守卫。
``` typescript
type Dog = {
  wang: string
}
type Cat = {}

const isDog = function(animal: Dog | Cat): animal is Dog {
  return 'wang' in animal
}

const getName = (animal: Dog | Cat) => {
  if(isDog(animal)) {
    return animal.wang
  }
}
```

在面对泛型时，in 和 instanceOf、类型谓词在泛型类型缩小上是有区别的。
``` typescript
const getName = <T extends Dog | Cat>(animal: T) => {
  if ('wang' in animal) {
    return animal.wang; // ts(2339)
  }
  return animal.miao; // ts(2339)
};

const getName2 = <T extends Dog | Cat>(animal: T) => {
  if (isDog(animal)) { // instanceOf 亦可
    return animal.wang; // ok
  }
  return animal.miao; // ts(2339)
};
```

## 类型断言
as

## 工具类
- `in`、`keyof`只能在类型别名定义中使用。
- 配置中合理使用严格模式，降低心智负担。strictFunctionTypes、strictNullChecks。
