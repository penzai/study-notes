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
