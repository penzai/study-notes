## CSS 应用

### 小点子

- 有些虽然是白色背景的还是要设置颜色。（比如`z-index`覆盖的时候没颜色就看得见下面的）
- `main`容器为大外层，`inner`为内容的开始容器
- 元素直接的间隔可以用 `A元素 + 同类A元素`来设置
- 弹性布局时。`flex`元素新启一个类，使用时添加此类，然后设置`flex`属性时使用`X类 .flex { 设置属性 }`
- 无厘头的空格用压缩可以解决

### 自适应

- 小屏的自适应变化，加入动画更流畅
- 使用百分比布局时，当屏幕小到一定程度时，注意更改百分比为高百分比
- `rem` 布局设置 `html` 的 `font-size`
  > 16 / 3.75 = 4.266667

```css
html {
  font-size: 4.266667vw;
}
```

### 一些初始化样式

- `html, body, ul`的`margin，padding`设为`0`

### css 文件

稀土的一个做法，一个文件分为三类，分别是 BASE、COMPONENT、LAYOUT。

### 清除浮动

```css
&::after {
  content: "";
  clear: both;
  display: table;
}
```

### 一系列图片合集

??? 使用`inline-block`后图片并没有在一行，而是加上`white-space: nowrap`才行

```html
<div class="inner photos">
  <img src="" class="photo" />
  <img src="" class="photo" />
  <img src="" class="photo" />
  <img src="" class="photo" />
</div>
```

```css
.photos {
  overflow-x: scroll;
  overflow-y: hidden;

  height: 400px;

  white-space: nowrap;
}
.photos .photo {
  display: inline-block;

  max-width: initial;
  height: inherit;
}
.photos .photo + .photo {
  margin-left: 10px;
}
```

### 画常用图形

#### 三角形

不需要的边框设置透明

```css
border-right: 10px solid aqua;
border-left: 10px solid transparent;
border-top: 10px solid transparent;
border-bottom: 10px solid transparent;
```

#### 移动端上传图片那个加号方框

```css
a {
  position: relative;
  display: inline-block;
  padding: 30px 20px;
  color: #a7a7a7;
  border: 1px solid;
}
a:hover {
  color: #249ff1;
}
a:before,
a:after {
  content: "";
  display: block;
}
a:after {
  border-top: 2px solid;
  width: 20px;
}
a:before {
  position: absolute;
  top: 20px;
  left: 29px;
  border-left: 2px solid;
  height: 20px;
}
```

### 图片部分模糊

主要利用伪元素`::beforeafter`和`::after`，前者进行透明白色背景，后者进行图片背景并模糊。

> 如果你要在模糊背景上放元素，需设置，`position: relative;`。

```css
/* 核心代码1 - 前置透明 */
.blur::before {
  content: "";
  top: 0;
  left: 0;
  position: absolute;
  width: 100%;
  height: 100%;

  z-index: 10;
  opacity: 0.15;
  background-color: #fff;
}
/* 核心代码1 - 后置模糊 */
.blur::after {
  content: "";
  top: 0;
  left: 0;
  position: absolute;
  width: 100%;
  height: 100%;

  filter: blur(5px);

  background-image: url("1.jpg");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}
```

### 好看的一个渐变色

`radial-gradient(ellipse farthest-side at 100% 100%,#dbf6c8 20%,#1cafc6 50%,#012690 110%)`

### 文字处理一行并裁剪

```css
 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### 边框

使用伪类元素

```css
li::after {
  content: " ";
  position: absolute;
  right: 0;
  top: 0;
  width: 1px;
  bottom: 0;
  border-right: 1px solid #cccccc;
  color: #cccccc;
  -webkit-transform-origin: 100% 0;
  transform-origin: 100% 0;
  -webkit-transform: scaleX(0.5);
  transform: scaleX(0.5);
}
li::before {
  content: " ";
  position: absolute;
  width: 100%;
  height: 1px;
  bottom: 0;
  left: 0;
  border-bottom: 1px solid #cccccc;
  color: #cccccc;
  -webkit-transform-origin: 100% 0;
  transform-origin: 100% 0;
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
}
```

### 弹窗

两层结构，一层负责内容（定位用`transform:translate(-50%,-50%)`实现）。一层负责阴影，调整四个方向为 0 来铺满整个屏幕。

### 背景图片的一些处理

- 充满屏幕，居中

```css
div {
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: cover;
}
```

- 伸缩满容器

```css
div {
  background-size: 100% 100%;
}
```

## 疑难杂症

### 两个 span 不居中

如下代码，正常居中。

```html
<div>
  <span>123</span>
  <span>456</span>
</div>
```

当加入 img， 并设置 inline-block 居中时，后面的 456 不居中，此时需要设置 img 为`vertical-align: middle`

```html
<div>
  <span>
    <img style="vertical-align: middle;" />
  </span>
  <span>456</span>
</div>
```

## div 的伸展

div 默认情况由本内容撑开

设置 width:100% 会一直追溯到有宽度的父级

flex: 1 会把所有子元素都撑开

### `margin-top/margin-bottom` bug

子元素 margin-top 有值，父元素没有边框。这是子元素的 margin-top 会转移到父元素上面去。

**规范：**

> the expression collapsing margins means that adjoining margins (no non-empty content, padding or border areas or clearance separate them) of two or more boxes (which may be next to one another or nested) combine to form a single margin.

两个相邻元素如果没有被非空元素，padding，border，浮动清除间隙分开，那么他们就会共用一个 margin。

例如：下面的例子，其实 200px 的 wrap 元素刚刚包含两个 app 元素，但是由于 margin-top 转移了，实际子元素内容超出边界了。

```html
<div class="wrap">
  <div class="app">
    <div class="item">hello kitty</div>
  </div>
  <div class="app">
    <div class="item">hello bady</div>
  </div>
</div>
```

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.wrap {
  width: 700px;
  height: 200px;
  border: 1px solid red;
}
.app {
  width: 300px;
  height: 100px;
  /** border: 1px solid blue; **/
  /* &::before {
    content: "";
    height: 1px;
    display: block;
  } */
  .item {
    width: 200px;
    height: 50px;
    margin-top: 20px;
  }
}
```

### 移动端的字体适配方案

```less
$vm_fontsize: 75;
@function rem($px) {
  @return ($px / $vm_fontsize) * 1rem;
}
$vm_design: 750;
html {
  font-size: ($vm_fontsize / ($vm_design / 2)) * 100vw;
  @media screen and (max-width: 320px) {
    font-size: 64px;
  }
  @media screen and (min-width: 540px) {
    font-size: 108px;
  }
}
// body 也增加最大最小宽度限制，避免默认100%宽度的 block 元素跟随 body 而过大过小
body {
  max-width: 540px;
  min-width: 320px;
}
```

### 移动端 1px

首先明确几个概念。

- 物理像素。屏幕是由一个个的点构成的，那么这一行有多少个点，就是设备的物理像素。
- 逻辑像素，设备独立像素，css 像素，dips。给程序用的像素的最小单位，早期有多少物理像素就给你用多少，现在技术进步，1px 的范围，可能有多个物理像素，这样显示同样的画面，就比单个的来得清晰。
- 设备像素比，dpr。为`物理像素 / 设备独立像素`两值的比值，苹果视网膜屏幕产品 dpr 都大于 2。

1px 产生缘由，iphone6 的物理像素是 750，设计师肯定以这个标准设计，这样效果更好，那么 750 中的 1px 细线条，到了写程序时，就得写 0.5，但是这个兼容性很不好用。由此产生了一系列对策。

> 如果设计稿是 375，那么就不会有 0.5 这种值，就没有 1px 问题。

- 小数点，安卓不支持。
- border-image。圆角颜色等修改不方便。
- 设置 viewport 的 scalable。全局影响太大。
- box-shadow。利用渐变的效果，让 1px 的宽度，感知起来比 1px 小。
- 伪元素 + scale(0.5)。占用伪元素，空元素如 input 不支持伪元素。

## 截断文本

### 单行

```css
.class {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
```

### 多行

#### css 实现

存在 IE 兼容性问题

```css
.class {
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

#### 使用 js 计算

对英文操作不便利

```js
clampWord(el, maxLineNum) {
  const elWidth = +getComputedStyle(el).width.slice(0, -2); // 最大宽度
  const fontWidth = +getComputedStyle(el).fontSize.slice(0, -2); // 单字宽度
  const maxLineFontNum = Math.floor(elWidth / fontWidth); // 一行能容纳的字数
  const maxFontNum = maxLineNum * maxLineFontNum; // 要显示的字的总数
  el.innerHTML = el.innerHTML.slice(0, maxFontNum).concat("...");
}
```

#### float 效果

```css
.word {
  width: 288px;
  border: 1px solid red;
  line-height: 23px;
  max-height: 46px;
  overflow: hidden;
  position: relative;
}
.word::before {
  float: left;
  content: "";
  width: 20px;
  height: 46px;
}
.word .text {
  float: right;
  width: 100%;
  margin-left: -20px;
  word-break: break-all;
}
.word::after {
  content: "...";
  float: right;
  width: 20px;
  height: 20px;
  position: relative;
  left: 100%;
  transform: translate(-100%, -100%);
  background: #fff;
}
```

> float 的摆放次序，例如 right 摆放次序，按书写顺序摆放，如果前方遇见障碍，那么在最低的障碍（可能是前方的障碍物，也可能是后方的，视高度而定）最下方开始排列。

## 垂直居中

- flex 布局 + align-items、justify-content
- flex 布局 + margin: auto
- absolute + top、left 为 50% + `transform: translate(-50%,-50%)`
- absolute + top、left、right、bottom 为 0 + `margin: auto`

不常用：

- table-cell 布局 + vertical-align + 子元素 margin: auto/text-align
- grid 布局 + align-items、justify-content

## 固定 footer

```html
<style>
  * {
    margin: 0;
    padding: 0;
  }
  .content-wrapper {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .box {
    height: 2000px;
  }
  .footer {
    margin-top: auto;
    flex-shrink: 0;
    height: 120px;
    background-color: blueviolet;
  }
</style>
<body>
  <div class="content-wrapper">
    <div class="content">
      <div class="box">hello kitty</div>
    </div>
    <div class="footer">
      <p>footer</p>
    </div>
  </div>
</body>
```

## 当图片加载失败时

```html
<style>
  img.error {
    width: 200px;
    height: 200px;
    display: inline-block;
    transform: scale(1);
  }
  img.error::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: #f5f5f5
      url("data:image/svg+xml,%3Csvg class='icon' viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cpath d='M304.128 456.192c48.64 0 88.064-39.424 88.064-88.064s-39.424-88.064-88.064-88.064-88.064 39.424-88.064 88.064 39.424 88.064 88.064 88.064zm0-116.224c15.36 0 28.16 12.288 28.16 28.16s-12.288 28.16-28.16 28.16-28.16-12.288-28.16-28.16 12.288-28.16 28.16-28.16z' fill='%23e6e6e6'/%3E%3Cpath d='M887.296 159.744H136.704C96.768 159.744 64 192 64 232.448v559.104c0 39.936 32.256 72.704 72.704 72.704h198.144L500.224 688.64l-36.352-222.72 162.304-130.56-61.44 143.872 92.672 214.016-105.472 171.008h335.36C927.232 864.256 960 832 960 791.552V232.448c0-39.936-32.256-72.704-72.704-72.704zm-138.752 71.68v.512H857.6c16.384 0 30.208 13.312 30.208 30.208v399.872L673.28 408.064l75.264-176.64zM304.64 792.064H165.888c-16.384 0-30.208-13.312-30.208-30.208v-9.728l138.752-164.352 104.96 124.416-74.752 79.872zm81.92-355.84l37.376 228.864-.512.512-142.848-169.984c-3.072-3.584-9.216-3.584-12.288 0L135.68 652.8V262.144c0-16.384 13.312-30.208 30.208-30.208h474.624L386.56 436.224zm501.248 325.632c0 16.896-13.312 30.208-29.696 30.208H680.96l57.344-93.184-87.552-202.24 7.168-7.68 229.888 272.896z' fill='%23e6e6e6'/%3E%3C/svg%3E")
      no-repeat center / 50% 50%;
  }
  img.error::after {
    content: attr(alt);
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    line-height: 2;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    font-size: 12px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
<img src="zxx.png" alt="CSS新世界封面" onerror="this.classList.add('error');" />
```

## flex 布局 9 宫格

缺少一块，又想维持原来的布局

- 手动添加元素凑满
- 使用伪元素::after 并设置 flex：1 来填满剩下的

## 寻找一张图片最近颜色

```js
var imgSrc = "./pic2.jpg";
const imgEle = document.createElement("img");
const canvas = document.createElement("canvas");
imgEle.src = imgSrc;
imgEle.onload = () => {
  var ctx = canvas.getContext("2d");
  var naturalImgSize = [imgEle.naturalWidth, imgEle.naturalHeight];
  canvas.width = naturalImgSize[0];
  canvas.height = naturalImgSize[1];

  //绘制到canvas
  ctx.drawImage(imgEle, 0, 0);
  //获取imageData：rgba像素点
  var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const leftSectionData = [];
  const rightSectionData = [];
  const oneLineImgDataLen = canvas.width * 4;

  console.log(oneLineImgDataLen);
  imgData.data.forEach((colorVal, i) => {
    if (
      i % oneLineImgDataLen <= 0.5 * oneLineImgDataLen ||
      i % oneLineImgDataLen >= 0.6 * oneLineImgDataLen
    ) {
      const inLeft = i % oneLineImgDataLen <= 0.5 * oneLineImgDataLen;
      if (i % 4 === 0) {
        // 获取rgb均值
        const curAverageRGB =
          (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
        let leftOrRightRef = inLeft ? leftSectionData : rightSectionData;
        //每个数组里存四个值：本颜色值中的r、g、b的均值，以及r、g、b三个值。
        //均值一方面用于累加计算本区域的整体均值，然后再跟每个均值对比拿到与整体均值最接近的项的索引，再取该数组里的后三个值：rgb，对应着颜色
        leftOrRightRef[leftOrRightRef.length] = [
          curAverageRGB,
          imgData.data[i],
          imgData.data[i + 1],
          imgData.data[i + 2],
        ];
      }
    } else {
      console.log(
        i,
        i % oneLineImgDataLen,
        0.5 * oneLineImgDataLen,
        0.6 * oneLineImgDataLen
      );
    }
  });
  //generate average rgb
  const averageOfLeft = Math.round(
    leftSectionData.reduce((_cur, item) => {
      return _cur + item[0];
    }, 0) / leftSectionData.length
  );
  const averageOfRight = Math.round(
    rightSectionData.reduce((_cur, item) => {
      return _cur + item[0];
    }, 0) / rightSectionData.length
  );
  //find the most near color
  const findNearestIndex = (averageVal, arrBox) => {
    let _gapValue = Math.abs(averageVal - arrBox[0]);
    let _nearColorIndex = 0;
    arrBox.forEach((item, index) => {
      const curGapValue = Math.abs(item - averageVal);
      if (curGapValue < _gapValue) {
        _gapValue = curGapValue;
        _nearColorIndex = index;
      }
    });
    return _nearColorIndex;
  };

  const leftNearestColor =
    leftSectionData[findNearestIndex(averageOfLeft, leftSectionData)];
  const rightNearestColor =
    rightSectionData[findNearestIndex(averageOfRight, rightSectionData)];
  console.log(leftNearestColor, rightNearestColor);
};
```

### BEM命名法
使用此命名法书写样式时，独立的容器尽量写在根路径下，方便使用&进行选中。
``` html
<div class="container">
  <div class="user-list">
    <div class="user-list__name" />
  </div>
</div>
```

``` css

/* bad */
.container {
  .user-list {
    &__name {

    }
  }
}

/* good */
.container {}
.user-list {
  &__name {}
}
```
