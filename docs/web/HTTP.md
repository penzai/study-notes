## HTTP/0.9
当时只是为了交换ASCLL字符的文档而设计。
- 只有一句话
- 一个请求方法（GET）
- 用完就关闭
```
GET /index.html
```
> 这里没带上HTTP/0.9的标识，导致了以后为了向后兼容，http默认为0.9。

## HTTP1/.0
- 增加了请求首部与请求正文的规范，因此增加POST方法
- HEAD
- 增加一些响应码

## HTTP/1.1
- 强制添加host首部。`Host: www.example.com`，为了拥抱虚拟主机技术。
- 强制默认开启keep-alive。`Connection: Keep-Alive`。通过content-length字段来判断响应是否发送完。
- 更好的缓存方法，例如：`cache-control`（比如1.0的`Expires`好使）。
- cookie

## HTTPS
使用TLS（Transport Layer Security传输层加密）进行加密传输，TLS前身为SSL（Secure Sockets Layer安全套接字层）。

先使用公钥加密，生成双方都使用的共享密钥，后续交流都用共享密钥来解密（对称加密）。

## HTTP/1.1弊端
- 频繁的等待，此刻什么也不能做，等待上一个请求完才能发送下一个请求。下下策处理方式：开启多个http连接，开启多个域名的请求n * 6。或者减少请求数，比如js图片文件合并。
- HTTP基于文本的格式，网站越复杂，首部占用的数据传输空间越大。

## HTTP/2
- 多路复用
- 基于二进制传输
- 压缩首部