## 作用域
作用域意为特定的范围，在js中提起，我们常常指查找变量的这个范围。

ES6增加了通过let和const声明变量的块级作用域。会存在一定的暂时性死区TDZ（temporal dead zone），即声明之前是不能使用变量的；另外，函数的默认值赋值操作也会受到死区影响，尽管函数参数是用var声明，但依然产生了类似let声明的死区效果。
``` js
function foo(a = b, b) {
  console.log(a, b)
}

foo(undefined, 4) // Cannot access 'b' before initialization
```
## 执行上下文
执行js代码分为两个阶段。
- **代码预编译阶段**。区别于其他编程语言的编译，在这里js引擎会做一些“预备工作”；作用域在这个阶段确定好，作用域链此时并没有完全创建完成（只是创建了变量对象，但是未赋值）。
  - 变量声明
  - 变量提升
  - 非表达式函数声明提升
- **代码执行阶段**。执行代码逻辑，开始创建对应的执行上下文。作用域链在这个阶段完全创建完成，变量对象VO(variable object) -> AO(active object)。

执行上下文就是当前代码的执行环境，包含三部分内容。
- 变量对象
- 作用域链
- this

## 调用栈
即函数调用栈。函数执行完毕并出栈时，函数内的局部变量在下一个垃圾回收（GC）节点会被回收，该函数对应的执行上下文将会被销毁。

## 闭包
函数嵌套函数时，内层函数引用了外层函数作用域下的变量，并且内层函数在全局环境下可访问，进而形成闭包。

## 内存管理
计算机内存空间分为两类：栈空间、堆空间。
- 栈空间，一般由操作系统自动分配与释放。例如存放函数的参数值以及局部变量值等。操作方式类似于数据结构“栈”。
- 堆空间，需要专门来释放（在js里是宿主浏览器的垃圾回收机制）。
> 分配内存和读写内存在所有语言中较为相似，释放内存则不太一样。

## 执行上下文（旧）

当我们执行一个方法时，JavaScript 会生成一个与这个方法对应的执行环境，又叫执行上下文。这个执行环境中有这个方法的私有作用域、上层作用域的指向、方法的参数、私有作用域中定义的变量以及 this 对象。这个执行环境会被添加到一个内存对象栈中，这个栈就是执行栈。

如果在这个方法的代码执行中，遇到了函数调用语句，那么 JavaScript 会生成这个函数的执行环境并将其添加到执行栈中，然后进入这个执行环境来执行其中的函数代码。执行完毕后，JavaScript 会退出执行环境并把这个执行环境从栈中销毁，回到上一个方法的执行环境。

执行上下文在 ES3 中，包含三个部分。

- scope：作用域，也常常被叫做作用域链。
- variable object：变量对象，用于存储变量的对象。
- this value：this 值。

在 ES5 中，我们改进了命名方式，把执行上下文最初的三个部分改为下面这个样子。

- lexical environment：词法环境，当获取变量时使用。
- variable environment：变量环境，当声明变量时使用。
- this value：this 值。

> for 循环中如果你使用了 let 而不是 var，let 的变量除了作用域是在 for 区块中，而且会为每次循环执行建立新的词法环境(LexicalEnvironment)，拷贝所有的变量名称与值到下个循环执行。

在 ES2018 中，执行上下文又变成了这个样子，this 值被归入 lexical environment，但是增加了不少内容。

- lexical environment：词法环境，当获取变量或者 this 值时使用。
- variable environment：变量环境，当声明变量时使用。
- code evaluation state：用于恢复代码执行位置。
- Function：执行的任务是函数时使用，表示正在被执行的函数。
- ScriptOrModule：执行的任务是脚本或者模块时使用，表示正在被执行的代码。
- Realm：使用的基础库和内置对象实例。
- Generator：仅生成器上下文有这个属性，表示当前生成器。

> Realm 即领域，国度的意思。例如两个不同 iframe 属于不同的 realm，此时一些对象并不是共用的。

```javascaript
var iframe = document.createElement('iframe')
document.documentElement.appendChild(iframe)
iframe.src="javascript:var b = {};"
var b1 = iframe.contentWindow.b;
var b2 = {};
console.log(typeof b1, typeof b2); //undefined object
console.log(b1 instanceof Object, b2 instanceof Object); //false true
```

### 作用域提升

浏览器的的实现保留了以前的旧的规则（为了兼容性老代码），又加入了新的规则。

这里引入两个概念，旧世界作用域：**函数作用域**和**全局作用域**（仔细一想其实就一个）。新世界作用域：旧世界上加一个**块级作用域**。



#### 函数声明

稍显复杂，大概规则：

- 规则 1：函数声明的定义，就是指具名函数变量的定义会提升到最近的旧世界作用域。
- 规则 2：函数声明的实体，即赋值操作，会在最近的新世界作用域中赋值。

示例 1：

```js
if (true) {
  function f() {}
}

console.log(f); //？
```

即:

```js
var f;
if (true) {
  f = function () {};
}

console.log(f); //ƒ f() {}
```

示例 2：

```js
function f() {
  console.log("f1");
}

(function () {
  if (true) {
    function f() {
      console.log("f2");
    }
  }
  f(); // ？
})();

f(); // ？
```

即：

```js
var f = (function () {
  console.log("f1");
})(function () {
  var f;
  if (true) {
    f = function () {
      console.log("f2");
    };
  }
  f(); // "f2"
})();

f(); // "f1"
```

示例 3：

```js
console.log(fn); // ?
fn(); // ?
{
  fn(); // ?
  function fn() {
    console.log("hello");
  }
  fn(); // ?
}
fn(); // ?
```

即：

```js
var fn; // 规则1
console.log(fn); //undefined
fn(); // 报错 fn is not fucntion
{
  fn = function () {
    console.log("hello");
  }; // 规则2
  fn(); //hello
  fn(); //hello
}
fn(); //hello
```

???示例 4：

```js
{
  function foo() {}
  foo = 1;
  function foo() {}
  foo = 2;
}
console.log(foo); // 1
```

示例：
"具有名称的函数表达式"会在外层词法环境和它自己执行产生的词法环境之间产生一个词法环境，再把自己的名称和值当作变量塞进去。

```javascript
var b = 10;
(function b() {
  b = 20;
  console.log(b); // [Function: b]
})();
```

所以这里的 b = 20 并没有改变外面的 b，而是试图改变一个只读的变量 b。

### 闭包

闭包是一个绑定了执行环境的函数。

而这个执行环境你可能不想与任何其他执行环境共享，因此自己绑定了一个私有的执行环境。

### this

- 谁调用就指向谁，没有调用就指向全局对象（严格模式下指向`undefined`）。
- node中，this指向`module.exports`。

### 变量对象

跟执行上下文相关的一个隐式对象。包含：

- 变量声明（VariableDeclaration）
- 函数声明（FunctionDeclaration）
- 形参

#### 全局对象

VO === this === global

在浏览器中，全局对象的 window 属性指向了全局对象，而不是 window 就是全局对象，如下:

```javascript
global = {
  Math: <...>,
  String: <...>
  ...
  ...
  window: global
};
```

> 在全局上，变量声明与未声明的区别在于，声明的变量不能被 delete 删除（eval 中定义的可以删除），而因为未声明被挂载到 global 的变量可以删除。

#### 函数上下文中的变量对象

VO === AO

```javascript
AO = {
  arguments: {
    callee: 当前函数的引用,
    length: 实参的个数，
    properties-indexes：
  }
};
```

arguments 对象的 properties-indexes 的值与当前（实际传递的）形参是共享的，修改一个，另一个跟着变，但是未传入的参数不共享。例如函数形参 3 个，实参 2 个，那么 arguments[2]与 z 各是个的值，而 arguments[0]与 x 则共享。

#### 处理上下文代码的 2 个阶段

1. 进入执行上下文。依代码顺序在变量对象上填充属性，对于函数声明，直接增加 key 赋值 value，并且重名替换。对于形参与变量声明，增加 key 赋值 undefined，但是重名忽略。
2. 执行代码
