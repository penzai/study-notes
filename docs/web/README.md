# Web 与网络

## 术语缩写

- `WWW` (Word Wide Web) 万维网
- `AJAX` (Asynchronous JavaScript and XML) 异步 JavaScript 与 XML 技术
- `URI` (Uniform Resource Identifier) 统一资源标识符
- `URL` (Uniform Resource Locator) 统一资源定位符
- `HTML` (HyperText Markup Language) 超文本标记语言
- `HTTP` (HyperText Transfer Protocol) 超文本状态转移协议
- `FTP` (File Transfer Protocol) 文件传输协议
- `DNS` (Domain Name System) 域名系统
- `TCP` (Transmission Control Protocol) 传输控制协议
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

## 容量

1 字节（Byte）= 8 比特（bit)

1KB = 1000Byte

1KiB = 1024Byte

## 渲染

- script 会阻塞渲染
- link 在没有 script 的情况下不会阻塞渲染，有 script 的情况下会阻塞
- 两种标签均可设置异步避免阻塞，script 使用 defer/sync，link 使用`media="print"`。
  > async 加载后立即执行，没有顺序可言。script 按顺序异步加载，所以比 async 慢。

## 事件模型

### DOM 事件模型

xxx.onclick，发生在冒泡阶段

### DOM 2 级模型

- 捕获，目标，冒泡三个阶段
- e.currentTarget 指向注册事件的监 DOM 对象，e.target 指向事件发生的 DOM 对象
- this 指向指向注册事件的监听 DOM 对象

## 尺寸

- `clientWidth/clientHeight`：`padding` + `content`
- `clientTop/clientLeft`：`border`
- `offsetWidth/offsetHeight`：`padding` + `content` + `border`
- `offsetTop/offsetLeft`: 元素左上角距离最近定位元素的距离
- `scrollWidth/scrollHeight`: `client`系列 + 溢出尺寸
- `scrollLeft/scrollTop`: 元素滚动条位置，**可写**(即调整滚动条位置，整个网页的滚动条位置用`window.scrollTo(x, y)`)
  > `getBoundingClientRect`获取元素位置宽高

## ajax

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

## 编码与解码

`encodeURI`、`decodeURI`、`encodeURIComponent`、`decodeURIComponent`

```javascript
encodeURI("http://www.baidu.com/My First");
encodeURIComponent("http://www.baidu.com/My First");
// http://www.baidu.com/My%20First
// http%3A%2F%2Fwww.baidu.com%2FMy%20First
decodeURI("http://www.baidu.com/My%20First");
decodeURIComponent("http%3A%2F%2Fwww.baidu.com%2FMy%20First");
```

## 跨域

三同条件：

1. 协议相同
2. 域名相同
   > 完整域名，例如 www.baidu.com 与 baidu.com 不同！！！
3. 端口相同

### 解决办法

- JSONP
- CORS
- document.domain，父子 iframe 同时设置此属性，a.bbb.com 与 a2.bbb.com 即可通信
- window.postMessage，监听 message 事件收取信息
- nginx 反向代理

## 从 URL 输入开始

### 1. dns 解析

通过域名找寻 ip 地址

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

- 减少 DNS 的请求次数
- DNS 预解析
  ```html
  <meta http-equiv="x-dns-prefetch-control" content="on" />
  <link rel="dns-prefetch" href="//example.com" />
  ```
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

- 在 http/1.0 中，不支持持久连接，所有连接串行。
- 在 http/1.1 中，支持持久连接，但一个 TCP 连接一个时刻只能处理一个 http 请求，不过多个 http 请求可以复用这次连接。
- 在 http/2.0 中，一个 TCP 就可以同时处理多个 http 请求，名为 Multiplexing。
- 不同浏览器对 TCP 连接的数量限制不一样，chrome/6,safari/6,firefox/32。

#### 建立，三次 🤝

握手结束后再开始发送信息！

- C --(SYN 数据包)--> S
- C <--(SYN/ACK 数据包)-- S
- C --(ACK 数据包)--> S

### 4. 渲染

浏览器内核，一个 tab 页，代表一个进程，它又拥有多个线程。

- GUI 渲染线程
- js 引擎线程
- 事件触发线程（ok 后放入 js 引擎的执行队列）
- 定时触发线程（ok 后通知事件触发线程）
- 异步 HTTP 请求线程（ok 后通知事件触发线程）

渲染过程：

- HTML -> DOM
- CSS -> CSSOM
- DOM + CSSOM -> Render Tree
> Render Tree 跟 DOM Tree 并不是一一对应，比如 head 节点和 display:none 的节点
- 重排/回流（reflow），计算节点的几何信息（位置、大小）
- 重绘（repaint），转化为屏幕的实际像素

重排代价太多，所以浏览器使用队列栈来减少消耗。因此获取几何信息时，会强制清空栈而触发重排操作。

### 5. TCP 断开

四次 🤝

- C --(FIN，ACK)--> S
- C <--(ACK)-- S
- C <--(FIN)-- S
- C --(ACK)--> S

## 疑问

- PUT DELETE 方法为什么不常用，不带验证机制什么意思？
- CDN 具体是怎么应用的

## 攻击

- XSS，动态解析 html（从服务端数据或者从 url 上）造成加载其它不可控的脚本。
- SQL 注入攻击，动态拼接 SQL 造成调用攻击者设置好的 SQL。
- OS，例如发邮件调用系统级的 shell 时。
- HTTP 首部注入，例如利用 location 字段进行注入攻击。
- CSRF，跨站点请求伪造。
- DDoS，拒绝服务攻击。

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

## HTTP状态码
- 301，永久重定向。浏览器会更新缓存，下次直接到新的页面；SEO会转移相应旧站的流量排名到新站，但是内容一定要高度一致，不然视为黑帽SEO。
- 302，临时重定向
