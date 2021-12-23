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