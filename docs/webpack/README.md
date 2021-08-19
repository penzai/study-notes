## 介绍
webpack到底还是一个module bundler，它把项目所有使用的所有东西都视为一个模块，然后模块使用loader来解析输出。模块外的自动化工作由插件plugin来进行。

`webpack`核心包的作用只是利用loader读取js/json文件，然后打包到一起。**其它模块文件的识别**以及**打包过程的优化**都是通过其它loader跟plugin来实现的。

## loader
- 调用顺序从后向前。因此例如css-loader必须在style-loader后面才能正常加载。
- loader最终返回的是一段js代码，这些代码就是这个模块（这个文件）的最终返回。

## 插件
webpack的插件基于自己的Tapable库实现，一个插件拥有apply方法，来让webpack注入逻辑，注入方式为设定具体的钩子函数回调。

apply方法类似于vue插件的install方法。

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
- `eval`。只是单纯的指定了模块的名称。控制台报错为实际模块文件。
- `eval-cheap-source-map`。品质为transformed。控制台报错为实际模块文件。
- `eval-cheap-module-source-map`。品质为original lines。控制台报错为实际模块文件。
- `eval-source-map`。品质为original。控制台报错为实际模块文件。

> cheap代表了低开销，意为只使用行映射。

不加eval，整个文件使用一个source-map。source-map是单独的一个文件。但也可以使用inline标签，使之嵌入到一个文件里。例如：inline-source-map。
- `cheap-source-map`。品质为transformed。(报错点进去是找不到具体哪行???)控制台报错为主js文件。
- `cheap-module-source-map`。品质为original lines。(报错点进去是找不到具体哪行???)控制台报错为主js文件。
- `source-map`。品质为original。(报错点进去是找不到具体哪行???)控制台报错为主js文件。

其它的值：
- `nosources-source-map`。它可以用来映射客户端上的堆栈跟踪，而无须暴露所有的源代码，但是仍然会暴露反编译后的文件名和结构，但它不会暴露原始代码。控制台报错为主js文件。
- `hidden-source-map`。打包有source-map，但是没有应用进去，常用于错误上报。控制台报错为打包文件。

## HMR
开启方法。
``` javascript
module.exports = {
  devServer: {
    hot: true,
    // hotOnly: true // 只是用HMR，模块改变回调函数缺省时，不会调用live reloading
  }
}
```
模块热替换，全称Hot Module Replacement。

开启后，当模块改变时，就会自动调用提前设置好的变更回调函数，如果没有，默认执行live reloading，也就是自动刷新当前页面。

变更回调函数入口为：
``` javascript
module.hot.accept('模块路径', () => {
  console.log('模块更新了');
})
```
## Tree Shaking
开启方法。
``` javascript
module.exports = {
  optimization: {
    usedExports: true
  }
}
```

默认情况，webpack构建时，EsModule代码中所有的导出都会被导出（就算你没使用过这个导出）。

开启后，只会导出用到了的导出结果。

> 压缩代码阶段，就会把这些无用代码剔除掉，从而优化代码。

## sideEffects
开启方法（需在tree-shaking的基础上使用）。
``` javascript
module.exports = {
  optimization: {
    usedExports: true,
    sideEffects: true
  }
}
```

经过tree-shaking，有一些无用的代码还是会在打包后出现（尽管可以通过其它工具去掉）。之所以这样是因为打包工具不知道这个模块到底有没有副作用，副作用并不是垃圾代码，有时候也是一个必须执行的代码，例如给对象原型设置新方法。

于是webpack提供了一个手动告知的地方，那就是package.json文件里的sideEffects配置。然后在打包的webpack配置中再开启sideEffects，于是那些**被主动声明没有副作用**又没有被使用的代码，就不会出现再打包集合中。
> 注意这里是两个地方，一个是package.json文件，一个是webpack.config.js文件。因此此类设置用在第三方库中非常常见。


## EsModule与Commonjs Module
webpack中两者都可以互相混用，也就是互相引入导出。

- es引入commonjs，得到的就是module.exports
- commonjs引入es，**得到的是export default的值**

两者中，this的指向不同。
- es，this指向undefined
- commonjs，this指向module.exports

另外要注意的是，module.exports和export default导出的是值，都是在导出的时候就确定了。然后`export const a = 1;`这样，导出的是一个变量，是实时的变量。

> es模块的导入导出，又叫`harmony import/harmony export`。
