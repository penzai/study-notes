## response
``` ts
interface Response {
  config: object,
  data: object,
  headers: object,
  request: XMLHttpRequest,
  status: number,
  statusText: string
}
```

当需要请求blob数据时，设置responseType为blob后，返回的data字段即自动变更为Blob对象。

## 错误处理
- 请求本身的错误，例如网络错误，超时等，可以在interceptors里的**错误处理钩子函数**处理
- http code的相应错误，可以在interceptors的**正常处理钩子函数**处理。

## 拦截器（interceptor）
拦截器保存了所有调用use时传入的回调，request加response拦截器以及实际请求共同组成洋葱模型的队列内容。

``` js
const chain = [
  firstRequestFulfilled,
  firstRequestRejected,
  secondRequestFulfilled,
  secondRequestRejected,
  // ... others
  dispatchRequest,//实际的请求，在浏览器是用promise封装的xhr
  undefined,
  firstResponseFulfilled,
  firstResponseRejectd
  // ... others
]
```

此队列会使用promise的链式调用来消费掉。

## 取消请求
原生xhr。
``` js
xhr.abort() 
```

fetch使用`AbortController`。
``` js
const controller = new AbortController()
const { signal } = controller 

fetch(
  'http://localhost:8080',
  { signal }
)

// cancel
controller.abort()
```

axios使用`CancelToken`
``` js
const CancelToken = axios.CancelToken
const source = CancelToken.source()

axios.get(
  'http://localhost:8080', 
  {
    cancelToken: source.token
  }
)

source.cancel('i want cancel request')
```