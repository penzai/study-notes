
## 函数式编程
C/Java等都是命令式编程，而声明式编程更符合人类的逻辑思考，本质是一种lambda演算。
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

## Fiber
React16之前diff算法是通过递归来实现，这次摒弃掉了递归，采用了Fiber模型来实现。

浏览器每一帧需要做的事情：
![](./browser-frame.png)

- workInProgress tree代表了当前正在执行更新的Fiber树，currentFiber tree代表上次构建渲染的树，每一次更新完成，workInProgree就会复制给currentFiber。
- 该算法把整个diff过程分成了若干小任务，在浏览器空闲时间才会去做（这里用到了requestIdleCallback回调里的IdleDeadline参数的timeRemaining方法是否小于1进行判断当前是否还有剩余时间）。
- 小任务通过链表结构互相关联。
- 由于分散过程中会产生若干任务，每个任务拥有优先级。
- 小任务的执行过程，即创建、更新、挂起、恢复以及终止操作都是发生在workInProgress tree的创建过程中，这个构建过程就是循环的执行任务和创建下一个任务。过程简写代码如下。
``` javascript
let nextUnitWork = null;//下一个执行单元
//开始调度
function shceduler(task){
     nextUnitWork = task; 
}
//循环执行工作
function workLoop(deadline){
  let shouldYield = false;//是否要让出时间片交出控制权
  while(nextUnitWork && !shouldYield){
    nextUnitWork = performUnitWork(nextUnitWork)
    shouldYield = deadline.timeRemaining()<1 // 没有时间了，检出控制权给浏览器
  }
  if(!nextUnitWork) {
    conosle.log("所有任务完成")
    //commitRoot() //提交更新视图
  }
  // 如果还有任务，但是交出控制权后,请求下次调度
  requestIdleCallback(workLoop,{timeout:5000}) 
}
/*
 * 处理一个小任务，其实就是一个 Fiber 节点，如果还有任务就返回下一个需要处理的任务，没有就代表整个
 */
function performUnitWork(currentFiber){
  //beginWork(currentFiber) //找到儿子，并通过链表的方式挂到currentFiber上，每一偶儿子就找后面那个兄弟
  //有儿子就返回儿子
  if(currentFiber.child){
    return currentFiber.child;
  } 
  //如果没有儿子，则找弟弟
  while(currentFiber){//一直往上找
    //completeUnitWork(currentFiber);//将自己的副作用挂到父节点去
    if(currentFiber.sibling){
      return currentFiber.sibling
    }
    currentFiber = currentFiber.return;
  }
}
```

-  一个小任务的大概构成。
``` javascript
class FiberNode {
  constructor(tag, pendingProps, key, mode) {
    // 实例属性
    this.tag = tag; // 标记不同组件类型，如函数组件、类组件、文本、原生组件...
    this.key = key; // react 元素上的 key 就是 jsx 上写的那个 key ，也就是最终 ReactElement 上的
    this.elementType = null; // createElement的第一个参数，ReactElement 上的 type
    this.type = null; // 表示fiber的真实类型 ，elementType 基本一样，在使用了懒加载之类的功能时可能会不一样
    this.stateNode = null; // 实例对象，比如 class 组件 new 完后就挂载在这个属性上面，如果是RootFiber，那么它上面挂的是 FiberRoot,如果是原生节点就是 dom 对象
    // fiber
    this.return = null; // 父节点，指向上一个 fiber
    this.child = null; // 子节点，指向自身下面的第一个 fiber
    this.sibling = null; // 兄弟组件, 指向一个兄弟节点
    this.index = 0; //  一般如果没有兄弟节点的话是0 当某个父节点下的子节点是数组类型的时候会给每个子节点一个 index，index 和 key 要一起做 diff
    this.ref = null; // reactElement 上的 ref 属性
    this.pendingProps = pendingProps; // 新的 props
    this.memoizedProps = null; // 旧的 props
    this.updateQueue = null; // fiber 上的更新队列执行一次 setState 就会往这个属性上挂一个新的更新, 每条更新最终会形成一个链表结构，最后做批量更新
    this.memoizedState = null; // 对应  memoizedProps，上次渲染的 state，相当于当前的 state，理解成 prev 和 next 的关系
    this.mode = mode; // 表示当前组件下的子组件的渲染方式
    // effects
    this.effectTag = NoEffect; // 表示当前 fiber 要进行何种更新
    this.nextEffect = null; // 指向下个需要更新的fiber
    this.firstEffect = null; // 指向所有子节点里，需要更新的 fiber 里的第一个
    this.lastEffect = null; // 指向所有子节点中需要更新的 fiber 的最后一个
    this.expirationTime = NoWork; // 过期时间，代表任务在未来的哪个时间点应该被完成
    this.childExpirationTime = NoWork; // child 过期时间
    this.alternate = null; // current 树和 workInprogress 树之间的相互引用
  }
}
```

???副作用到底是什么
