## 概览

### 起源

网页浏览器诞生后，迫切需要一种语言来整合网页内容以及操作其它的事情。于是网景公司 Netscape 让布兰登 Brendan Eich 设计了这个语言（1995.5），最初取名 Mocha，然后是 LiveScript（1995.9），最后得到 Sun 公司的商标许可，改名 JavaScript（1995.12）。

> 取名是为了蹭 Java 热度。

不久后，微软也在 ie3 上推出了类似的 JScript，由于两公司竞争激烈，没有任何标准可言。于是 Netscape 向 ECMA International（一家国际性会员制度的信息和电信标准制定组织）提交了语言标准（1996.11）。

随后，ECMA 根据提交的标准制定了该脚本语言的标准，并取名 ECMAScript，标准也就是规范的文档名字叫 ECMA-262。于是 JavaScript 就成为了 ECMAScript 的实现之一，同期还出现了 ActionScript。

> 因为版权原因这里不能取名 JavaScript。

ECMAScript 的标准每年发布一次。现在由 TC39 组织来继续负责 ECMAScript 的标准制定。

### Engine

指 JavaScript 引擎，比如 V8、SpiderMonkey 等。负责解释代码并执行。

大概过程：

1. byte stream decoder 解码代码为一个个的 token，传给 Parser，然后构造出 AST；
2. Interpreter 遍历 AST，生成字节码；
3. Profiler 监视代码并对其进行优化；
4. Compiler 将字节码编译为机器可以读取的低级语言；

js 代码 -> (Parser) -> AST -> (Interpreter) -> ByteCode -> (Compiler) -> MachineCode

### Runtime

指 Engine 的具体运行环境，比如浏览器、NodeJS 等。

它们提供了一些额外的接口模块，且按**事件驱动**的方式调度任务（EventLoop）。

### 单线程

因为 js 面对的应用大部分是 I/O 密集型应用，例如文件读写操作硬盘、网络请求操作网卡，所以使用单线程较为方便（cpu 大部分很闲，事情交给不同的线程在处理）。

如果是 CPU 密集型应用，那么使用功能多线程就较为更好；
