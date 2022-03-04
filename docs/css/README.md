# CSS 基础

## 标准

现存标准为 CSS2.1 与 CSS3，不会再有 CSS4，因为现在 css 的标准是按模块进行划分，分别对模块进行 Level1，Level2 以此类推的标准升级。

## 大纲

- css 选择器
- 盒模型
- 布局：浮动、position、display
- 响应式设计
- transform/transition/animation

## 排版与布局

### 盒模型

浏览器渲染布局时，把每个元素都当做一个盒子来处理，所以盒是 css 渲染布局的对象和基本单位，一个页面就是由若干个盒组成。

盒模型的解析方式分为标准盒模型和 IE 盒模型，通过`box-sizing`属性控制。

> 虽然默认是标准盒模型 content-box，但是 IE 盒模型 border-box 更符合常理。

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

## `position`

公共特点：

1. top 属性有效的定位情况，默认值均为 auto（即定位在原文档流原来的位置）。
2. 脱离文档流后（其实就是 ☞absolute/fixed），同时设置 top/bottom 且高度为 auto，该元素会拉伸垂直空间。left/right 同理。（因此得出一种对已知宽高元素的水平垂直居中方法，top/left/bottom/right 设为 0，margin 设为 auto）。
3. 参照的边界从 border 结束开始（不包括 border 本身）。

可设为如下值：

### static

默认，按照文档流排列，top 等属性无效

- z-index 无效

### relative

按照文档流排列，top 等属性有效，参照物是元素本身

- 对表格元素无效

### absolute

脱离文档流，top 等属性有效，参照物为最近的**非 static 祖先元素**

- 元素变为可设置宽高，且 auto 属性表现为自动按其内容大小调整尺寸

### fixed

脱离文档流，top 等属性有效，参照物为当前 client

- 创建新的层叠上下文（所以 dialog 的阴影层显示时，要禁用下面层的滚动操作）
- 当祖先元素的 transform, perspective 或 filter 属性非 none 时，容器由视口改为该祖先。

### sticky

黏性布局，按照文档流排列，top 等属性有效，参照物为最近的滚动祖先元素（overflow 设为 hidden/scroll/auto）

- top 等属性可以设置，但是只在参照物盒子范围内移动，不会超过该盒子范围
- 流盒（参照物盒子）与黏性定位元素块的父元素会产生一个“黏性约束局矩形”的范围，黏性定位元素块只会在这个范围进行黏性（如果可以黏的话，因为如果本身与父元素同高度，那就没有黏的空间）。一旦视窗滚动超过了父元素，那么就会随着父元素的消失而消失。
- 黏性定位元素在同一个容器下会重叠，而在不同容器下则会依次推开

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

> 判断一个元素是否滚动到底。`el.scrollHeight - el.scrollTop === el.clientHeight`。

### 元素位置

一个元素并没有宽高，只有它最外层的盒子才有宽高。

两个获取元素坐标、宽高、偏移的方法：

- `getBoundingClientRect`把该元素当做盒子处理
- `getClientRects`返回 DOMRect 集合，行内元素时会把自身划分为多个块级元素（例如文字换行的情况）

属性：

- `clientWidth/clientHeight`：`padding` + `content`，可以理解为扒了一层皮（border）后剩下的宽高。
- `clientTop/clientLeft`：`border`。
- `offsetWidth/offsetHeight`：`border` + `padding` + `content`，顾名思义上的 width，一个盒子的宽高
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

控制定位元素的层叠顺序。也就是说 position:static 无效。

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

> 同权重的时候，按书写样式的先后顺序，而不是 class 的使用顺序。想想 CSSOM tree 的解析。

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
background: 背景色 url(图片地址) position属性/size属性 重复属性;
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
  > flex-shrink 的默认值 1，也就表示 item 在允许的情况是会自动缩小的，就算你的初始宽度（width/flex-basis）设得很大，一样该缩小的时候就缩小。
- `align-self` (单独的 align-items 设置)

### 应用

实现 space-between 类排版：

- 对于固定宽和个数的
  - 模拟间隙
  - 使用伪类选择不够情况的最后一个元素，然后设置不同的 margin-right
- 对于宽度不固定（那么间隙也就不严格相等），只需要使最后一行左对齐
  - 最后一项设置`margin-right: auto`
  - 最后一项设置`flex: 1`
- 对于宽度固定，个数不固定（也就是能排多少就多少）
  - 添加最大排版个数的模拟标签，设置相似的盒子，唯一不同的是取消高度显示
- 其他
  - grid 布局

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
    clear: both;
  }
  ```

## 响应式设计

### 像素

- 物理像素(physical pixel)。又称设备像素、分辨率。电子产品实际发亮部件的个数。
- 设备独立像素(device independent pixels)。又称逻辑像素，CSS 像素。给程序使用的最小单位。
- DPR。物理像素/CSS 像素，以前的普通的设备都是 1，但是苹果的视网膜屏幕为了让屏幕更清晰，使用了 2 或者 3。

## 文字排版

### 自动换行

排版遇见 CJK 单字，以及 Non-CJK 的空格和连字符`-`号时，会自动换行。换行的具体表现，当 A 字符的下一个字符 B 如果能在当前行有限的区域内排下，才会 AB 同行，否则 B 就另起一行，不管装不装得下。

对于固定字符，英文可使用软连接字符，中文可使用`<wbr>`标签，来让其更好的适应自动换行。

> 连接字符`-`分为两种，硬连接字符即键盘上的`-`，另一种是软连接字符`&shy;`（unicode 为 00AD），只在换行的时候才出现`-`符号。

### 空格合并

空格合并的行为会删除行的首尾空格。

### white-space

决定 html 中空格的处理方式。

- normal，空格合并，无视换行符，自动换行。
- nowrap，空格合并，无视换行符，不换行。
- pre，保留代码书写时的所有特征。
- pre-wrap，在 pre 的基础上自动换行。
- pre-line（推荐），空格合并，换行符有效，自动换行。
- break-spaces（推荐），虽然 pre-wrap 不会合并空格，但是处理空格的方式比较笨拙僵硬，而 break-spaces 会把空格当作字符来处理，因此一行尾部没用完的空格会在下一行开头显示。

### word-break

决定单词**内部**断行方式。

- normal，默认，CJK 自动换行，Non-CJK 单词内部不断行（但是单词之间会换行）。

由上可知，两类字符的断行方式默认不一样，那么下面两种就是为了设置成统一的。

- break-all，都断行
- keep-all，都不断行（标点符号处，依然会进行断行）。可以利用其默认不断行，但是标点空格会断行的特性。来排版特定的文字组在一起，以免因为自动换行而带来的阅读性差。

### overflow-wrap

决定一个不能分开的字符串太长的换行方式。

- normal
- break-word，强制分隔换行
- anywhere，在计算最小内容尺寸的时候会考虑软换行

### line-break

决定 CJK 文字标点符号的断行规则。自动换行中，会遵循一定的避首标点，避尾标点原则。例如引号不能排在一行的开头，会自动拉一个字下来“陪同”。

- auto
- loose
- normal
- strict
- anywhere（常用），不考虑原则，每一个标点符号能换行就换行。

### 总结

对于动态内容：

```css
.dynamic-text {
  word-break: break-all;
  overflow-wrap: break-word;
}
```

静态内容则使用软连接字符加`<wbr>`标签来处理。

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

### LESS

#### 配色

- 补色`spin(@theme-color, 180)`
- 三元色`spin(@theme-color, 120)`、`spin(@theme-color, -120)`
  > 想象一个圆形色盘，补色即找寻对面的色，即 180°。
- 当另一个种颜色，你想运用到时，可以与主题色进行混合，使之更和谐。`mix(@theme-color, mediumvioletred)`
- 明暗度。比如按钮的不同状态。`lighten(@theme-color, 10%)`、`darken(@theme-color, 10%)`
- 饱和度。越饱和越亮丽。`saturate(@theme-color, 10%)`、`desaturate(@theme-color, 10%)`
- 对比色。比如背景与文字颜色。`contrast(@bg-color)`
- 透明度。`fade(@theme-color, 10%)`，相当于设置`rgba(221,123,122,0.1)`

## 滚动条设置

设置是一个完整的设置，可以想象成浏览器内置的滚动条样式你不能不分修改，要改，就自己造一套滚动条样式。

## CSS 数据类型定义语法

### 字面符号

- `/`，用来分隔一个值的多个部分（rgba），在缩写中用于分离数据类型相同但属于不同属性的值，例如：font 属性中的`font-size / line-height`，background 属性中的`background-position / background-size`。

### 组合符号

- ` `，空格，表示各部分**必须按顺序出现**。
- `&&`，必须出现，可以不按顺序。
- `||`，各部分至少出现一个，可以不按顺序。
- `|`，互斥。

### 数量符号

- `#`，可以出现一次或多次，但多次出现时必须以逗号分隔（box-shadow）。
- `!`，用于组合符号方括号后面，表当前分组必须产生一个值。

## CSS 全局关键字

### 属性值

- `inherit`，继承。
- `initial`，把当前 css 属性的计算值还原成 css 语法中规定的初始值，注意，并非还原成浏览器对特定标签所设定的初始值（ul/ol 标签）。
- `unset`，根据当前 css 属性是否具有继承特性，来决定使用 inherit 或者 initial（增加心智负担，对于一个设置 unset 的属性不如直接设置 inherit 或者 initial）。常常配合 all 使用`all: unset;`。
- `revert`，让当前属性恢复成浏览器内置的样式（ul/ol 标签）。

### 属性

`all`，语法为只能使用上述几个全局关键字属性值。

- `all:inherit`，`all:initial`比较鸡肋。
- `all:unset`，可以让任意一个元素样式表现和`<span>`标签一样（display 规范中初始属性为 inline）。
- `all:revert`，可以让元素恢复成浏览器默认的样式。

`direction`（兼容阿拉伯文字从右向左）与`unicode-bidi`属性不包括在 all 属性指代范围之内。

## @supports

新的渐进增强处理方案。老旧的有：使用属性值差异、使用伪元素选择器差异。

- 检测是否支持某个属性值，例如：`@supports (display: flex) {}`、`@supports (not (display: flex)) {}`。
- 检测是否支持某个自定义属性。例如：`@supports (--my-custom-prop: blue) {}`。
- 检测是否支持某个选择器。例如：`@supports selector(:default) {}`。

在 js 中则可以使用如下判断：

```js
if (!window.CSS || !CSS.supports || !CSS.supports("position", "sticky")) {
  //不支持此属性的逻辑
}
```

## CSS 尺寸体系

### intrinsic sizing

- `fit-content`
- `min-content`
- `max-content`

### extrinsic sizing

- `stretch`

## CSS 逻辑属性

- `writing-mode`，值：horizontal-tb、vertical-rl、vertical-lr。
- `direction`，值：ltr、rtl。
- `text-orientation`
- `inline-start`，表内联元素文档流的开始方向。默认左。
- `inline-end`，表内联元素文档流的结束方向。默认右。
- `block-start`，表块级元素排版的开始方向。默认上。
- `block-end`，表块级元素排版的结束方向。默认下。

### margin/padding/border 方位与逻辑的对应关系

- margin-left ↔ margin-inline-start
- margin-top ↔ margin-block-start
- margin-right ↔ margin-inline-end
- margin-bottom ↔ margin-block-end

在`writing-mode:vertical-rl`环境下

- margin-left ↔ margin-block-end
- margin-top ↔ margin-inline-start
- margin-right ↔ margin-block-start
- margin-bottom ↔ margin-inline-end

block 也是 start、end 的缩写。也就是`margin-block`属性代表`margin-block-start`与`margin-block-end`。同理 inline。

应用：对称布局（可能会用到`unicode-bidi: plaintext;`）。

### width

width 属性对应的 CSS 逻辑属性是 inline-size，height 属性对应的 CSS 逻辑属性是 block-size。

### inset

对于绝对定位的 top/left/bottom/right，需要使用 inset 配合。例如：inset-inline-start(left)。也支持整体缩写，例如：`inset: 0;`。

## `border-image`

语法：

```
border-image: <'border-image-source'> || <'border-image-slice'> [ / <'border-image-width'> | / <'border-image-width'>? / <'border-image-outset'> ]? || <'border-image-repeat'>
```

该属性目前最大的作用还是实现一些线性边框（虚线，渐变等），而不是使用具体图片来进行划分填充。

> 下面描述中**源图像**指外来图像，用来设置边框背景的图片。**元素 p**代值被设置源图像边框的元素。

### 源图像的划分

无论是源图像，还是元素 p，对于区域划分，均采用如下划分（遵循上、右、下、左的顺序）：

```
152
896
473
```

#### `border-image-source`

语法：

```
border-image-source: none | <image>
```

因此边框除了使用图片，还可以使用渐变条纹（linear-gradient）等图形。

#### `border-image-slice`

源图像的具体划分策略，语法：

```
border-image-slice: <number-percentage>{1,4} && fill?
```

默认值`100%`。支持 1 到 4 个属性，值为数值（不带单位，以 px 在源图像上进行划分）或者百分比。fill 表示是否使用源图像 9 号位来填充元素 p 的 9 号位。

### 九宫格尺寸的控制

#### `border-image-width`

用来设置，在目标对象元素 p 上的边框应用范围。

默认值`1`。可设置四个方向。超过元素 p 宽高的设置，会按照“等比例原则”和“百分百原则”进行校正。

- 支持系数，与`border-width`相乘，来决定填充的范围（默认是 1）。无论是缩小还是放大，元素 p 本身的内容范围是没有变化的。
- 百分比。相对的对象是元素 p 的宽度和高度。
- auto。使用 slice 中对源图像划分的值来作为填充范围。

#### `border-image-outset`

`border-image-width`是从离边框的距离来划分元素 p 的边框应用范围，而 outset 属性是从元素 p 的 9 号位开始向外扩展，来划分元素 p 的边框应用范围。换句话说话，`border-image-width`控制第 1 到第 8 区的尺寸，而`border-image-outset`控制第 9 区的尺寸。

语法如下，系数的对象为`border-width`:

```
border-image-outset: [<length> | <number>]{1, 4}
```

默认值`0`。

### 5，6，7，8 区域的控制

默认是拉伸。可通过`border-image-repeat`来设置，语法如下：

```
border-image-outset: [ stretch | repeat | round | space ]{1,2}
```

- stretch。默认值，让源图像拉升以充满显示区域。
- repeat。
- round。类似于平铺，适当伸缩来填满。
- space。宽度保持，来进行平铺，不够的用空格填充。

### 轮廓模拟

以下模拟对布局都没有任何影响

- outline
- box-shadow，直接设置 spread 属性为轮廓宽度。
- border-image，`border-image-width`设置轮廓的宽度，然后通过`border-image-outset`来调整轮廓恰好出现在内边框处，根据 border 的不同，这个值不同。

```css
border: 0.02px solid; /* 必须要有边框，border-image才有效果 */
border-image: linear-gradient(lightskyblue, lightskyblue) 2 / 20px / 20px;
```

## font

### 默认字体设置

无衬线版：

```css
@font-face {
  font-family: Emoji;
  src: local("Apple Color Emoji"), local("Segoe UI Emoji"), local(
      "Segoe UI Symbol"
    ), local("Noto Color Emoji");
  unicode-range: U+1F000-1F644, U+203C-3299;
}
body {
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Emoji, Helvetica,
    Arial, sans-serif;
}
```

- Segoe UI，windows 系统最佳西文字体。
- Roboto，安卓最佳西文字体。
- Helvetica，macOS 和 iOS 常用无衬线字体。
- Arial，全平台通用无衬线字体。
- Segoe UI Symbol，windows7 添加的新字体，单色图案。
- Noto Color Emoji，谷歌用在 Android 和 Linux 系统中。
- Emoji 放在备用字体之前，是因为这些字体涵盖了部分 emoji 的 unicode 码，会造成 emoji 显示黑白图案而非彩色。

衬线版：

```css
.font-serif {
  font-family: Georgia, Cambria, "Times New Roman", Times, serif;
}
```

等宽版：

```css
.font-mono {
  font-family: Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
    monospace;
}
```

数学字体：

```css
math {
  font-family: Cambria Math, Latin Modern Math;
}
```

- Cambria Math，windows 系统
- Latin Modern Math，macOS 系统

### 自定义字体

使用 woff/woff2 格式加载，在一定程度上可以使用`font-display`进行加载顺序的调优。
