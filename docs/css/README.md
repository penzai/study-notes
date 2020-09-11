# CSS 基础

## 大纲

- css 选择器
- 盒模型
- 布局：浮动、position、display
- 响应式设计
- transform/transition/animation

## 排版与布局

### 盒模型

浏览器渲染布局时，把每个元素都当做一个盒子来处理，所以盒是 css 渲染布局的对象和基本单位，一个页面就是由若干个盒组成。

盒分为块级盒和行内级盒

### 格式化上下文

在 CSS 标准中，规定了如何排布每一个文字或者盒的算法，这个算法依赖一个排版的“当前状态”，CSS 把这个当前状态称为“格式化上下文（formatting context）”。

格式化上下文有 BFC/IFC。

> 文字 / 盒 + 格式化上下文 = 位置

#### BFC

排版规则：

- 当遇到块级盒：排入块级格式化上下文。
- 当遇到行内级盒或者文字：首先尝试排入行内级格式化上下文，如果排不下，那么创建一个行盒，先将行盒排版（行盒是块级，所以到第一种情况），行盒会创建一个行内级格式化上下文。
- 遇到 float 盒：把盒的顶部跟**当前行内级**上下文上边缘对齐，然后根据 float 的方向把盒的对应边缘对到块级格式化上下文的边缘，之后重排当前行盒。

一些元素会创建新的块级格式化上下文：

- 块级能包含块级的元素，overflow 为非 visible 属性
- 浮动元素
- 绝对定位元素

#### IFC

空格与 inline 盒会混排导致布局混乱，解决办法有：

- 设置父容器`font-size: 0`

```html
<style>
  .item {
    width: 33.3%;
    height: 300px;
    display: inline-block;
    outline: solid 1px blue;
  }
</style>
<body>
  <div>
    <div class="item">1</div>
    <div class="item">2</div>
    <div class="item">3</div>
  </div>
</body>
```

### position

公共特点：

1. top 属性有效的定位情况，默认值均为 auto（即定位在原文档流原来的位置）。
2. 脱离文档流后（其实就是 ☞absolute/fixed），同时设置 top/bottom 且高度为 auto，该元素会拉伸垂直空间。left/right 同理。（因此得出一种对已知宽高元素的水平垂直居中方法，top/left/bottom/right 设为 0，margin 设为 auto）。
3. 参照的边界从 border 结束开始（不包括 border 本身）。

可设为如下值：

- static，默认，按照文档流排列，top 等属性无效
  - z-index 无效
- relative，按照文档流排列，top 等属性有效，参照物是元素本身
  - 对表格元素无效
- absolute，脱离文档流，top 等属性有效，参照物为最近的**非 static 祖先元素**
  - 元素变为可设置宽高，且 auto 属性表现为自动按其内容大小调整尺寸
- fixed，脱离文档流，top 等属性有效，参照物为当前 client
  - 创建新的层叠上下文（所以 dialog 的阴影层显示时，要禁用下面层的滚动操作）
  - 当祖先元素的 transform, perspective 或 filter 属性非 none 时，容器由视口改为该祖先。
- sticky（兼容性差），按照文档流排列，top 等属性有效，参照物为最近的滚动祖先元素（overflow 设为 hidden/scroll/auto）
  - 创建一个新的层叠上下文
  - 表现形式为，当祖先元素出现在视口时，一直保持着 top 等属性值的距离，所以当滚动正在穿越祖先元素时，被设为 sticky 的子元素会依然一直保持着值，类似于粘在屏幕上，但是一旦祖先元素也滚出屏幕外，那么子元素也会依然跟着滚走

#### float

float 元素非常特别，浏览器对 float 的处理是先排入正常流，再移动到排版宽度的最左 / 最右

## 尺寸与距离

CSSOM 是在 DOM 上进行了扩展

- `document.styleSheets`返回 style 和 link 标签的样式集合[`CSSStyleSheet`, ...]，从而可以操作 CSSStyleSheet 进行一些样式的删除和添加。
- `window.getComputedStyle(elt, pseudoElt)`返回该元素计算后的所有 css 属性

### 滚动

视口的滚动（即 html 元素 document.documentElement）与元素的滚动不能视作同一个东西，两者的性能和行为都有区别。比如动端浏览器都会对视口滚动采用一些性能优化。

都有的 API:

- `scroll(x, y)`别名 scrollTo，滚动到指定地方
- `scrollBy(x, y)`相对滚动

#### 视口

挂载在 window 上的一系列属性

- `scrollX/scrollY`当前滚动距离

#### 元素

挂载在 dom 对象上

- `scrollLeft/scrollTop`当前滚动距离
- `scrollWidth/scrollHeight`滚动区域的宽高
- `scrollIntoView(args)`滚动到视口

### 元素位置

一个元素并没有宽高，只有它最外层的盒子才有宽高。

两个获取元素坐标、宽高、偏移的方法：

- `getBoundingClientRect`把该元素当做盒子处理
- `getClientRects`返回 DOMRect 集合，行内元素时会把自身划分为多个块级元素（例如文字换行的情况）

属性：

- `clientWidth/clientHeight`：`padding` + `content`
- `clientTop/clientLeft`：`border`
- `offsetWidth/offsetHeight`：`padding` + `content` + `border`
- `offsetTop/offsetLeft`: 元素左上角距离最近定位元素的距离，注意与 getBoundingClientRect 方法返回结果中 y 属性的区别

### 全局信息
- `window.innerWidth/innerHeight`
- `window.screen.width/height`
- `window.devicePixelRatio`

## text-align 和 vertical-align

### text-align

作用于块级元素，影响里面的行内元素排列。

justify 值只影响文字。

### vertical-align

作用于行内元素，影响自身相对于其他行内元素排列。

#### 基线 baseline

位置：汉字、阿拉伯数字的最末端，英文字母四条基线的第**三**条基线

#### text-bottom

英文字母四条基线的第**四**条基线

## 拖动

- 设置属性 darggable 为 true 来开启拖动功能
- 拖放块的 drop 和 dragover 事件需阻止默认行为

各事件的调用如下。

```html
<div
  id="dragDIV"
  style="width: 200px;height:200px;background-color:aqua;"
  draggable="true"
></div>
<div
  id="dropDIV"
  style="width: 600px;height:300px;background-color:rgb(221, 215, 215);"
></div>

<script>
  const dropDIV_DOM = document.querySelector("#dropDIV");
  const dragDIV_DOM = document.querySelector("#dragDIV");

  // 拖动快
  dragDIV_DOM.ondragstart = (e) => {
    console.log("dragstart...");
  };
  dragDIV_DOM.ondrag = (e) => {
    console.log("draging...");
  };
  dragDIV_DOM.ondragend = (e) => {
    console.log("dragend...");
  };

  // 放置区域
  dropDIV_DOM.ondragenter = (e) => {
    console.log("enter dropDIV..");
    e.currentTarget.innerHTML = "拖放在这里";
  };
  dropDIV_DOM.ondragover = (e) => {
    console.log("over dropDIV..");
    e.preventDefault();
  };
  dropDIV_DOM.ondragleave = (e) => {
    console.log("leave dropDIV..");
    e.currentTarget.innerHTML = "";
  };
  dropDIV_DOM.ondrop = (e) => {
    console.log("drop..");
    e.currentTarget.innerHTML = "成功拖放";
    e.preventDefault();
  };
</script>
```

### `e.dataTransfer`属性

## 层级

控制定位元素的层叠顺序。也就是说position:static无效。

默认后定义的元素比先定义的层级高，相对定位比默认定位的元素层级高。

当与`float: left`的元素重叠时，`absolute`的元素在上层

## `css选择器`

### 类型选择器，全体选择器

### id，class 选择器

### 关系选择符

- `E + F`相邻选择符
- `E ~ F`兄弟选择符
  > 区别在与，兄弟选择符只认兄弟，并不管你在不在我旁边

### 属性选择器

**css2**

- `E[att]`E 元素有 att 这个属性即可
- `E[att = "bar"]`
- `E[att ~= "bar"]`把 E 的 att 属性用空格分隔，查看是否包含 bar
- `E[att |= "en"]`
  - att 属性只有一个且为`en`，`att="en"`
  - att 属性以`en-`开头(不限定 E 的 att 属性个数)
    > 个数以空格分隔计算。

**css3**

可以看出 css2 的属性选择器并不太好用，而且复杂，所以 css3 的很简明容易理解：

- `E[att *= "bar"]`
- `E[att ^= "bar"]`
- `E[att $= "bar"]`

### 伪类选择器

#### 非贪婪类

即你给的元素 E 和条件不搭配，就不匹配。

- E:first-child
- E:last-child
- E:only-child
- E:nth-child(n)
- E:nth-last-child(n)

> n 从 1 开始

#### 贪婪类

总是想办法找到符合条件的那个元素 E。

- E:first-of-type
- E:last-of-type
- E:only-of-type
- E:nth-of-type(n)
- E:nth-last-of-type(n)

> 注意 E 为 class 时的情况，与标签的区别为，p:nth-of-type(2)会选择第 2 个 p 标签，.cla:nth-of-type(2)并不会选择第二个类为 cla 的元素。

#### （more）伪元素

伪元素不单单是一种规则，也是一种机制

- `::first-line`
- `::first-letter`
- `::before`
- `::after`

## 权重

伪元素与伪类的区别在于，前者需要 create 一个“幽灵”元素,比如一个 p 段落中的第一行。

- 通配符：0
- 伪元素：1
- 元素选择器：1
- class 选择器：10
- 伪类：10
- 属性选择器：10
- id 选择器：100
- 行内样式：1000

> 同权重的时候，按书写样式的先后顺序，而不是 class 的使用顺序。

## `box-shadow`

- 各参数代表：`x`轴距离 / `y`轴距 / `blur`值（即模糊的程度）/ `spread`值（模糊块伸展的程度）
- 加上`inset`即设置元素内的阴影

```
div {
 box-shadow: 0 5px 10px rgba(0, 0, 0, .1);
}
```

## background

常用简写形式：

```css
background: url(图片地址) position属性/size属性 重复属性;
```

### background-position

- 百分比（相对于容器的宽高）
- 具体 px
- 关键字：left、right、top、bottom、center

### background-size

- 百分比（相对于容器的宽高）
- 具体 px
- 关键字：auto、contain(最大限度看见全貌)、cover(同比例充满容器)

### background-repeat

可以分别指定是在 x 轴重复还是 y 轴重复

## `className`的相关操作

利用`element.classList`的相关`api`，如果没有就用`element.className.split(/\s+/)`分割成数组再进行操作。

- `add/remove(String[, String])` 增加/移除相应的元素，可多个
- `item(Number)`
- `toggle(String[, force])` 切换相应的`class`，第二个参数决定强制增加还是删除
- `contains(String)` 是否包含

## 负边距

负边距偏移，类似于相对定位的偏移，区别是前者会丢失流空间，被后来的元素乘虚而入，而后者会保留原来的流空间。

> 在正常文档流中使用负边距，位置以及后面的元素会跟着一直走；而在浮动流
> 中，后来的元素只是为了填充移动了的元素，当元素通过负边距移除了原来的所在地，后面的元素是不会跟着它一起走的，而在正常文档流中会。

### 应用

1. 对`width: auto`元素，临时增加宽度。
2. 使用`padding-bottom`和`margin-bottom`很大数值相互抵消来实现多列等高布局，但是缺点很多。
3. 圣杯双飞翼布局。middle/left/right 设置`float: left`，然后使用负边距让 3 个元素集中在同一行，最后增加容器 padding 并使用相对定位再次调整位置。
4. 垂直居中已知宽高的元素。

## flex

### container

- `flex-flow`
  - `flex-direction`（默认 row。）
  - `flex-wrap` (默认 nowrap。)
- `justify-content`（默认 flex-start。主轴上的对齐方式。）
- `align-content`（默认 stretch。多条主轴的对齐方式（发生 wrap 的时候）。高度尽可能撑大，当容器只有一行时，无效。 ）
- `align-items`（默认 stretch。交叉轴上的堆砌方式。高度尽可能撑大。 ）

### item

float、clear、vertical-align 不能影响 item

- `order`（默认 0）
- `flex` [flex-grow, flex-shrink, flex-basis]（默认 `0 1 auto`, 缺省值分别是 **1，1，0%**）。flex 常用值有`none`(0 0 auto)，auto（1 1 auto），1（1 1 0%，最常用，也就是缺省值）
  > 为什么用`flex：1`，而不是`flex-grow:1`,因为 flex-basis 默认值 auto，所以你想平均分配空间（而不是剩余空间）的时候必须把其置为 0，也就是`flex：1`的完整设置项。
- `align-self` (单独的 align-items 设置)

## float

存在是为了使文字良好的环绕图片。

> 即当浮动元素遮住非浮动元素时，非浮动元素的文字会从**不遮盖**的地方开始，但是布局还是以原始地方开始计算。

当用于排版布局时，子元素浮动后会影响父元素高度，为了使父元素依然完美包裹浮动子元素，需要在最后一个浮动元素处清除浮动`clear: both`。

### 清除浮动

- 触发 BFC，例如给容器添加`overflow: hidden`
- 容器末尾增加一个元素
  ```css
  .clearfix {
    content: "";
    display: table;
    clear: both;
  }
  .clearfix {
    content: ".";
    display: block;
    visibility: hidden;
    height: 0;
  }
  ```

## 响应式设计

### 像素
- 物理像素(physical pixel)。又称设备像素、分辨率。电子产品实际发亮部件的个数。
- 设备独立像素(device independent pixels)。又称逻辑像素，CSS像素。给程序使用的最小单位。
- DPR。物理像素/CSS像素，以前的普通的设备都是1，但是苹果的视网膜屏幕为了让屏幕更清晰，使用了2或者3。
## 文本

### white-space

决定 html 中空格的处理方式。

- normal，CJK 和 Non-CJK 单词之间自动换行，空格合并为 1 个，换行符会被当作空白符来处理。
- nowrap，在normal的基础上不换行。
- pre-line，在normal的基础上保留换行符的效果。
- pre，保留代码书写时的所有特征。
- pre-wrap，在pre的基础上自动换行。

> pre是指按照pre标签的形式来处理。另外注意换行的具体表现，当A字符的下一个字符B如果能在当前行有限的区域内排下，才会AB同行，否则B就另起一行，不管装不装得下。

### word-break

决定单词**内部**断行方式。

- normal，默认，CJK 自动换行，Non-CJK 单词内部不断行（但是单词之间会换行）。

由上可知，两类字符的断行方式默认不一样，那么下面两种就是为了设置成统一的。

- break-all，都断行
- keep-all，都不断行（标点符号处，依然会进行断行）

> 细想上面的属性，其实处理都不太好，假如我们只想让比宽度还宽的那个单词换行，我们可以使用 break-word 属性，但是兼容性不太好。不过可以通过设置`word-wrap: break-word;`来实现，css3 里提议为 overflow-wrap 名称。

## 动画

### js 动画

利用 api 的 animate 方法或者设置样式开关。

使用`requestAnimationFrame`方法使动画在重绘之前执行动画，使其更流畅。回调函数执行次数通常是每秒 60 次（与屏幕刷新率匹配）。

特点：

- 可能被其它线程干扰，造成帧丢失
- 控制能力很强，开始、暂停、回放、终止、取消都是可以做到的
- 动画效果比 css 更丰富，可设置复杂的动画

### css 动画

利用 transition/animation

特点：

- 浏览器自动优化
- 使用硬件加速
