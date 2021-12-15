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