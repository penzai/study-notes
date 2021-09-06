# Web 与网络

## 术语缩写

- `WWW` (Word Wide Web) 万维网
- `AJAX` (Asynchronous JavaScript and XML) 异步 JavaScript 与 XML 技术
- `URI` (Uniform Resource Identifier) 统一资源标识符
- `URL` (Uniform Resource Locator) 统一资源定位符
- `XML` (Extensible Markup Language) 可扩展标记语言
- `HTML` (HyperText Markup Language) 超文本标记语言
- `HTTP` (HyperText Transfer Protocol) 超文本状态转移协议
- `FTP` (File Transfer Protocol) 文件传输协议
- `DNS` (Domain Name System) 域名系统
- `TCP` (Transmission Control Protocol) 传输控制协议
- `SYN` (Synchronize Sequence Numbers) 同步序列编号
- `ACK` (Acknowledgement) 确认字符
- `UDP` (User Data Protocol) 用户数据报协议
- `MAC` (Media Access Control Address) 网卡固定地址
- `ARP` (Address Resolution Protocol) 解析地址的协议（根据通信方的 IP 地址反查出对应的 MAC 地址）
- `REST` (Representational State Transfer) 表征状态转移
- `SSL` (Secure Sockets Layer) 安全套接层
- `TLS` (Transport Layer Security) 传输层安全
- `Dos` (Denial of Service) 拒绝服务攻击
- `CDN` (Content Delivery Network) 内容分发网络
- `SSO` (Single Sign On) 单点登录
- `CAS` (Central Authentication Service) 中央认证服务
- `CORS` (cross-origin resource-sharing) 跨域资源共享标准

## 浏览器

- 进程：CPU 进行资源分配的最小单位
- 线程：CPU 调度的最小单位

现代浏览器为多进程程序。

- 浏览器进程。
- 插件进程。
- GPU 进程。
- 渲染进程。

而渲染进程就是我们常说的内核，一个 tab 对应一个渲染进程，页面所有东西都由此进程建立的各种线程来配合实现。

- GUI 线程。
- 定时器触发线程。
- 事件触发线程。
- HTTP 请求线程。
- Javascript 引擎线程。
> GUI线程与Javascript引擎线程互斥！

浏览器每一帧会做的事：
![](../js/browser-frame.png)

## 事件循环（event loop）

事件循环是**浏览器的 JavaScript 运行时环境**的一部分，是为了让 JS 引擎更好的处理代码（异步并发）的一种模型或者叫做机制。

JS 引擎执行时，会利用到 Stack 与 Heap，Heap 主要存储一些非结构化数据，比如对象。而 Stack，JS 引擎在执行代码时会将执行上下文（也可以称作函数帧）压入其中，当 Stack 为空，就代表当前主线程空闲。

> 执行上下文，执行栈，context。指的是js引擎在执行代码中首先会压入一个全局执行环境，然后开始执行代码，遇到函数，则产生一个新的执行环境，执行环境里面有this指向、私有变量、上一个执行环境指向、参数等数据。然后继续执行代码，函数执行完毕并返回结果后，则弹出执行环境回到上一个，当栈中的执行环境为空时，则js引擎线程空闲。

还有一个 Queue，也称消息队列，异步操作会往里面添加一个又一个的事件操作，等待 JS 主线程空闲的时候，会取出队列的第一项处理，并在处理完成后弹出队列。具体执行过程为：
主线程 + 微任务 + （是否渲染页面）+ 宏任务 + 微任务　+ （是否渲染页面）+...循环下去。

JS 主线程未空闲时，其它操作会被阻塞，比如点击事件响应。且 JS 主线程与渲染线程是互斥的。

> 关于点击事件，人工合成的点击事件（.click()/dispatchEvent（））是同步的，而用户用鼠标自己点的，是要放在任务队列的。并且在 task queue 中鼠标键盘事件优先级最高，所以如下代码有以下输出。

```javascript
btn.addEventListener("click", (e) => {
  console.log("btn click");
});

//  耗时2.2s
function long() {
  let n = 1000 * 1000 * 1000 * 2;
  while (n > 0) {
    n--;
  }
}

setTimeout(() => {
  console.log("setTimeout");
});
long(); //在这期间点击按钮

// 最后输出为：btn clik -> setTimeout
```
> 另外，人工合成的事件的回调中throw error并不会中断当前线程。

再次测试，依然不太明白到底什么时候进行UI渲染???。如下示例：
``` javascript
setTimeout(() => {
  document.body.style.background = 'red'
  console.log('main start')
  function long() {
    let i = 1e9 * 5
    while(i-- > 0) {}
  }
  btn.addEventListener('click', () => {
    console.log('btn click start');
    long()
    console.log('btn click end');
    setTimeout(() => {
      console.log('btn timeout click start');
      long()
      console.log('btn timeout click end');
    }, 0)
  })
  long()
  console.log('main end')
}, 4000)
```
如果main start之后点击按钮，dom不会再main end之后变色，而是会在按钮事件执行完毕后变色，但是如果再按钮事件执行之中，再次点击按钮，dom依然是在按钮第一次结束后就变色。


**宏任务/任务队列/task/macroTask**（由宿主发起）

- `setTimeout`
- `setInterval`
- `I/O`
- `setImmediate` (`node`, 在`v.9.11.1`环境下测试，慢于 `setTimeout(fn, 0)`)
- `requestAnimationFrame`（浏览器）
- `MessageChannel`

> setInterval，当任务队列里有此实例时，不会再向队列里添加事件。因为使用setTimeout模拟setInterval效果时，两者有本质的区别。前者间隔事件一定大于delay，而使用setTnterval不一定会。

**微任务 microTask**（由 javascript 引擎发起）

- `Promise`的`then`、`catch`、`finally`
- `process.nextTick`（`node`）
- `MutationObserver`（浏览器）

#### `process.nextTick`

应用例子：用于事件监听，防止触发一个操作时，事件还没绑定。

```javascript
const server = net.createServer(() => {}).listen(8080);

server.on("listening", () => {});
```

## HTML
标记语言是一种将文本和一些其他信息结合的计算机文字编码。在这基础之上加入超链接，即构成了 HTML。与 HTML 一起构建网页的还有 CSS 和 JavaScript，HTML 和 CSS 的标准主要由 W3C 组织维护。


## 事件模型

### DOM 事件模型

xxx.onclick，发生在冒泡阶段

### DOM 2 级模型

- 捕获，目标，冒泡三个阶段
- e.currentTarget 指向注册事件的监 DOM 对象，e.target 指向事件发生的 DOM 对象
- this 指向指向注册事件的监听 DOM 对象

事件委托：

```javascript
const delegate = (delegateEl, type, wannaBindElSelectorString, fn) => {
  delegateEl.addEventListener(type, (e) => {
    let el = e.target;
    while (!el.matches(wannaBindElSelectorString)) {
      if (el === delegateEl) {
        el = null;
        break;
      }
      el = el.parentNode;
    }

    el && fn.call(delegateEl, e);
  });

  return delegateEl;
};
```

## AJAX

### get 与 post

本质上都是万维网中传输数据的一种协议，所有的区别都来自于浏览器或者规范的限制。

- 语义不同
- 浏览器限制`url`长度 2k 左右 -> get 请求有长度限制
- 不同服务器对 get 中的 request body 处理方式不同，所以 body 里面的信息不一定会被识别 -> get 请求使用 url 进行透明传参

## 图片

### 优化手段

- webpack 压缩，并开启渐进效果提升体验。
- 按需加载。使用 IntersectionObserver 可监听元素进入视野内，使用 chrome 特有的 loading 属性。
- 固定图片设置背景渐变色，用工具获取色值。
- retina 屏幕，img 标签使用 srcset 属性。
- webP。使用 picture 标签加载多种格式图片来兼容处理，.webp 排第一位。也可以使用 cdn 判断。

### 懒加载图片

实现原理：元素的 offsetTop < 页面的 scrollTop + 页面的 clientHeight

元素 offsetTop 的获取：

```javascript
function getH(el) {
  var h = 0;
  while (el) {
    h += el.offsetTop;
    el = el.offsetParent;
  }
  return h;
}
```

## 从 URL 输入开始

### 1. dns 解析

通过域名找寻 ip 地址

在如今的网络之下，各网站都会接入cdn，来进行内容分发，这时`智能调度DNS`系统就会根据用户的不同分配不同的“边缘”服务器（CNAME域名导向，网站域名 -> CDN提供的域名 -> “边缘”服务器ip），让更快的进行访问。

#### 顺序

1. 浏览器缓存
2. 系统缓存
3. host 文件
4. LocalDNS 服务器

- a. 请求根域名服务器（RootDNS），得到主域名服务器（ gTLDServer）地址
- b. 请求主域名服务器（ gTLDServer），如 .com、 .cn、. org 等，得到域名提供商服务器地址（NameServer）
- c. 请求域名提供商服务器地址（NameServer），如`xxx.com`，至此获得 IP 和 TTL 值
  > dns 缓存存在多级，例如浏览器缓存、系统缓存、路由器缓存、IPS 服务器缓存、根域名服务器缓存、顶级域名服务器缓存、主域名服务器缓存。

#### 优化

- DNS 预解析
  ```html
  <meta http-equiv="x-dns-prefetch-control" content="on" />
  <link rel="dns-prefetch" href="//example.com" />
  ```
- 异步下载 js
- 对资源使用 prelaod 和 prefetch。
- CDN，通过在现有的 Internet 中增加一层新的 CACHE(缓存)层，将网站的内容发布到最接近用户的网络”边缘“的节点
- HTTPDNS，使用 HTTP 协议替代 UDP 协议，绕过 LocalDNS，可以有效防止域名劫持
- DNS 负载均衡（根据权重轮询返回不同的服务器地址）

### 2. 查询缓存决定是否发送 HTTP 请求

#### 强缓存

服务端通过 cache-control(1.1)(max-age=毫秒)和 expires(1.0)(Date 类型值)设置，命中则不发起请求，直接调用磁盘缓存。优先级 cache-control > expires。

#### 协商缓存

服务端通过 last-modified/if-modified-since(Date 类型值)组合或者 etag/if-none-match(资源码)组合来判断，前者是服务端设置，后者是客户端请求携带。优先级 ETag > Last-Modified。

#### 其他缓存

pragma(1.0)，只有一个唯一值 no-cache。优先级 pragma > cache-control。

#### 用户行为

我们可以把刷新/访问界面的手段分成三类：

- 在 URI 输入栏中输入然后回车/通过书签访问/location.href。会通过 Expires 或者 Cache-Control 判断是否过期，未过期则不发送请求，使用缓存，返回 200
- F5/点击工具栏中的刷新按钮/右键菜单重新加载。始终会发送一个请求，并带上 etag 或者 last-modified 的值，以此来决定是否使用缓存（命中就返回 304）。
- Ctl+F5。彻底拿一份新资源。

### 3. TCP 连接

- 在 http/1.0 中，官方不支持持久连接，需要双端支持并指定头`connection: Keep-Alive`。
- 在 http/1.1 中，支持持久连接，但一个 TCP 连接一个时刻只能处理一个 http 请求，不过多个 http 请求可以复用这次连接。
- 在 http/2.0 中，一个 TCP 就可以同时处理多个 http 请求，名为 Multiplexing。
- 不同浏览器对 TCP 连接的数量限制不一样，chrome/6，safari/6，firefox/32。

#### 建立，三次 🤝

TCP 是可靠连接，主要靠序号（sequence number）和确认号（acknowledgement number）来保证信息的完整、有序和无差错。

TCP 首部如下：
![](../images/web/tcp_header.jpg)

握手中有两个常用的动作：

- ACK=1，表示设置**标志位 ACK**为 1（注意与确认号 ack 的区别）。
- ack=x+1，表示设置**数据域确认号**的值为 x+1。

> TCP 规定，SYN=1 的报文段不能携带数据（指 TCP 数据部分），且会消耗掉一个序号（下次必须使用另外的序号了，比如 x+1）。

标志位代表此 TCP 报文的目的，常用的有表示同步 SYN(synchronisation)、表示确认 ACK(acknowlegement)、表示完成 FIN(finally)

最终，建立连接的握手流程如下（x，y 为各自的初始序号）：

1. C ----(SYN=1，seq=x)----> S
2. C <----(SYN=1，ACK=1，seq=y，ack=x+1)---- S
3. C ----(ACK=1，seq=x+1，ack=y+1)----> S

#### 交流数据，两次 🤝

- C ----(ACK=1，seq=x+1，ack=y+1)----> S
- C <----(ACK=1，ack=x+2)---- S

#### 断开，四次 🤝

- C ----(FIN=1，seq=u)----> S
- C <----(ACK=1，seq=v，ack=u+1)---- S
- C <----(FIN=1，ACK=1，seq=w，ack=u+1)---- S
- C ----(ACK=1，seq=u+1，ack=w+1)----> S

#### 优化

- 优化请求的流量，服务器开启 Gzip

### 4. 渲染

浏览器内核，一个 tab 页，代表一个进程，它又拥有多个线程。

- GUI 渲染线程
- js 引擎线程
- 事件触发线程（ok 后放入 js 引擎的执行队列）
- 定时触发线程（ok 后通知事件触发线程）
- 异步 HTTP 请求线程（ok 后通知事件触发线程）

渲染过程：

- HTML -> DOM、CSS 规则计算
- 把 CSS 规则应用到 DOM 树上
- Render Tree 排版，即所谓的重排/回流（reflow/layout），计算节点的几何信息（位置、大小）
- 重绘（repaint/redraw），绘制、合成位图显示

重排代价太多，所以浏览器使用队列栈来减少消耗。因此获取几何信息时，会强制清空栈而触发重排操作。

#### 一些用户体验指标

- 100ms，用户输入反馈。
- 60FPS，网页动画的帧数（使用 requestAnimatinFrame）。
- 1s，网页加载完毕的时间。
- 50ms，空闲周期的任务（requestIdleCallback）。

优化：

- 读取那些需要回流的值时，用变量缓存。
- 使用 requestAnimatinFrame 执行动画，transfrom 操作动画

#### 帧

浏览器刷新率一般为 60HZ，即一秒钟刷新 60 次，所以每次的间隔为 16.6ms，叫一帧。在每一帧中，浏览器会完成 task + microTask + task2 + microTask2 + ... +render 的操作（这里任务数不定）。

所以如果 task 任务过长，那么这一帧就没有 render，就会卡顿即掉帧。

而 requestAnimationFrame 则为在每一帧 render 前执行，所以动画常使用此函数，保证效果最好。

requestIdleCallback 则为在 render 之后，如果还有剩余时间（整个过程时间未超过 16.6ms）,就执行此函数任务。

## WEB 安全

### 同源策略

浏览器拥有严格的同源策略（协议、域名、端口必须全部相同），不同源的交互就会受到限制。

> 同源与同站有区别

#### 解决办法

一般的交互，我们分为 dom 获取、cookie 获取以及事件。

- dom 获取：设置 document.domain
  > domain 的值只能设置为当前域或父域,且不能设置协议与端口，且是交互的双方同时设置。
- cookie 获取：设置 cookie 的 domain 属性
  > cookie 的 sameSite 属性分为三个值：
  >
  > - `Strict` 跨站不发送 cookie。
  > - `Lax` a 标签/link/form（get）发送，post/img 标签/script 标签/iframe/ajax 不发送。
  > - `None` 都发送
- 事件：使用 window.postMessage

如果是要获取数据，可以使用：

1. JSONP
2. CORS（post 请求）
3. nginx 反向代理
4. 设置 crossOrigin 属性（html 元素，script/img/video 等）

TODO: 待实践验证

### 常见

### XSS 跨站脚本（Cross Site Scripting）

分为以下几类：

- 存储型：input 区域输入恶意代码进入数据库，下次用户打开加载脚本。
- 反射型，后端根据 url 的内容进行内容返回。比如搜索关键词为“脚本”的链接，这种链接给其他人访问时就会触发该脚本。
- DOM 型，前端将 url 中的内容不做处理加入到页面中，类似于反射，不过不经过后台。

预防：

- 设置 cookie 为 httponly。
- 过滤输入输出。特殊 HTML 标签、js。
- 设置 CSP 白名单。

### CSRF 跨站请求伪造（Cross site request forgery）

预防：

- 设置 cookie 的 sameSite 属性
- 接口验证来源

### SQL 注入

### 点击劫持

预防：

- 设置 X-Frame-Options，方式第三方加载 iframe 嵌套

### DDoS，拒绝服务攻击。

## 常见项目优化

- 常用第三方库用 cdn 引入（公司专用最好），使用 webpack 的 externals 动态引入。
- gzip 压缩。打包时生成.gz 文件，方便 nginx 服务器直接返回文件，无需利用 cpu 计算。
- preload 预加载首屏需要图片
- dns-prefetch 预解析需要跨域的 dns
- 首屏使用动画，提前渲染，减少用户的焦虑感
- moment.js 改为使用 day.js
- 图片懒加载。

1.  在 scroll 事件里处理（根据 getBoundingClientRect 接口获取 top 与 scrollTop 比对），需要注意几点（事件函数节流，首次先运行一次，滚动完毕移除事件）
2.  或者使用 IntersectionObserver 构造函数管擦判断是否加载图片
3.  使用 vue-lazyload 插件

- 图片使用.webp 格式，为了兼容不使用的环境，使用 picture 标签来设定一层层的兼容
- 减少 DOM 操作。避免获取视图信息（getBoundingClientRect,clientWidth,offsetWidth）,因为它会立即更新浏览器重排/重绘维护的队列。高频事件防抖节流。
- 打包优化，使用 DllPlugin 分离第三方类库，使用 add-asset-html-webpack-plugin 来注入到 index.html 中

## HTTP 状态码

- 301，永久重定向。浏览器会更新缓存，下次直接到新的页面；SEO 会转移相应旧站的流量排名到新站，但是内容一定要高度一致，不然视为黑帽 SEO。
- 302，临时重定向

## CORS（跨域资源共享）
### 判断是否是simple request
根据**method**与**request header**进行判断。以下为simple request。
- method: PUT、GET、POST
- header: 基本字段，注意 content-type 只允许 application/x-www-form-urlencoded、multipart/form-data、text/plain，**也就是 json 参数是算 not-so-simple request**。

### simple request
浏览器会自动带上 origin 字段，服务器进行逻辑判断，给出 response。

- **允许**，服务器在 response header 中设置`Access-Control-Allow-Origin: *`，或者为 origin 的值。

- **不允许**，正常返回信息与头，浏览器判断没有相应的头，自动识别请求失败。

#### 需要发送cookie的情况
- 客户端。浏览器需要在 ajax 中设置`withCredential = true`。
- 服务端。在 response header 中设置`Access-Control-Allow-Credentials: true`。**另外`Access-Control-Allow-Origin`这时就不能返回\*了，必须为明确的地址。**

### not-so-simple request
同时满足1，2条件即可跨域成功：
1. 会在请求之前发送一次 method 为`OPTIONS`的“预检”请求。
  - 预检成功。响应头包含以下内容：
    - 状态码204。
    - `Access-Control-Allow-Origin`为请求源。
    - `Access-Control-Allow-Headers`为额外首部。
    - （经测试）如果是get/post以外的方法，那么还需设置`Access-Control-Allow-Methods`
  - 预检失败。不满足上述条件。
2. **预检成功后，实际请求也需要设置`Access-Control-Allow-Origin`为请求源**

另外，此类request header 也会携带一些信息。

- `Access-Control-Request-Method`，包含 cors 会用到的方法。
- `Access-Control-Request-Headers`，一个以逗号分隔的字符串，包含 cors 会额外发送的头信息字段，**如果浏览器发送了这个字段，那么服务器也必须按返回相应的`Access-Control-Allow-Headers`字段，否则预检失败。**

预检请求只发一次，后面的 not-so-simple request 当做 simple request 请求处理，因为服务器可以在第一次预检请求的 response header 中设置`Access-Control-Max-Age`。

## HTTP

### 特点

优点：

- 灵活，可传递文本，图片，视频。
- 可靠性传输，因为其架设在 TCP/IP 这个传输层协议上。

缺点：

- 无状态（有好有坏）
- 队头阻塞
- 明文传输

### HTTP2.0

- 二进制分帧，头信息和数据体都是二进制格式。
- 头部压缩，主要还是利用索引的方式压缩。
- 多路复用。
- 服务器推送。
- 请求优先级设置。

在 http2 中，一份报文被拆成若干二进制帧，以帧的形式传输，根据帧首部的流标识，再按顺序可以组装成相应的报文（同一份报文的帧传输顺序是有序的，所以可以按顺序组装）。

### HTTPS

HTTPS 并不是一个新的协议，是 HTTP 与 TLS 的组合。

- 服务器发送给客户端公钥
- 客户端利用自带认证中心证书验证是不是客户端
- 是，本地生成密钥 A，利用公钥发给服务器（只有服务器拥有的私钥能解开）
- 此后交流都用密钥 A

## DNS

DNS 协议是应用层协议，运行在 UDP 协议之上，使用端口号 53。利用它来找到域名所对应的 ip，有了 ip 才能连接到主机。

首先会在本机以及路由器使用递归查询找寻。然后再由本地 dns 服务器(通常是 ISP 那儿)使用迭代查询找到 ip 返给你。

实现负载均衡时，由于缓存原因，会把已经失效的 ip 地址一直返回给你。

## Header

### Host/Referer/Origin/

- Host。由`域名/ip + 端口号`组成，主要用于同一 ip 地址部署多个项目时，识别来源。
- Referer。来源页面，由 url 地址组成（不含 hash 值）。常用于图片防盗链。
- Origin。由`协议 + 域名/ip + 端口号`组成。用于 CORS 请求后者 host 请求（因此比 host 多了协议部分）。

## 浏览器版本判断

### IE

只 IE 判断，使用 api 方式。

```javascript
const isIE = () => document.documentMode;
```

判断 IE 具体版本号，使用条件语句。

```javascript
const isIE = (version) => {
  const b = document.createElement("b");
  b.innerHTML = `<!-- [if IE ${version}]>1<![endif]-->`;
  return b.innerHTML === "1" || b.innerHTML === 1;
};
```

## 新星技术
- Web Assembly，又称wasm，是一种实验性的低级语言。旨在浏览器里提供接近本地的速度运行其它低级语言。如c。
- Web Worker，通过使用Worker对象，可以构建一个独立于主线程之外的后台线程，但有很多限制。
- Service Worker，运行在浏览器背后的脚本，可以进行资源和网络上的操作。所以常用做离线缓存（pwa）、数据推送。
- Web Component，允许自定义HTML标签，也就是组件，会以shadow dom的方式加入到DOM中。

## 事件

### 鼠标事件
- mousemove，移动相关的事件(move/over/out/enter/leave)时，可以通过`e.relatedTarget`获取最近元素，不过浏览器会优化事件，因此这个鼠标移动的元素并不是连续的，移动太快会跳过中间的元素。
- mouseup/mousedown，当元素没有在绑定元素之内时，放开鼠标并不会触发mouseup事件。
- mouseover/mouseout，冒泡。也就是说触发了子元素的mouseover，父元素也会被触发，表现的现象就是，元素A内部的子元素B移动也会触发元素的A的mouseover事件。
- mouseenter/mouseleave，不冒泡，因此只要在元素A内部，不管怎么移动都不会触发mouseenter事件。

e的相关属性：
- `pageX`/`pageY`，相对于当前document而言（计算滚动部分）。
- `clientX`/`clientY`，相对于浏览器窗口而言。
- `screenX`/`screenY`，相对于屏幕而言。
- `offsetX`/`offsetY`，相当于元素的padding edge而言。譬如offsetX为0的位置在padding-left最左边缘也就是border-left的最右边缘处。

## 性能
### 优化理念
- 尽快接触到资源
  - dns-prefetch
  - cdn
  - 缓存
  - link标签的prefetch（空闲时处理）/preload（异步请求，完成后不执行，等待用的时候就可以马上执行，可用于加载图像字体脚本，一般用于重要资源）
  - 脚本的async(异步请求，完成后立马执行)/defer（异步请求，最后执行），任何参数都不加（同步请求，完成后立马执行）
- 减少资源大小
  - jscss压缩
  - gzip压缩
  - 图片优化大小）
- 时间分片“长任务”

### 杂项
- 检测开发者工具打开
``` javascript
// 监听一个对象的一个属性，并在控制台打印这个对象
// 每当开发者工具打开时就会读取这个属性
const img = new Image();
Object.defineProperty(img, "id", {
  get() {
    console.log("打开开发者工具");
  }
});
console.log(img);
```
