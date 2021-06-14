### API
#### document.createElementNS
与`createElement`类似，都是创建节点，但是有些节点会产生识别障碍，比如`<path>`标签，这时候就需要一个命名空间来指明，而且命名空间是规定的那几个才有效。

有效的命名空间
- HTML: http://www.w3.org/1999/xhtml
- SVG：http://www.w3.org/2000/svg
- XBL：http://www.mozilla.org/xbl
- XUL：http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul

使用示例：
``` javascript
const path = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
```