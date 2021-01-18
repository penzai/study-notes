## 介绍
webpack到底还是一个module bundler，它把项目所有使用的所有东西都视为一个模块，然后模块使用loader来解析输出。模块外的自动化工作由插件plugin来进行。

## loader
- 调用顺序从后向前。因此例如css-loader必须在style-loader后面才能正常加载。
- loader最终返回的是一段js代码，这些代码就是这个模块（这个文件）的最终返回。因此主js的打包后代码，都是执行逻辑。其它模块的打包后代码，都是导出一个值。

## 插件
在webpack打包过程中，注入已设定好的钩子函数回调即可。

例如，一个去掉打包后js中`/**/`代码的plugin。

``` javascript
class RemoveCommentsPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('RemoveCommentsPlugin', compilation => {
      for (const name in compilation.assets) {
        if(name.endsWith('.js')) {
          const contents = compilation.assets[name].source()
          const noComments = contents.replace(/\/\*{2,}\/\s?/g, '')
          compilation.assets[name] = {
            source: () => noComments,
            size: () => noComments.length
          }
        }
      }
    })
  }
}

module.exports = RemoveCommentsPlugin
```

## devtool
当一个文件被打包处理后，调试困难，而devtool决定开发者工具的调试情况。

> eval是js内置的一个在虚拟环境（内存）执行JavaScript代码的函数。且末尾可以使用`//# sourceURL=xxxx.js`来指定内存的引用名字。webpack通过这个名字，就可以让开发者知道此时代码是来自于哪个模块。

打包后代码的几种调试格式。
- bundled。一个整文件，最原始的，毫无调试性可言。
- generated。使用了eval注入模块名称，因此各个模块分门别类，但是里面的代码是webpack转译后的，调试性很差。
- transformed。代码是webpack转译之前，babel转译后。也就是说是es5代码。切不能指定具体列。
- original lines。原始代码。但是每行一个映射。
- original。原始代码。能指定具体某列。。原始代码。能指定具体某列。


### devtool的可配置值
eval代表了用eval函数来执行整个模块代码。并且source-map是每个模块一个，且使用dataURL方式嵌入进文件。
- `eval`。只是单纯的指定了模块的名称。
- `eval-cheap-source-map`。品质为transformed。
- `eval-cheap-module-source-map`。品质为original lines。
- `eval-source-map`。品质为original。

> cheap代表了低开销，意为只使用行映射。

不加eval，整个文件使用一个source-map。source-map是单独的一个文件。但也可以使用inline标签，使之嵌入到一个文件里。例如：inline-source-map。
- `cheap-source-map`。品质为transformed。(报错点进去是找不到具体哪行???)
- `cheap-module-source-map`。品质为original lines。(报错点进去是找不到具体哪行???)
- `source-map`。品质为original。(报错点进去是找不到具体哪行???)

其它的值：
- `nosources-source-map`。它可以用来映射客户端上的堆栈跟踪，而无须暴露所有的源代码，但是仍然会暴露反编译后的文件名和结构，但它不会暴露原始代码。
- `hidden-source-map`。打包有source-map，但是没有应用进去，常用于错误上报。
