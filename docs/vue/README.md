# Vue

## 源码架构分析

### 优雅的地方

- 对于要收集的依赖，挂载到 Dep.target 上，避免了全局变量的使用
- 没有在每个依赖发生的具体地方直接赋值 Dep.target 来进行依赖收集，而是建立了 Watcher 类来统一管理并归类所有依赖

### 设计模式

#### 发布订阅模式

- 发布者
- 订阅者
- 信号中心

vue 中的自定义事件以及 node 中的事件机制都是基于此模式。

#### 观察者模式

响应式机制运用了观察者模式。

- 发布者（目标）
- 订阅者（观察者）

发布订阅模式通过信号中心统一调度，观察者模式通过发布者自己触发订阅者的行为（互相依赖性更强）。

## 响应式原理

### 概述

- 响应的是数据，准确的说，是一个对象与 DOM 之间的关系。而响应又主要分为监听与执行两个动作。
- 对于数据的响应。利用 Object.defineProperty 进行数据的监听设置，不过光监听还不够，还需要知道执行的具体操作。于是在**监听设定时**（不是监听触发时）建立一个收集器（Dep 的实例，即被观察者）进行收集已经**设定好了**的缓存依赖（Watcher 的实例，即观察者）。这样监听到数据修改后，就可以自动修改虚拟 DOM，进而反馈到真实 DOM 上。
  > 依赖不是在 get 方法里知道的（get 方法里只知道当前有没有依赖需要收集，而不是知道依赖具体是什么），是在每个具体的地方，例如模板解析、computed/watch 解析等地方，临时挂载到 Dep.target 上的操作。
- 对于 DOM 的响应，主要利用事件等机制，监听到 DOM 的变化，然后修改数据。

### 收集依赖与触发依赖
首先从数据本身触发，给与每个属性建立对应的收集器dep，用来存储依赖此数据的依赖watcher。响应式方法的主要工作就是让数据被获取时，说明目前有东西需要它的值，那么这个东西就应该被收集起来，这样自己数据变更时，就可以主动去告诉这些东西。

> 这里是否收集依赖，是通过Dep.target是否有值来判断。

回到代码实现，所有的操作都被转化成了watcher实例来表示，例如监听一个值，或者渲染一个组件等。然后指代一个数据，由收集器dep实例来代理。

get方法中，当检测到Dep.target有值时，表示此时有一个watcher在使用这个数据，那么应该保存到dep中。过程为：dep.depend() -> watcher.addDep(dep) -> dep.addSub(watcher) -> dep保存到自己的容器中。绕一圈是因为wachter里也需要存储dep，来知道哪些收集器收集了自己，顺便判重。

set方法中，也就是触发依赖的方式，即dep通知容器中的所有watcher，过程为：dep.notify() -> watcher.update() -> 注入更新队列 -> watcher.run() -> watcher.get()取值计算 -> watcher.cb()触发回调。

watcher的expression属性代表观察的表达式（因为观察的可能是一个变量名也可能是一个函数）。

一个组件，对应一个render watcher，它把组件渲染的过程(即`function(){ vm.update() }`函数)存在了watcher的expression属性之中。所以组件渲染函数并不是回调函数，这也是设计巧妙之处，利用表达式的计算即可让所用的响应式数据收集到自己。

#### 依赖存放位置

由于引用类型的原因，一个值是否变化有两种情况，因此不同的情况存放的依赖地方也不一样，但是依赖里面的具体操作，即 watcher 实例，**是一样的**。

一种是`val -> val2`，这种会被 set 方法捕获然后触发 defineReactive 方法作用域里的`dep.notify()`；

而另一种情况是内部变化，`val -> val`（当 val 为数组或者 val 被 deep 深度监听时触发），这种情况触发的是 val 原型链上挂载的 obsever 里的`dep`，即`val.__ob__.dep.notify()`。

### 处理 data

响应式一个对象，即使用 new Observer(obj)，并产生一个实例挂在相应的 obj 上。构造函数里对数组和对象有不同的处理。

- 对象。直接遍历 key 调用 defineReactive()。对象的依赖收集发生在 get 方法中，而分发方法发生在 set 中。
- 数组。
  - 遍历每一项，来响应其值。
  - 重新设置**proto**。因为上级的 get 中已经收集了依赖，不过分发方法却在 7 个常用方法里。另外会对 3 个对数组造成新增元素的方法里（push/unshift/spice），检测其新值并响应。

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
  },
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

### vue3.0 响应式（使用 proxy）

```javascript
const effects = new Map();

const proxyHandler = {
  get(target, property) {
    // 收集依赖
    if (effects.last) {
      // 确保当前这个对象下这个属性所对应依赖列表
      effects.set(target, {
        [property]: [],
        ...effects.get(target),
      });
      // 记录依赖
      effects.get(target)[property].push(effects.last);
    }

    return Reflect.get(target, property);
  },
  set(target, property, value) {
    const succeed = Reflect.set(target, property, value);
    const deps = effects.get(target)[property];
    deps.forEach((e) => e());

    return succeed;
  },
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
  bar: 200,
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

DOM 对象很庞大，创建代价高，所以就由普通的 js 对象来描述 DOM 对象。

DOM 频繁操作还会引起性能问题，于是把一系列操作改成立即操作 VirtualDOM，最终通过 diff 算法，来进行比对前后的 VirtualDOM 区别，来进行有效的更新 DOM。

在 vue 中主要有 2 个作用：

- 提供虚拟节点 vnode，帮助与真实 DOM 对应。
- 通过算法比对，只更新必要的 DOM。

> diff 算法只针对于同级

> 某些简单情况，使用 VirtualDOM 还会变慢（多了创建和比对步骤）。

### 应用

- 跨平台（移动端、小程序）。使用 vnode 模拟 UI 节点，节点的之间的操作，会统一封装成 appendChild/removeChild/parentNode 之类的函数，函数里面再调用不同平台的节点操作接口，以此来解耦。
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

数据的变化，最终会触发 watcher 中的回调，回调中更新 dom 时，会调用`patch(oldVnode, vnode)`来更新 dom，整个过程称之为 Diff。

#### 子节点更新

其中最麻烦的是，同一个节点下子节点之间的对比。整体由一个循环构成，通过四指针分别在新旧两个子节点集合里由两侧向中靠拢。

```javascript
while (newStartIdx <= newEndIdx && oldStartIdx <= oldEndIdx) {
  // 详细对比
}
```

这样可以先使用**四个端点节点**之间对比，这在大多数情况下可得到结果，如果没有，则去旧子节点集合中循环遍历。
如果使用了 key，这里会到提前建好的 key/index 索引表里去取。

对于识别出来的不同元素，算法并不会单纯的把原来的删除，然后建立新的，而是会重用 dom 本身，再进行一些数据设置，所以当一个 dom 的其它特性被修改时，又没有跟数据本身关联（比如 checked 效果、你自己设置的 dom 属性），那么重用的元素依然保留该效果。

例如一个没有设置 key 的 li 列表，当 list 数据变化时，checkbox 的勾选状态并不会跟着数据走，如果是第一个 li 标签，就一直是第一个 li 标签被选中。

```
<ul>
  <li v-for="item in list">
    <input type="checkbox">
    {{ item }}
  </li>
</ul>
```

> 所以在动态子节点中，一个独立的 key 尤为重要！！！

## 模板编译

代码中最终不含模板代码，都被编译成了 render 函数，该函数就是要达到每次调用都能生成最新的 vnode 出来。

> 如果同时设置两者，优先级template > render。

### 渲染函数 render

1. 将模板解析为 AST（解析器）
2. 遍历 AST 标记静态节点（优化器）
3. 使用 AST 生成渲染函数（代码生成器）
   > AST 与 vnode 类似，都是是用 Javascript 对象来描述 DOM 节点，只不过数据结构不太一样。

#### 解析器

解析器通过在 while 循环里使用正则表达式匹配，获得一小段想要的代码，然后继续处理，接着触发钩子函数。直到模板字符串为空。

比如在 start 钩子函数里，我们就可以创建节点。end 钩子函数里就要进行出栈操作（AST 的层级实现来源），这时一个节点就解析完毕。

#### 优化器

标记静态节点与静态根节点。采用自上而下的递归。

> 如果一个节点太简单，比如没有子节点，是不会被标记为静态节点，因为优化成本大于收益。

可以实现两个目的：

- 重新渲染时，不需要为静态子树创建新节点，即克隆 vnode。
- patch 方法里会调过。

#### 组件与 DOM 概念

- AST，字符串模板编译过程中的描述对象。与 vue 没多大关系。
- VNode，vue 里用来描述 dom 的对象，整个 VNode 构建起来的树，称为虚拟 DOM。
- h 方法，即 createElement，用来生成 vnode 的方法，使用方法大概为`h(组件，参数，children)`，组件参数支持 HTML 标签名、组件选项对象、一个返回前两种数据的 async 函数三种。
- vue 组件，最开始只是一个对象，这个对象通过 h 方法的传入再进行构造函数的生成，继而生成真实的组件实例。

## vue 实例方法实现原理

### 数据类

主要是弥补当一些检测不到的改变改变时，帮助触发回调。以及提供主动监听的功能。

- vm.\$watch。新建一个 watcher，创建过程中会自动收集依赖。deep 的实现只需要在收集阶段递归一次包含的值即可自动收集。
- vm.\$set。对于数组，使用 splice 触发；对于对象，在新增属性后，使用`ob.dep.notify()`触发;对于非响应式的数据，直接处理，不触发通知。
- vm.\$delete。删除后，使用`ob.dep.notify()`触发通知。对于非响应式的数据，直接处理，不触发通知。

### 事件类

在实例中保存了一个事件集合来缓存事件名以及事件回调。

- vm.\$on
- vm.\$off
- vm.\$once
- vm.\$emit

### 生命周期类

- vm.\$forceUpate。主动触发组件级别的回调，即 vm.\_watcher.update()。
- vm.\$destory。一个实例被销毁，需要处理以下内容：
  - 断掉父与子关系
  - 在所有收集了自己的 dep 中移除自己（watcher.tearDown()）
  - 解绑指令
  - 移除事件监听
- vm.\$nextTick。把回调函数加入微任务队列中（第一次用 promise 创建微任务,不支持就用 setTimtout，后续只需要往callbacks里面加回就行），这个微任务队列又叫异步更新队列，里面的watcher不会重复添加。

  也可以主动使用 withMacroTask 让其添加到宏任务队列中。宏任务的实现依次测试使用 setImmediate/MessageChannel/setTimeout。

  > **DOM 的更新回调也是使用此方法**，因为一次可能触发多个 watcher，等待所有 watcher 执行完毕，再进行 DOM 更新。因为如果要在 nextTick 中获取 DOM 内容，需要在数据改变之后定义（因为都是微任务）。

- vm.\$mount。挂载到 DOM 上。优先级：render/template/el。

### 全局 API

- Vue.extend。构建 Vue 的一个子类，我们常写的组件也是 Vue 的一个子类。
- Vue.nextTick/Vue.set/Vue.delete。跟实例上方法功能一致。
- Vue.directive/Vue.filter/Vue.component。方法本身的作用只用作**存储**和**取出**本身，执行是在其它地方。
- Vue.use。存插件。
- Vue.mixin。使默认的 options 添加传入的内容。
- Vue.compile。编译字符串模板为渲染函数。
- Vue.version。

## 生命周期

**初始化阶段**

1. 取得所有父级 options，与传入的 options 合并后统一设置到`vm.$options`上
2. 初始化 Lifecycle、Events、Render
> 这里的Lifecycle并不是指created/mounted这些，而是vm上一些属性的设置，比如$parent/$root等。

> 初始化Events即初始化父组件传递给子组件的事件，在这里使用`.$on`绑定到子组件上，这样子组件才能触发，毕竟接下来的绑定state会有可能调用方法

-- `beforeCreate`

3. 初始化 Injections、State、Provide。顺序：injections ➡️props ➡️methods ➡️data ➡️computed ➡️ watch ➡️ provide
> inject其实是自下而上的去实例的_provided属性中取值，然后设置到vm上（非响应式的设置）。

> props的数据存在vm._props中，同时通过getter代理到vm上。且类型验证失败时**依然会赋值**，只是会有警告提示。

> methods的内容会使用bind产生一个新的函数并设置到vm上。

> data的key与props中的key冲突时，不会再设置。

> computed的数据会存在vm._computedWatchers中，只不过value换成了对应的watcher；并且命名冲突时，不会设置；这里要注意的是key只用来作为设置到实例vm上的代理属性名，而value才是watcher的expression。

> computed的响应与正常的不同，依赖变更时并不会马上执行计算（因此Watcher专为此设计了lazy/dirty等属性），而是等待别人来触发它，可能是一个其他的computed watcher，也可能是render watcher（一个组件对应一个render watcher）。那么computed里的每个数据，与要使用这个computed的值，之间隔了一层，怎么衔接的呢。其实就在computed定义的get方法里，如果检测到全局的Dep.target，则会执行专门为计算属性制定的方法watcher.depend，来使所有computed watcher里的依赖都加上此时这个watcher（有点透传的意思）。这样computed watcher和新来的watcher都可以被同样的deps收集（前者在取值的时候就自然收集，后者因为是自己建立的get方法，因此需要自己做收集操作。）。

> watcher就是正常的监听一个表达式，key是wacher的expression，value是watcher的回调函数。

-- `created`

**模板编译阶段**

4. （模板编译为渲染函数，只在完整版才有这一过程）

**挂载阶段**

-- `beforeMount`

5. 运行 render 函数产生 vNode，并挂载到真实 DOM 上

-- `mounted`

> 模板编译阶段和挂载阶段，在 options 里有 el 属性时才会自动执行，否则会等到 vm.\$mount 再执行。

**更新阶段**

-- `beforeUpdate`

使用虚拟 DOM 重新渲染

-- `updated`

**卸载阶段**

-- `beforeDestroy`

卸载依赖追踪、子组件、事件监听器。同 vm.\$destroy()

-- `destroyed`

**keep-alive**

-- `activated`

-- `deactivated`

**错误捕获**

vue运行期间发生的所有错误都会统一交给handlerError函数处理。

它会从父级开始一步步调用errorCaptured钩子函数。
- 如果返回了false，那么传递将终止。
- 如果本身又报错了，那么直接调用全局错误处理。
- 一直到顶层父级，执行完后调用全局错误处理。

全局错误处理即`Vue.config.errorHandler`，如果没有设置或者全局的错误处理函数也报错了，那么这两种情况都会使用console.error()抛出错误。

-- `errorCaptured`

### 父子组件的生命周期

- 父组件会等待子组件挂载
- 当子组件完成挂载后，父组件会主动执行一次 beforeUpdate/updated 钩子函数





## 指令
指令的本质是为了让你更集中的修改DOM相关的内容。而不是分散在其它地方。
#### 内部指令
- v-if/v-show指令，在render函数中用了三元运算符和遍历操作来做逻辑，以此实现生成不同的vnode。
- v-show。按自定义指令格式注入一个指令。
- v-on。传入到on属性之中，会有一个专门的函数updateDOMListeners来对比新旧vnode的事件，以此来绑定和解绑。
#### 自定义指令

提供bind/inserted/update/componentUpdated/unbind等钩子函数。

指令的钩子函数借助于虚拟DOM的钩子函数来实现。虚拟DOM在渲染时会触发以下钩子函数。init/create/active/insert/prepatch/update/postpatch/destroy/remove。
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
      render: (h, ctx) => ctx.props.vnodes,
    },
  },
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

使用 setup 函数包装所有逻辑操作，返回**模板**要使用的或者**其他逻辑处**要使用的对象集合（响应式的对象）。

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

前端路由的目的就是为了不刷新页面又能改变 URL 地址，同时渲染不同的页面，那么两种的模式的区别在于：

- hash 模式。利用 hash 地址改变来模拟地址变化。配合 hashchange 事件做渲染。
  > hash 值不会发送给服务端。
- history 模式，利用 pushState 和 repalceState 两个 API 来操作 URL 的改变，再配合 popstate 事件做渲染。因为发送给服务器的地址会改变，所以需要服务器进行一定的配合。
  > 当历史记录条目更改时，将触发 popstate 事件。pushState/repalceState 不会触发 popstate 事件。而是在浏览器相关动作发生改变时才会触发，例如回退与前进（无论是手动点击回退按钮还是js调用`histroy.back()`）。

### 注意事项

- `routes`第一层的`path`必须加`/`符号，或者为`''`，代表默认路径。否则虽然会跳转地址，但却不会渲染任何内容。
- 匹配路由时，当匹配到第一个时，就停止。
- 同时设置`redirect`和`{ children: { path: '' }}`时，将无视前者。
  > 先匹配后计算

### 守卫
#### 全局
- beforeEach
- beforeResolve，在路由各种守卫走完后，confirmed之前最后一步触发
- afterEach
#### 路由
- beforeEnter
#### 组件
只有写在路由配置的那个组件里才有效果。
- beforeRouteEnter，不能访问this，但是可以给next方法传递回调函数
- beforeRouteUpdate
- beforeRouteLeave

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

- props 传递的数据，如果不是在原对象上面修改，那么直接紧接着使用`this.$refs.xxx.xxx()`方法里面访问到的还是旧值。需要使用`this.$nextTick()`;（子组件还没渲染）
- props 传递为 null 时既不会触发 default 操作，也不会触发 validator 操作,同理在函数默认赋值时`function(a = 1){}`，传 null 也不会触发。（vue中prop为null时不会进行default/validator以及type的验证）
- 如果一个组件里用了 methods 来渲染组件，那么此函数里不要更改组件的依赖数据。否则引起无限更新。

```vue
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
      d: [],
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
    },
  },
};
</script>
```
- 同组件路由切换不刷新
  - 在beforeRouteUpdate钩子函数里处理逻辑（推荐）
  - 观察路由对象`$route`
  - 为route-view组件添加key

- v-model并不是简单的语法糖，内部会给响应的值设置为响应式
`App.vue`
``` vue
<template>
  <div>
    <!-- obj的d属性并不是响应式的，因此hello组件里是没值的 -->
    <!-- <Hello :value="obj.d" @input="v => (obj.d = v)" /> -->

    <!-- obj的d属性变成了响应式的，因此hello组件里是有值的 -->
    <Hello v-model="obj.d" />
  </div>
</template>

<script>
import Hello from "./hello";

export default {
  components: {
    Hello
  },

  data() {
    return {
      obj: {}
    };
  }
};
</script>
```
`Hello.vue`
``` vue
<template>
  <div>
    <p>hello {{ value }}</p>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: null
    }
  },

  mounted() {
    setTimeout(() => {
      this.$emit("input", "456");
    }, 500);
  }
};
</script>
```
