# Vue
## 源码架构分析
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
## 响应式原理
### 概述
- 响应的是数据，准确的说，是一个对象与DOM之间的关系。而响应又主要分为监听与执行两个动作。
- 对于数据的响应。利用Object.defineProperty进行数据的监听设置，不过光监听还不够，还需要知道执行的具体操作。于是在**监听设定时**（不是监听触发时）建立一个收集器（Dep的实例，即被观察者）进行收集已经**设定好了**的缓存依赖（Watcher的实例，即观察者）。这样监听到数据修改后，就可以自动修改虚拟DOM，进而反馈到真实DOM上。
> 依赖不是在get方法里知道的（get方法里只知道当前有没有依赖需要收集，而不是知道依赖具体是什么），是在每个具体的地方，例如模板解析、computed/watch解析等地方，临时挂载到Dep.target上的操作。
- 对于DOM的响应，主要利用事件等机制，监听到DOM的变化，然后修改数据。

### Dep 与 Watcher

Dep 即收集器，发布类。负责收集和分发，拥有属性 id/subs，depend 方法即调用 Watcher 实例的 addDep 方法去收集，notify 方法即调用 Watcher 实例的 update 方法

Watcher 即订阅类。实例拥有若干属性，比较重要的有 vm/getter/lazy。

Dep负责与对象打交道，拥有**收集depend**和**分发notify**两个核心方法。但都是对Watcher实例的操作。

Watcher负责与真正的依赖打交道，例如虚拟DOM的改变，其它数据的改变等真实操作。
- 构造函数会传入获取值的表达式`expOrFn`（顾名思义可知，这里也可以传入函数）和`cb`。
- 核心方法
  - get()，获取当前值
  - update()，触发回调
  - addDep()，让依赖dep收集自己


#### 依赖收集过程
1. xxx逻辑需要用到数据；
2. 以此为回调函数建立watcher；
3. 构造函数Watcher里触发get()方法；
4. get()方法里触发已经设置好的机关，即defineReactive()里每个key的getter里的dep.depend()方法；
5. 从Dep.target取到建好的watcher，然后再调用watcher.addDep()方法，收集完毕。

#### 依赖存放位置
由于引用类型的原因，一个值是否变化有两种情况，因此不同的情况存放的依赖地方也不一样，但是依赖里面的具体操作，即watcher实例，**是一样的**。

一种是`val -> val2`，这种会被set方法捕获然后触发defineReactive方法作用域里的`dep.notify()`；

而另一种情况是内部变化，`val -> val`（当val为数组或者val被deep深度监听时触发），这种情况触发的是val原型链上挂载的obsever里的`dep`，即`val.__ob__.dep.notify()`。

### 处理 data
响应式一个对象，即使用new Observer(obj)，并产生一个实例挂在相应的obj上。构造函数里对数组和对象有不同的处理。
- 对象。直接遍历key调用defineReactive()。对象的依赖收集发生在get方法中，而分发方法发生在set中。
- 数组。
  - 遍历每一项，来响应其值。
  - 重新设置__proto__。因为上级的get中已经收集了依赖，不过分发方法却在7个常用方法里。另外会对3个对数组造成新增元素的方法里（push/unshift/spice），检测其新值并响应。

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


## Virtual DOM
DOM对象很庞大，创建代价高，所以就由普通的js对象来描述DOM对象。

DOM频繁操作还会引起性能问题，于是把一系列操作改成立即操作VirtualDOM，最终通过diff算法，来进行比对前后的VirtualDOM区别，来进行有效的更新DOM。

在vue中主要有2个作用：
- 提供虚拟节点vnode，帮助与真实DOM对应。
- 通过算法比对，只更新必要的DOM。

> diff算法只针对于同级

>某些简单情况，使用VirtualDOM还会变慢（多了创建和比对步骤）。

### 应用
- 跨平台（移动端、小程序）。使用vnode模拟UI节点，节点的之间的操作，会统一封装成appendChild/removeChild/parentNode之类的函数，函数里面再调用不同平台的节点操作接口，以此来解耦。
- SSR

### VNode
#### 类型
- 注释节点
- 文本节点
- 元素节点
- 组件节点
- 函数式组件
- 克隆节点???

### Diff
数据的变化，最终会触发watcher中的回调，回调中更新dom时，会调用`patch(oldVnode, vnode)`来更新dom，整个过程称之为Diff。
#### 子节点更新
其中最麻烦的是，同一个节点下子节点之间的对比。整体由一个循环构成，通过四指针分别在新旧两个子节点集合里由两侧向中靠拢。
``` javascript
while(newStartIdx <= newEndIdx && oldStartIdx <= oldEndIdx) {
  // 详细对比
}
```

这样可以先使用**四个端点节点**之间对比，这在大多数情况下可得到结果，如果没有，则去旧子节点集合中循环遍历。
如果使用了key，这里会到提前建好的key/index索引表里去取。

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

## 模板编译
代码中最终不含模板代码，都被编译成了render函数，该函数就是要达到每次调用都能生成最新的vnode出来。

### 渲染函数render
1. 将模板解析为AST（解析器）
2. 遍历AST标记静态节点（优化器）
3. 使用AST生成渲染函数（代码生成器）
> AST与vnode类似，都是是用Javascript对象来描述DOM节点，只不过数据结构不太一样。

#### 解析器
解析器通过在while循环里使用正则表达式匹配，获得一小段想要的代码，然后继续处理，接着触发钩子函数。直到模板字符串为空。

比如在start钩子函数里，我们就可以创建节点。end钩子函数里就要进行出栈操作（AST的层级实现来源），这时一个节点就解析完毕。
#### 优化器
标记静态节点与静态根节点。采用自上而下的递归。
> 如果一个节点太简单，比如没有子节点，是不会被标记为静态节点，因为优化成本大于收益。

可以实现两个目的：
- 重新渲染时，不需要为静态子树创建新节点，即克隆vnode。
- patch方法里会调过。

## vue实例方法实现原理
### 数据类
主要是弥补当一些检测不到的改变改变时，帮助触发回调。以及提供主动监听的功能。
- vm.$watch
- vm.$set
- vm.$delete
### 事件类
在实例中保存了一个事件集合来缓存事件名以及事件回调。
- vm.$on
- vm.$off
- vm.$once
- vm.$emit

### 生命周期类
- vm.$forceUpate。主动触发组件级别的回调，即vm._watcher.update()。
- vm.$destory。一个实例被销毁，需要处理以下内容：
  - 断掉父与子关系
  - 在所有收集了自己的dep中移除自己（watcher.tearDown()）
  - 解绑指令
  - 移除事件监听
- ???vm.$nextTick。默认使一次js引擎的执行过程中的所有回调统一添加到微任务队列中（第一次用promise创建微任务,不支持就用setTimtout，后续往里面加回调函数）。也可以主动使用withMacroTask让其添加到任务队列中。

  宏任务的实现依次测试使用setImmediate/MessageChannel/setTimeout。
> DOM的更新回调也是使用此方法，因为一次可能触发多个watcher，等待所有watcher执行完毕，再进行DOM更新。因为如果要在nextTick中获取DOM内容，需要在数据改变之后定义（因为都是微任务）。
- vm.$mount。vue实例的dom挂载优先级，render/template/el。

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
### 模式
前端路由的目的就是为了不刷新页面又能改变URL地址，同时渲染不同的页面，那么两种的模式的区别在于：
- hash模式。利用hash地址改变来模拟地址变化。配合hashchange事件做渲染。
  > hash值不会发送给服务端。
- history模式，利用 pushState 和 repalceState 两个 API 来操作 URL 的改变，再配合popstate事件做渲染。因为发送给服务器的地址会改变，所以需要服务器进行一定的配合。
  > 当历史记录条目更改时，将触发popstate事件。pushState/repalceState不会触发popstate事件。

### 注意事项
- `routes`第一层的`path`必须加`/`符号，或者为`''`，代表默认路径。否则虽然会跳转地址，但却不会渲染任何内容。
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
- 如果一个组件里用了methods来渲染组件，那么此函数里不要更改组件的依赖数据。否则引起无限更新。
``` vue
<template>
  <div>
    <div :data="f2()"></div>
    <div :data="f()">abc</div>
  </div>
</template>

<script>
// let c = 1;
export default {
  data() {
    return {
      d: []
    };
  },
  methods: {
    f2() {
      this.d;
    },
    f() {
      // this.d = 3; // 不触发无限更新
      // this.d = c++; // 触发无限更新
      // this.d.push(3); // 触发无限更新
    }
  }
};
</script>
```