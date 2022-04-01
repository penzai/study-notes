## 组合式API
### reactive
- 响应式对象添加对象时，此对象也会被代理。
``` js
const obj = reactive({})
const empty = {}
obj.p1 = empty
console.log(obj.p1 === empty) // false
```
- vue链接的是proxy对象，如果替换了proxy是无效的。但如果使用ref包装，可以使用.value进行替换。
``` js
let obj = reactive({
  name: 'pz',
  age: '100'
})
// 模板引用了obj的数据

// 如果在事件中对obj重新赋值，是不会触发任何效果的
obj = reactive({
  name: 'zz',
  age: '1'
})

// 这是响应式的替换
const objectRef = ref({ count: 0 })
objectRef.value = { count: 1 }
```
### ref
使用ref包裹基础类型值让其成为响应式变量。

使用toRefs创建对props中的属性的响应式引用。
### 生命周期
onMounted(cb)
### watch
参数：
- 一个想要监听的响应式引用或getter函数
- 一个回调
- 可选的配置选项

watch()

### computed
computed()，返回的是一个只读的响应式引用。

## 父与子组件
- 透传的class使用$attrs.class进行分配。

## 表单绑定
v-model应用于表单标签时，不同标签有不同行为。

原生标签一般使用name作为表单提交的标识字段，也使用name来标识一组radio或者一组checkbox，id用于与label文字标签联系到一起。

当原生的属性（value/checked/selected）与v-model混用时，v-model生效，其余不生效。

- input/textarea，接管value值与input事件。
- radio
  - 原生：使用checked来决定是否选中
  - v-model：值为radio标签input的value，一致即为选中（不是true/false！！）。接管change事件。
- checkbox
  - 原生：使用checked来决定是否选中
  - v-model: 值为true/false，接管change事件。
> 只有checkbox单时，v-model值是一个特例为布尔值，其他情况都跟value值挂钩。因此对于单个checkbox，vue提供了true-value和false-value属性用法。
- checkbox多选，多选的前提肯定是设置name为一样的标识，假使这里的name为myCheckbox
  - 原生:在提交的formData数据里，如果多选，会有多个的myCheckbox=xxx值。
  - v-model: **初始化值必须为数组！！！**即可正常填装所设置的value值。接管change事件。
- select
  - 原生：属性取的是options的value > options的innerHTML。option标签使用`selected`来决定默认选中哪个选项。
  - v-model: 无论是单选还是多选，都不会对初始值格式有要求。单选就是普通字符串，多选就是数组。接管change事件。且值能设置为对象。

## Teleport
``` js
<teleport to="body">
<teleport>
```

## 片段
支持多个根节点，要注意不会进行未指定属性的自动继承。需要手动进行绑定`v-bind="$attrs"`。

## emits选项
可以定义组件发出的所有事件，还可以进行验证。当然这一切都只是软性的，vue只是会发出警告而已。

更强大的`v-model:arg.modifiers`。

## `<script setup>`语法糖
优点：
- 能够使用纯Typescript声明props和抛出事件
- 更好的运行时性能（其模版会被编译成与其同一作用域的渲染函数，没有任何的中间代理）
- 更好的IDE类型推断

## 不兼容的变更
- vue2.x的全局api移动到了app实例上
- v-if/v-else上的key将会自动生成唯一值
- template的key设置在template上
- v-if优先级大于v-for
- v-bind合并行为修改
- 移除native，未被emits选项声明的事件会自动注册到根对象上
- 渲染函数声明的更改
- 移除`$listeners`，整合到了`$attrs`中
- destroy周期重命名为unmount
- 自定义指令的钩子函数与生命周期同名
- mixins的合并策略更改
- keycode废弃
- 移除过滤器
- 移除$on/$off/$once。替代方案：prop/事件、provide/project、vuex

## 其他
- v-bind的值，只有在为truthy和空字符串`''`（这是一个falsy）时，才会显示在元素上。
- 模板中的全局变量为实际全局变量的部分。其他之外需要使用app.config.globalProperties进行显式添加。
`Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,' +
  'decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,' +
  'Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt`
- v-if优先级比v-for高，v-if不能访问for循环里的变量。