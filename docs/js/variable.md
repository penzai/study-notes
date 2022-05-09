## 变量

### var 变量

定义会提升到当前作用域顶部，但优先级没有函数高。

待到实际定义处才进行赋值。

示例 1：

```js
console.log(a); // f a() {}

var a = 3;

function a() {}
```

示例 2：

```js
var b;
void (function () {
  var env = { b: 1 };
  b = 2; // 这里实际上是对var b = 3提升上来的b进行赋值
  console.log("In function b:", b); // 2
  with (env) {
    var b = 3;
    console.log("In with b:", b); // 3
  }
})();
console.log("Global b:", b); // undefined
```

### let/const

没有变量提升。不能重复也不能提前使用（连`typeof`也不能使用）。在当前作用域内会进行“一家独大”，就算你在全局上拥有这个变量，也不能提前使用。也叫暂时性死区。

```js
let a = 4;
{
  typeof a; // Uncaught ReferenceError: Cannot access 'a' before initialization
  console.log(a); // Uncaught ReferenceError: Cannot access 'a' before initialization
  let a = 3;
}
```

> var在全局作用域上声明的变量会挂在globalThis上，而let/const声明的不会。

注意常在函数默认参数设置中的死区：

```js
// p2还未定义就使用了
// Uncaught ReferenceError: Cannot access 'p2' before initialization
const fn1 = (p1 = p2, p2 = 3) => {};
fn1();

const fn2 = (p1 = 3, p2 = p1) => {};
fn2();
```

for 循环中，声明块与执行块是不同的作用域，通过以下示例可得出结论。

```js
for (let i = 0; i < 3; i++) {
  let i = "abc";
  console.log(i);
}
// abc 未报不能再次声明错误
// abc
// abc
```

### 解构赋值
destructuring assignment。
- 可用逗号跳过某些值：
``` js
const [,x,,y] = [1,2,3,4] // x: 2 y: 4
```
- 右边支持的是可迭代对象，而不仅仅是Object/Array。
``` js
const [f] = 'hello' // f: 'h'

const m1 = new Map()
m1.set('a', 1)
const [[label, value]] = m1 // label: 'a' value: 1
```
- 解构对象时可使用`:`号进行别名定义。