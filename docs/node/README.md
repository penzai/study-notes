# node
### 特点
主旨是力求在单线程上将资源分配得更高效。

- **事件驱动**。Node的执行模型是事件循环(在libuv库里面)，分为6个阶段。
  - timers
  - pending callbacks，执行延迟到下一个循环迭代的I/O回调。
  - idle, prepare，内部使用
  - poll，轮询阶段。
    - 计算应该阻塞和轮询 I/O 的时间。
    - 然后，处理 轮询 队列里的事件
  - check
  - close callbacks

  在每次运行的事件循环之间，Node.js 检查它是否在等待任何异步 I/O 或计时器，如果没有的话，则完全关闭。
- **异步I/O**。在单线程上实现异步I/O很难，但是可以利用多线程的方式模拟。

  开辟另外的线程来执行阻塞式I/O或者非阻塞式I/O加轮询技术来完成数据获取，让一个线程进行计算处理（I/O操作的耗时虽然只有几到几百毫秒，但是相比于CPU的时钟来说，还是差了很多几个数量级）。*nix系统基于多线程池创建，windows平台基于IOCP创建。
> 对操作系统内核来说，只有阻塞和非阻塞式I/O两种方式。
- **单线程**。这里的单线程指的是Javascript执行，其实另外的I/O处理都是靠其它线程实现的。
  - 好处是不用同步状态。
  - 缺点：
    - 无法利用多核CPU。
    - 错误会引起整个应用退出。
    - 如果出现大量计算会占用CPU，导致无法继续调用I/O。解决办法，即处理CPU密集型的方法：
      - 通过编写C/C++扩展来执行v8性能不好的计算。
      - 子进程`child_process`，通过Master-Worker的管理方式。
> node在web高性能的一个原因就是省去了创建线程、销毁线程和切换线程的开销。一个请求只是触发了I/O观察者的一个事件。
- **跨平台**。使用libuv组件实现跨平台。


### 应用场景
- I/O密集型。因为事件循环机制。
## 事件循环机制
node的I/O模型是非阻塞式，得益于它的事件循环机制，适合高并发应用（构建web应用中间层），但是Javascript执行效率低，不适合业务逻辑太复杂。

### 宏任务
- setTimeout
- setInterval
- setImmediate
- script
- I/O操作

### 微任务
- process.nextTick（在微任务队列之前执行）
- promise

### 各阶段概述
- 定时器检测阶段(timers)：本阶段执行 timer 的回调，即 setTimeout、setInterval 里面的回调函数。
- I/O事件回调阶段(I/O callbacks)：执行延迟到下一个循环迭代的 I/O 回调，即上一轮循环中未被执行的一些I/O回调。
- 闲置阶段(idle, prepare)：仅系统内部使用。
- 轮询阶段(poll)：检索新的 I/O 事件;执行与 I/O 相关的回调（几乎所有情况下，除了关闭的回调函数，那些由计时器和 setImmediate() 调度的之外），其余情况 node 将在适当的时候在此阻塞。
- 检查阶段(check)：setImmediate() 回调函数在这里执行
- 关闭事件回调阶段(close callback)：一些关闭的回调函数，如：socket.on('close', ...)。

### poll阶段
如果当前已经存在定时器，而且有定时器到时间了，拿出来执行，eventLoop 将回到 timers 阶段。
如果没有定时器, 会去看回调函数队列。
- 如果 poll 队列不为空，会遍历回调队列并同步执行，直到队列为空或者达到系统限制
- 如果 poll 队列为空时，会有两件事发生
  - 如果有 setImmediate 回调需要执行，poll 阶段会停止并且进入到 check 阶段执行回调
  - 如果没有 setImmediate 回调需要执行，会等待回调被加入到队列中并立即执行回调，这里同样会有个超时时间设置防止一直等待下去,一段时间后自动进入 check 阶段。

### process.nextTick
在每一个 eventLoop 阶段完成后会去检查 nextTick 队列，如果里面有任务，会让这部分任务优先于微任务执行。

node11之前，在定时器阶段会先完成所有已到期的定时器回调，再执行微任务。
node11之后，向浏览器看起，会在定时器阶段每一个定时器任务执行完后，清空微任务。

## express

- 由路由和中间件组成，本质上可以理解为应用在调用各种中间件

### 中间件

中间件（Middleware）是一个函数，它可以访问请求对象 req，响应对象 res，以及 web 应用中处于请求 - 响应循环流程中的中间件 next。

> 如果当前中间件没有结束循环，则必须调用 next()把控制权交给下一个中间件，否则请求会挂起。

#### 主要功能

- 执行任何代码
- 修改请求和响应对象
- 终结请求-响应循环
- 调用堆栈中的下一个中间件

## 打包目录文件
``` js
const fs = require('fs')
const archiver = require('archiver')
const moment = require('moment')

const nowF = moment().format('YYYY_MM_DD_HH-mm')
const output = fs.createWriteStream(`${nowF}.zip`)
const archive = archiver('zip')

output.on('close', () => {
  console.log(archive.pointer() + ' total bytes')
})

archive.on('error', err => {
  throw err
})

archive.pipe(output)
archive.directory('dist/', false)

archive.finalize()
```
