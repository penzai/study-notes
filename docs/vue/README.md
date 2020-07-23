# Vue
## vue源码
### 优雅的地方

- 对于要收集的依赖，挂载到Dep.target上，避免了全局变量的使用
- 没有在每个依赖发生的具体地方直接赋值Dep.target来进行依赖收集，而是建立了Watcher类来统一管理并归类所有依赖

### 设计模式
#### 发布订阅模式
- 发布者
- 订阅者
- 信号中心

vue中的自定义事件以及node中的事件机制都是基于此模式。
#### 观察者模式
响应式机制运用了观察者模式。
- 发布者（目标）
- 订阅者（观察者）

发布订阅模式通过信号中心统一调度，观察者模式通过发布者自己触发订阅者的行为（互相依赖性更强）。

## Virtual DOM
DOM对象很庞大，创建代价高，所以就由普通的js对象来描述DOM对象。

DOM频繁操作还会引起性能问题，于是把一系列操作改成立即操作VirtualDOM，最终通过diff算法，来进行比对前后的VirtualDOM区别，来进行有效的更新DOM。

> diff算法只针对于同级

>某些简单情况，使用VirtualDOM还会变慢（多了创建和比对步骤）。
#### 应用
跨平台（移动端、小程序）、SSR

### diff算法
对于识别出来的不同元素，算法并不会单纯的把原来的删除，然后建立新的，而是会重用dom本身，再进行一些数据设置，所以当一个dom的其它特性被修改时，又没有跟数据本身关联（比如checked效果、你自己设置的dom属性），那么重用的元素依然保留该效果。

例如一个没有设置key的li列表，当list数据变化时，checkbox的勾选状态并不会跟着数据走，如果是第一个li标签，就一直是第一个li标签被选中。
```
<ul>
  <li v-for="item in list">
    <input type="checkbox">
    {{ item }}
  </li>
</ul>
```

> 所以在动态子节点中，一个独立的key尤为重要！！！
## 生命周期

### 创建阶段

- `beforeCreate` 钩子
- injections ➡️prop ➡️methods ➡️data ➡️computed ➡️ watch ➡️ provide
- `created`
- 模板编译到 render 函数(vNode)
  > 注：这个时候还未执行模板里的代码，只是编译成 render 函数。如果写了 render 函数，那么自动跳过这一步。
- `beforeMount` 钩子
- render 函数代码执行
- `mounted` 钩子

### 更新阶段

- 依赖变更(或者执行`$forceUpdate`方法)
- `beforeUpdate`
- render 函数代码执行
- `updated`

### 销毁阶段

- `beforeDestroy`
- `destroyed`

### 父子组件的生命周期

- 父组件会等待子组件挂载
- 当子组件完成挂载后，父组件会主动执行一次 beforeUpdate/updated 钩子函数

## 响应式原理

### Dep 与 Watcher

Dep 即收集器，发布类。负责收集和分发，拥有属性 id/subs，depend 方法即调用 Watcher 实例的 addDep 方法去收集，notify 方法即调用 Watcher 实例的 update 方法

Watcher 即订阅类。实例拥有若干属性，比较重要的有 vm/getter/lazy。

### 处理 data

观察对象，使用`observe(data)`。给此对象增加**ob**属性，值为 Observer 实例，该实例拥有属性 value/vmCount/新创建的 dep，在该实例创建过程中会对 data 的每一个属性进行 getter 和 setter 方法劫持。get 方法中，如果有 Dep.target 那么就调用 dep.depend()进行依赖收集，set 方法中调用 dep.notify()进行通知分发。

```javascript
Object.defineProperty(obj, key, {
  enumerable: true,
  configurable: true,
  get: function reactiveGetter() {
    const value = getter ? getter.call(obj) : val;
    if (Dep.target) {
      dep.depend();
      if (childOb) {
        childOb.dep.depend();
        if (Array.isArray(value)) {
          dependArray(value);
        }
      }
    }
    return value;
  },
  set: function reactiveSetter(newVal) {
    const value = getter ? getter.call(obj) : val;
    /* eslint-disable no-self-compare */
    if (newVal === value || (newVal !== newVal && value !== value)) {
      return;
    }
    /* eslint-enable no-self-compare */
    if (process.env.NODE_ENV !== "production" && customSetter) {
      customSetter();
    }
    // #7981: for accessor properties without setter
    if (getter && !setter) return;
    if (setter) {
      setter.call(obj, newVal);
    } else {
      val = newVal;
    }
    childOb = !shallow && observe(newVal);
    dep.notify();
  }
});
```

> ???为什么收集是在单个属性接管时，建立的 dep 实例中去收集。

### 处理 computed

每个属性，都会定义在 vm 上，getter 方法为如下。在这之前，会把用户定义的函数 userDef，通过 new Watcher 创建实例

```javascript
function computedGetter() {
  const watcher = this._computedWatchers && this._computedWatchers[key];
  if (watcher) {
    if (watcher.dirty) {
      watcher.evaluate();
    }
    if (Dep.target) {
      watcher.depend();
    }
    return watcher.value;
  }
}
```

### 处理 watch

### vue3.0响应式（使用proxy）
``` javascript
const effects = new Map();

const proxyHandler = {
  get(target, property) {
    // 收集依赖
    if (effects.last) {
      // 确保当前这个对象下这个属性所对应依赖列表
      effects.set(target, {
        [property]: [],
        ...effects.get(target)
      });
      // 记录依赖
      effects.get(target)[property].push(effects.last);
    }

    return Reflect.get(target, property);
  },
  set(target, property, value) {
    const succeed = Reflect.set(target, property, value);
    const deps = effects.get(target)[property];
    deps.forEach(e => e());

    return succeed;
  }
};

function reactive(obj) {
  // 为每个对象记录映射一个依赖列表对象（这是使用map可以识别出记录过的对象）
  effects.set(obj, {});
  // 复用proxyHandler，减少内存消耗
  return new Proxy(obj, proxyHandler);
}

function watch(effect) {
  // 挂载即将要处理的依赖
  effects.last = effect;
  effect();
  effects.last = null;
}

const state = reactive({
  foo: 100,
  bar: 200
});

watch(() => {
  console.log("foo changed", state.foo);
});

watch(() => {
  console.log("bar changed", state.bar);
});

state.foo++;
state.bar++;
```

直接调用 vm.\$watch()


## 插槽

- slot 合并
- v-slot 替换
- slot + slot-scope 替换

## 函数式组件

- 无状态、无实例、没有 this 上下文、无生命周期
- 一般作展示用

```javascript
// vnodes 传入jsx代码
export default {
  components: {
    VNodes: {
      functional: true,
      render: (h, ctx) => ctx.props.vnodes
    }
  }
};
```

## 组件通信方式

- props、\$emit
- $attrs、$listeners
- EventBus
- provide、inject
- v-model
- $parent、$children
- $broadcast、$dispatch
- vuex

## render

> 更抽象一点来看，我们可以把组件区分为两类：一类是偏视图表现的 (presentational)，一类则是偏逻辑的 (logical)。我们推荐在前者中使用模板，在后者中使用 JSX 或渲染函数。这两类组件的比例会根据应用类型的不同有所变化，但整体来说我们发现表现类的组件远远多于逻辑类组件。

## Composition API
使用setup函数包装所有逻辑操作，返回**模板**要使用的或者**其他逻辑处**要使用的对象集合（响应式的对象）。

## vuex

模块记得开启命名空间。

```javascript
modules: {
    namespaced: true,
    state: {},
    getters: {},
    //...
}
```

## vue-router

- `routes`第一层的`path`必须加`/`符号，或者为`''`，代表默认路径。
- 匹配路由时，当匹配到第一个时，就停止。
- 同时设置`redirect`和`{ children: { path: '' }}`时，将无视前者。
  > 先匹配后计算

## echarts

1. 使用 this.\$refs.xxx 获取 dom，而不使用 document.getElementById('xxx)

2. 图表的 chart.resize()功能提取为单独函数，使用 resize-detector 库的 addListener 进行绑定和 removeListener 取消绑绑定，且使用 debounce 进行防抖处理(可在 created 生命周期里对 vue 组件的 methods 中的方法进行改造)

3. 不要忘记在 beforeDestroy 生命周期里解绑事件，以及使用 chart.dispose()图表

## mock

```javascript
 proxy: {
    "/api": {
      target: "http://localhost:3000"
      bypass: function(req, res) {
        if (req.headers.accept.indexOf("html") !== -1) {
          console.log("Skipping proxy for browser request.");
          return "/index.html";
        } else if (process.env.MOCK !== "none") {
          console.log(req.path);
          const name = req.path
            .split("/api/")[1]
            .split("/")
            .join("_");
          const mock = require(`./mock/${name}`);
          const result = mock(req);
          delete require.cache[require.resolve(`./mock/${name}`)];
          return res.send(result);
        }
        return false;
      }
    }
  }
}
```

## vue-cli 脚手架使用注意

### 自动格式化

默认的错误警告提示只在命令行显示，且格式化需要手动运行`yarn lint`。

自动操作如下：

- 安装 eslint 插件
- 配置

```json
{
  // 打开保存时自动格式化，在vue文件中与autoFix属性缺一不可
  "eslint.autoFixOnSave": true,
  // 需要调用eslint的文件类型
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    {
      "language": "vue",
      "autoFix": true
    }
  ]
}
```

建议规则配置操作，修改`.eslintrc.js`：

- extends 字段中的`"plugin:vue/essential"` 改为`"plugin:vue/recommended"`
- rules 字段中添加如下忽略规则：
  - "vue/require-default-prop": "off"

## 踩坑

- props 传递的数据，如果不是在原对象上面修改，那么直接紧接着使用`this.$refs.xxx.xxx()`方法里面访问到的还是旧值。需要使用`this.$nextTick()`;
- props 传递为 null 时既不会触发 default 操作，也不会触发validator操作,同理在函数默认赋值时`function(a = 1){}`，传null也不会触发。