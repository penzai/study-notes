## React

### React

In other words, React apps are made out of components, but what makes React special isn’t components themselves. What makes React special is the ways in which components interact.

### component/component class/component instance

On line 4, by subclassing `React.Component`, you create a new component class. **This is not a component!** A component class is more like a factory that produces components. When you start making components, each one will come from a component class.

```
class MyComponentClass extends React.Component {
```

#### a component class

```
class MyComponentClass extends React.Component {}
```

#### a component instance/a component

```
<MyComponentClass />
```

## hook

### 产生缘由

class 中生命周期函数经常包含不相关的逻辑，但又把相关逻辑分离到了几个不同方法中。

> 副作用`side effect`分为两类，需要清除的（对应`useEffect`的返回函数）和不需要清除的。

所以为了**状态逻辑的复用**，hook 产生了。

### hook 是什么

hook 是一个特殊的函数，它可以让你“钩入”React 的特性。

### useState

设置值的时候是替换而不是合并。

### useEffect

- 此 hook 可以看做是`componentDidMount`，`componentDidUpdate` 和 `componentWillUnmount` 这三个函数的组合。

- 每个 effect “属于”一次特定的渲染结果。

- 每个 effect 都可以返回一个清除函数。如此可以将添加和移除订阅的逻辑放在一起。

- 如果想执行只运行一次的 effect（仅在组件挂载和卸载时执行），可以传递一个空数组（[]）作为第二个参数。

### rules

1. 只在最顶层使用 Hook。不要在循环，条件或嵌套函数中调用 Hook。
2. 只在 React 函数中调用 Hook。不要在普通的 JavaScript 函数中调用 Hook。
   > 在 React 的函数组件中调用 Hook 或者在自定义 Hook 中调用其他 Hook。

### 自定义 hook

当一套 hook 使用方式，需要重用时，就需要自定义 hook

```
function useCustom() {
  const [state, setState] = useState(0)
  useEffect(() => {
    return () => {}
  })
}
```
