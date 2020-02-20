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

```javascript
const MyCall = function(context = window, ...args) {
  context.fn = this;
  const ret = context.fn(...args);
  delete context.fn;
  return ret;
};
const MyApply = function(context = window, args) {
  context.fn = this;
  const ret = context.fn(...args);
  delete context.fn;
  return ret;
};
```

## bind

- 注意新函数使用 new 操作符的情况，需要
  - 灵活调整 apply 方法的 this 指针
  - 设置 prototype

```javascript
const myBind = function(obj, ...args) {
  const F = this;
  function ret(...args2) {
    F.apply(this instanceof ret ? this : obj, [...args, ...args2]);
  }
  ret.prototype = this.prototype;
  return ret;
};
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

限制时间内只允许发生一次事件，例子：搜索框输入后自动请求

```javascript
function debounce(fn, delay, immediate) {
  let timer;
  return function(...args) {
    if (immediate) {
      fn.apply(this, args);
    }
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
```

### throttle

让事件限制在一定频率范围内。例子： 鼠标移动时触发事件

```javascript
function throttle(fn, delay, immediate) {
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
