## reactive

- 响应式对象添加对象时，此对象也会被代理。

```js
const obj = reactive({});
const empty = {};
obj.p1 = empty;
console.log(obj.p1 === empty); // false
```

- vue 链接的是 proxy 对象，如果替换了 proxy 是无效的。但如果使用 ref 包装，可以使用.value 进行替换。

```js
let obj = reactive({
  name: "pz",
  age: "100",
});
// 模板引用了obj的数据

// 如果在事件中对obj重新赋值，是不会触发任何效果的
obj = reactive({
  name: "zz",
  age: "1",
});

// 这是响应式的替换
const objectRef = ref({ count: 0 });
objectRef.value = { count: 1 };
```

## ref

使用 ref 包裹基础类型值让其成为响应式变量。

使用 toRefs 创建对 props 中的属性的响应式引用。

shallowRef只包装传入对象的第一层，深层次的更改并不会触发更新。

## 生命周期

onMounted(cb)

## watch

参数：

- 一个想要监听的响应式引用、getter 函数、多个来源的数组
- 一个回调
- 可选的配置选项

watch()

想要监听对象的某个属性，需要使用函数（如果想要深层次监听，还需配置 deep）：

```js
const obj = ref({ a: 1 });
watch(
  () => obj.value.a,
  () => {
    //operation
  },
  { deep: true }
);
```

> 深度侦听需要遍历被侦听对象中的所有嵌套的 property，当用于大型数据结构时，开销很大。因此请只在必要时才使用它，并且要留意性能。

### watchEffect

运行时就执行一次，可设置配置`{ immediate: true }`，或者使用 watchEffect。

对于第一次就想执行的监听，用起来比较方便。不过在使用 await 时，只有第一个 await 之前的才会自动追踪依赖。

```js
const url = ref("http://xxx");
const loadData = (url) => {};
watch(async () => {
  // !!!这里只有第一个await前才会自动追踪依赖
  const response = await loadData(url.value);
  data.value = await response.json();
});
```

### watchPostEffect

默认的 watch 回调更新在组件更新之前，因此里面拿不到最新的 dom，如果想要，可设置配置`{ flush: 'post' }`，或者使用 watchPostEffect。

### 手动停止 watch

调用 watch 返回的函数。

当在异步回调中创建 watch 时，需要手动停止。比如 settimeout 中。

## computed

computed()，返回的是一个只读的响应式引用。

## ref

ref 用来获取对一个 html 元素或者子组件的直接引用。模板中 ref 属性传入的值，需要是使用 ref 进行包装后的值。

在 v-for 循环中，给 ref 传入一个数组对象可自动获取所有引用。但是顺序跟 v-for 所使用的数据不是顺序对应的，这里可使用函数来保证。

- 直接使用 ref 包装数组

```js
<script setup>
const inputRefs = ref([])
</script>
<template>
  <li v-for="item in list" ref="inputRefs" />
</template>
```

- 使用函数式 ref

```js
<script setup>
const inputRefs = []
const getRef = el => inputRefs.push(el)
</script>
<template>
  <li v-for="item in list" :ref="getRef" />
</template>
```

ref 应用在子组件上时，取得引用有所不同

- 子组件使用`<script setup>`，父组件使用 ref 取得的引用里未包含任何东西，子组件需要使用`defineExpose`显示暴露
- 其它使用方式，可获得与 this 一样的使用效果

## props

defineProps() 宏中的参数不可以访问`<script setup>`中定义的其他变量，因为在编译时整个表达式都会被移到外部的函数中。

透传的attrs不具有响应特性，因此无法监听它的变化。

## 父与子组件

defineAsyncComponent，异步加载组件。
## 表单绑定

v-model 应用于表单标签时，不同标签有不同行为。

原生标签一般使用 name 作为表单提交的标识字段，也使用 name 来标识一组 radio 或者一组 checkbox，id 用于与 label 文字标签联系到一起。

当原生的属性（value/checked/selected）与 v-model 混用时，v-model 生效，其余不生效。

- input/textarea，接管 value 值与 input 事件。
- radio
  - 原生：使用 checked 来决定是否选中
  - v-model：值为 radio 标签 input 的 value，一致即为选中（不是 true/false！！）。接管 change 事件。
- checkbox
  - 原生：使用 checked 来决定是否选中
  - v-model: 值为 true/false，接管 change 事件。
    > 只有 checkbox 单时，v-model 值是一个特例为布尔值，其他情况都跟 value 值挂钩。因此对于单个 checkbox，vue 提供了 true-value 和 false-value 属性用法。
- checkbox 多选，多选的前提肯定是设置 name 为一样的标识，假使这里的 name 为 myCheckbox
  - 原生:在提交的 formData 数据里，如果多选，会有多个的 myCheckbox=xxx 值。
  - v-model: **初始化值必须为数组！！！**即可正常填装所设置的 value 值。接管 change 事件。
- select
  - 原生：属性取的是 options 的 value > options 的 innerHTML。option 标签使用`selected`来决定默认选中哪个选项。
  - v-model: 无论是单选还是多选，都不会对初始值格式有要求。单选就是普通字符串，多选就是数组。接管 change 事件。且值能设置为对象。
## 组合式API
> `<script setup>` 是唯一在调用 await 之后仍可调用组合式函数的地方。编译器会在异步操作之后自动为你恢复当前活跃的组件实例。

> 组合式函数相对于无渲染组件的主要优势是：组合式函数不会产生额外的组件实例开销。当在整个应用中使用时，由无渲染组件产生的额外组件实例会带来无法忽视的性能开销。

> 我们推荐在纯逻辑复用时使用组合式函数，在需要同时复用逻辑和视图布局时使用无渲染组件。

优点：

- 能够使用纯 Typescript 声明 props 和抛出事件
- 更好的运行时性能（其模版会被编译成与其同一作用域的渲染函数，没有任何的中间代理）
- 更好的 IDE 类型推断
## Teleport

```js
<teleport to="body">
<teleport>
```

## 片段

支持多个根节点，要注意不会进行未指定属性的自动继承。需要手动进行绑定`v-bind="$attrs"`。

## emits 选项

可以定义组件发出的所有事件，还可以进行验证。当然这一切都只是软性的，vue 只是会发出警告而已。

更强大的`v-model:arg.modifiers`。

## 动画
- v-enter-from
- v-enter-active
- v-enter-to
- v-leave-from
- v-leave-active
- v-leave-to
## 渲染优化
### 静态提升
### 修补标记 Flags
### 树结构打平
## 不兼容的变更

- vue2.x 的全局 api 移动到了 app 实例上
- v-if/v-else 上的 key 将会自动生成唯一值
- template 的 key 设置在 template 上
- v-if 优先级大于 v-for
- v-bind 合并行为修改
- 移除 native，未被 emits 选项声明的事件会自动注册到根对象上
- 渲染函数声明的更改
- 移除`$listeners`，整合到了`$attrs`中
- destroy 周期重命名为 unmount
- 自定义指令的钩子函数与生命周期同名
- mixins 的合并策略更改
- keycode 废弃
- 移除过滤器
- 移除$on/$off/$once。替代方案：prop/事件、provide/project、vuex

## 其他

- v-bind 的值，只有在为 truthy 和空字符串`''`（这是一个 falsy）时，才会显示在元素上。
- 模板中的全局变量为实际全局变量的部分。其他之外需要使用 app.config.globalProperties 进行显式添加。
  `Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,' + 'decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,' + 'Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt`
- v-if 优先级比 v-for 高，v-if 不能访问 for 循环里的变量。
- 一知半解：动画、suspense、测试、SSR、性能、无障碍访问、安全。
- setup执行在before与created之间。
