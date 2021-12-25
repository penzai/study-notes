## 组合式API
### ref
使用ref包裹值让其成为响应式变量。

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