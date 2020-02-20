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
    <div class="item">
      hello bady
    </div>
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

简单版

```css
.item {
  position: relative;
  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1px;
    background-color: red;
    transform: scaleY(0.5);
  }
}
```

精细版

```css
.min-device-pixel-ratio(@scale2, @scale3) {
  @media screen and (min-device-pixel-ratio: 2),
    (-webkit-min-device-pixel-ratio: 2) {
    transform: @scale2;
  }
  @media screen and (min-device-pixel-ratio: 3),
    (-webkit-min-device-pixel-ratio: 3) {
    transform: @scale3;
  }
}

.border-1px(@color: #DDD, @radius: 2px, @style: solid) {
  &::before {
    content: "";
    pointer-events: none;
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    transform-origin: 0 0;
    border: 1px @style @color;
    border-radius: @radius;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    @media screen and (min-device-pixel-ratio: 2),
      (-webkit-min-device-pixel-ratio: 2) {
      width: 200%;
      height: 200%;
      border-radius: @radius * 2;
      transform: scale(0.5);
    }
    @media screen and (min-device-pixel-ratio: 3),
      (-webkit-min-device-pixel-ratio: 3) {
      width: 300%;
      height: 300%;
      border-radius: @radius * 3;
      transform: scale(0.33);
    }
  }
}

.border-top-1px(@color: #DDD, @style: solid) {
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    border-top: 1px @style @color;
    transform-origin: 0 0;
    .min-device-pixel-ratio(scaleY(0.5), scaleY(0.33));
  }
}
```

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
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
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

- flex 布局
- top50%结合 translateX/Y
- 绝对定位通过 top50%与 margin 调整具体长度数值
- 绝对定位通过设置 top/left/right/bottom 为 0 加上 margin 为 auto
