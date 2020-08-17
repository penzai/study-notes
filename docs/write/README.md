# js 手写系列

## new

- 链接原型链
- 构造函数体返回值验证

```javascript
const myNew = (F, ...args) => {
  const obj = {};
  obj.__proto__ = F.prototype;
  const ret = F.apply(obj, args);
  if (typeof ret === "function" || (typeof ret === "object" && ret !== null)) {
    return ret;
  } else {
    return obj;
  }
};
```

## JSON.stringify

- undefined、任意的函数以及 symbol 值在对象中会被忽略，在数组中会被转换成 null
- 对象拥有 toJSON 方法，转化 toJSON()的返回值

```javascript
const MyStringify = data => {
  if (typeof data === "string") return `"${data.toString()}"`;
  if (typeof data === "boolean") return data.toString();
  if (typeof data === "number") {
    return Object.is(data, NaN) ? "null" : data.toString();
  }
  if (data === null) return "null";
  if (typeof data === "object") {
    if (data.toJSON) return MyStringify(data.toJSON());
    if (Object.prototype.toString.call(data) === "[object Array]") {
      let ret = "[";
      for (let i = 0; i < data.length; i++) {
        if (i !== 0) ret += ",";
        if (data[i] === undefined || data[i] === null) {
          ret += "null";
        } else if (typeof data[i] === "string") {
          ret += `"${data[i].toString()}"`;
        } else {
          ret += `${MyStringify(data[i])}`;
        }
      }
      ret += "]";
      return ret;
    }

    if (Object.prototype.toString.call(data) === "[object Object]") {
      let ret = "{";
      for (let k in data) {
        if (data[k] === undefined) continue;
        ret += `"${k}":`;
        if (typeof data[k] === "string") {
          ret += `"${data[k]}",`;
        } else {
          ret += `${MyStringify(data[k])},`;
        }
      }
      ret = ret.slice(0, -1);
      ret += "}";
      return ret;
    }
  }
};
```

## JSON.parse

```javascript
const MyParse = str => new Function(`return ${str}`)();
```

## call/apply
帮助进行一次函数调用，可以想象成正向代理，目的是调整this指针的指向

```javascript
const MyCall = function (context = window, ...args) {
  const p = Symbol('unique property')
  context[p] = this
  const ret = context[p](...args)
  delete context[p]
  return ret
}

const MyApply = function(context = window, args) {
  const p = Symbol('unique property')
  context[p] = this
  const ret = context[p](...args)
  delete context[p]
  return ret
};
```

## bind
生成一个新的函数，可以想象成反向代理，目的是调整this指针的指向
- 注意新函数使用 new 操作符的情况，需要
  - 灵活调整 apply 方法的 this 指针
  - 设置 prototype

```javascript
const MyBind = function (context = window, ...args) {
  const fn = this
  const newFn = (...args2) => {
    return fn.call(this instanceof newFn ? this : context, ...[...args, ...args2])
  }
  newFn.prototype = Object.create(fn.prototype)
  return newFn
}
```

## 继承

```javascript
function Parent() {}

function Child() {
  Parent.call(this);
}
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;
```

## 柯里化

```javascript
const MyCurry = (fn, arr = []) => (...args) =>
  (arg => (arg.length === fn.length ? fn(...arg) : curry(fn, arg)))([
    ...arr,
    ...args
  ]);
```

## promise
注意一下几点：

- 链式调用情况。
  - 针对`p.then(fn1); p.then(fn2);`类，在resolve方法的遍历里面处理。
  - 针对`p.then(fn1).then(fn2);`类，需要在then方法中返回一个新的实例p2，下一个then方法挂在p1上，后面依次类推；
> 对于fn1方法的封装执行，手写Promise只能使用setimeout来模拟异步，这样会造成fn1,fn2并不是一起放在微队列的（中间隔了一次宏任务setimeout），而实际js引擎内部则会把其放在一个微队列中。
- 每一次回调检测状态(状态发生变更，要立即执行对应的操作)。
- 处理同步情况（必须让resolve发生在then之后）。


```javascript
function MyPromise(fn) {
  const _this = this;
  this.status = "pending";
  this.value = "";
  this.reason = "";
  this.onFulfilledCallbacks = [];
  this.onRejectedCallbacks = [];

  const resolve = function(value) {
    if (_this.status !== "pending") return;
    _this.status = "resolved";
    _this.value = value;
    _this.onFulfilledCallbacks.forEach(cb => {
      cb(value);
    });
  };
  const reject = function(reason) {
    if (_this.status !== "pending") return;
    _this.status = "rejected";
    _this.reason = reason;
    _this.onRejectedCallbacks.forEach(cb => {
      cb(reason);
    });
  };

  try {
    fn(resolve, reject);
  } catch (e) {
    reject(e);
  }
}

MyPromise.prototype.then = function(onFulfilled, onRejected) {
  onFulfilled =
    typeof onFulfilled === "function"
      ? onFulfilled
      : function(x) {
          return x;
        };
  onRejected =
    typeof onRejected === "function"
      ? onRejected
      : function(e) {
          throw e;
        };
  let self = this;
  let promise2;
  switch (self.status) {
    case "pending":
      promise2 = new MyPromise(function(resolve, reject) {
        self.onFulfilledCallbacks.push(function() {
          setTimeout(function() {
            try {
              let temple = onFulfilled(self.value);
              resolvePromise(promise2, temple, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
        self.onRejectedCallbacks.push(function() {
          setTimeout(function() {
            try {
              let temple = onRejected(self.reason);
              resolvePromise(promise2, temple, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
      });
      break;
    case "resolved":
      promise2 = new MyPromise(function(resolve, reject) {
        setTimeout(function() {
          try {
            let temple = onFulfilled(self.value);
            resolvePromise(promise2, temple, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      });
      break;
    case "rejected":
      promise2 = new MyPromise(function(resolve, reject) {
        setTimeout(function() {
          try {
            let temple = onRejected(self.reason);
            resolvePromise(promise2, temple, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      });
      break;
    default:
  }
  return promise2;
};

function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    throw new TypeError("type error");
  }
  let isUsed;
  if (x !== null && (typeof x === "object" || typeof x === "function")) {
    try {
      let then = x.then;
      if (typeof then === "function") {
        //是一个promise的情况
        then.call(
          x,
          function(y) {
            if (isUsed) return;
            isUsed = true;
            resolvePromise(promise, y, resolve, reject);
          },
          function(e) {
            if (isUsed) return;
            isUsed = true;
            reject(e);
          }
        );
      } else {
        //仅仅是一个函数或者是对象
        resolve(x);
      }
    } catch (e) {
      if (isUsed) return;
      isUsed = true;
      reject(e);
    }
  } else {
    //返回的基本类型，直接resolve
    resolve(x);
  }
}

MyPromise.deferred = function() {
  let dfd = {};
  dfd.promise = new MyPromise(function(resolve, reject) {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};
```

## 防抖（debounce）和节流（throttle）

### debounce

限制时间内只允许发生一次事件，例子：搜索框输入后自动请求。

> leading 为 true 时，如果在间隔时间内未发生第二次操作，则不会执行 trailing edge of the timeout 的事件。

```javascript
const debounce = (fn, wait, options) => {
  let timer;
  let leading = false; // timeout设定前是否执行
  let trailing = true; // timeout延时后是否执行
  let maxing = false;
  let time;
  if (Object.prototype.toString.apply(options) === "[object Object]") {
    leading = "leading" in options ? !!options.leading : leading;
    trailing = "trailing" in options ? !!options.trailing : trailing;
    maxing = "maxWait" in options; // 间隔是否有最大值限制
    maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait;
  }

  return function(...args) {
    const context = this;
    const isFirst = !timer; // 是否第一次调用函数
    const now = Date.now();
    if (timer) clearTimeout(timer);
    if (isFirst) time = now;

    const isImmediateContext = isFirst && leading; // 是否是立即执行环境
    if (isImmediateContext) fn.apply(context, args);

    const isMustContext = maxing && now - time > maxWait; // 是否是最大值必须执行环境
    if (isMustContext) {
      fn.apply(context, args);
      time = now; // 执行第一进入的动作，设置初始时间
    }

    timer = setTimeout(() => {
      timer = null;
      // 不是立即执行环境和最大值必须执行环境的“timeout延时后”则执行fn
      if (!isImmediateContext && !isMustContext && trailing)
        fn.apply(context, args);
    }, wait);
  };
};
```

### throttle

让事件限制在一定频率范围内。例子： 鼠标移动时触发事件。

简单版：

```javascript
function throttle1(fn, delay, immediate) {
  let lastTime = new Date();
  return function(...args) {
    if (immediate) {
      fn.apply(this, args);
    }
    if (new Date() - lastTime > delay) {
      fn.apply(this, args);
      lastTime = new Date();
    }
  };
}

function throttle2(func, wait) {
  var timer;
  return function(...args) {
    if (!timer) {
      timer = setTimeout(function() {
        timer = null;
        func.apply(this, args);
      }, wait);
    }
  };
}
```

标准版：

```javascript
const throttle = (fn, wait, options) => {
  let
    leading = true,
    trailing = true;

  if (Object.prototype.toString.apply(options) === '[object Object]' {
    leading = "leading" in options ? !!options.leading : leading;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    leading: leading,
    maxWait: wait,
    trailing: trailing
  });
}

```

## 深拷贝

```javascript
const MyCopy = obj => {
  const type = Object.prototype.toString
    .call(obj)
    .slice(8, -1)
    .toLowerCase();

  if (["object", "array"].includes(type)) {
    const ret = type === "object" ? {} : [];
    for (let k in obj) {
      ret[k] = MyCopy(obj[k]);
    }
  }

  return obj;
};
```

## instanceOf

```javascript
const MyInstanceOf = (child, Parent) => {
  const proto = child.__proto__;
  if (proto === null) return false;
  if (proto === Parent.prototype) return true;
  return MyInstanceOf(proto, Parent);
};
```
