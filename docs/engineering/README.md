## npm
- package.json中`bin`参数可以设置`node_modules/.bin`目录的shell名称以及对应要使用哪个脚本。
## 自动注入样式变量、mixins

使用`style-resources-loader`包，配置 webpack 如下：

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          "style-loader",
          "css-loader",
          "less-loader",
          {
            loader: "style-resources-loader",
            options: {
              patterns: path.resolve(
                __dirname,
                "path/to/less/variables/*.less"
              ),
              injector: "append",
            },
          },
        ],
      },
    ],
  },
};
```

## 关于`vue-cli`
### 通过mode设置不同版本差异

根目录建立`.env.模式名称1`文件。

即可在命令`vue-cli-service serve -mode 模式名称1`启用相应的配置文件。

这里的mode要注意与webpack的NODE_ENV区分，NODE_ENV是打包必须的一个变量，而`vue-cli-service`的mode只是决定使用哪个变量文件。

如果自定义的变量文件不指定NODE_ENV，那么`vue-cli-service serve`的NODE_ENV默认development，build命令默认production。

### 图片等资源引入
- template
  - 相对路径，经过webpack处理
  - 绝对路径，不处理，路径原封不动
- javascript
  - 相对路径，经过webpack处理
  - 绝对路径，经过webpack处理
- style
  - 相对路径，经过loader处理
  - 绝对路径，经常loader处理，~符号由webpack处理
- css属性
  - 相对路径，经过webpack处理
  - 绝对路径，不处理，路径原封不动

## 异常监控
### 代码监控
通过上传堆栈信息然后根据map文件定位具体代码位置。

#### 捕获报错信息
- window.onerror
- vue中使用全局配置`Vue.config.errorHandler`

#### 堆栈信息优化
- 构建map文件在另一台机器上
- 优化文本量大
  - 重复内容采用简洁标识替代，比如URL
- 优化重复堆栈，每个堆栈计算一个ID
> 将堆栈按一个稳定的算法提取其中若干行，拼接起来作为指纹，然后使用 MD5 算出一个固定位数的 hash 作为 ID。

#### 探测堆栈是否上报过
（不是很理解，来源互联网）

有了 ID 之后，我们还要探测这个 ID 的堆栈是否上报过，最简单的方式其实是请求服务端接口查询一下，但对于大部分服务端接口都难以承载堆栈探测这种量级的请求。所以我们采用了一个比较机智的方法来完成堆栈上报的探测。

当服务端接收到某个堆栈后，会往 CDN 发一个带有堆栈 ID 的空文件。而采集脚本发生异常，获取到 ID 时会用ID 去访问 CDN 资源，如果请求成功，说明堆栈上报过，就不再上报；如果是 404，则说明是全新的堆栈，需要进行上报。CDN 本身设计上就是能够承载大量访问的，因此就解决了探测的问题。

#### 映射代码
使用npm包`source-map`

### 数据监控
上报一些自定义数据，可以进行维度分析，进而找到问题的集中发生点。

### 用户操作监控
与埋点系统结合，找到异常出现的用户前几步操作，以此重现问题

### 变更
通过异常出现时间的代码整体变动来进行分析，常见的就是代码的某个发版

### 自动接入
研发平台将监控的项目 ID 注入到构建容器中，然后构建工具去获取参数，并将脚本和参数注入到前端构建产物中。