## HOOK
### useState
???React 会确保 setState 函数的标识是稳定的，并且不会在组件重新渲染时发生变化。这就是为什么可以安全地从 useEffect 或 useCallback 的依赖列表中省略 setState。

函数式更新时`对象`数据不会自动合并，需要手动操作。
``` javascript
const [state, setState] = useState({});
setState(prevState => {
  // 也可以使用 Object.assign
  return {...prevState, ...updatedValues};
});
```

???需要注意的是，React 可能仍需要在跳过渲染前渲染该组件。不过由于 React 不会对组件树的“深层”节点进行不必要的渲染，所以大可不必担心。如果你在渲染期间执行了高开销的计算，则可以使用 useMemo 来进行优化。
#### 函数式更新
指定state如何改变（侧重于方式），而不是引用当前的state。

### useEffect
useEffect Hook相当于是componentDidMount、componentDidUpate、componentWillUnmount三个生命周期的组合。

**useEffect每次重新渲染都会执行，包括清除函数。**

useEffect不会阻塞主进程，如果需要测量布局，可以使用 useLayoutEffect 。