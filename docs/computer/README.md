# 计算机知识

## 容量

比特是计算机世界最小的单位，又叫位。因为采用二进制存储，因此一位要么用 0 表示，要么用 1 表示。N 位可以表示 2^N 种状态。

1 byte = 8 bit

1 KiB = 1024 byte

1 KB = 1000 byte

## ASCII

American Standard Code for Infomation Interchange，美国信息交换标准代码，是基于拉丁字母的一套**单字节**电脑编码系统。

一个字节 8 位，ASCII 码空了最高位一直为 0，因此实际用到了 128 种状态。0-31 用来控制像打印机的外围设备，32-126 为具体的可显示字符，127 为删除命令。

> 网络起源于西方，这 128 个字符表示信息绰绰有余，计算机中 1 个字节 8 位，可表示 256 种信息，显示中文不够，因此中文文字一个字占据 2 个字节。编码方式，老式为 GB2312，目前均为 Unicode。

## Unicode

由于互联网发展迅速，要传输的内容早已不是 ASCII 码所能覆盖的，因此 Unicode 作为了统一的字符集来标识一切可显示的字符。每个字符都有一个码点，最大表示范围为`0x000000 - 0x10FFFF`。

- U+0000 到 U+FFFF 最前面的 65536 个字符位，它的码点范围是从 0 一直到 2^16-1。所有最常见的字符都放在这里。
- U+010000 一直到 U+10FFFF 剩下的字符都放着这里，码点范围从 U+010000 一直到 U+10FFFF。

根据各个环境的不同，unicode 有不同的编码方式（目的是为了合理的利用存储空间），而 utf-8 就是一个比较常用的**编码规则**。

### utf-8

动态的使用 1-4 个字节来标识不同的字符。

| Unicode 码点范围（十六进制） | 十进制范围      | UTF-8 编码方式（二进制）            | 字节数 |
| ---------------------------- | --------------- | ----------------------------------- | ------ |
| 0000 0000 ~ 0000 007F        | 0 ~ 127         | 0xxxxxxx                            | 1      |
| 0000 0080 ~ 0000 07FF        | 128 ~ 2047      | 110xxxxx 10xxxxxx                   | 2      |
| 0000 0800 ~ 0000 FFFF        | 2048 ~ 65535    | 1110xxxx 10xxxxxx 10xxxxxx          | 3      |
| 0001 0000 ~ 0010 FFFF        | 65536 ~ 1114111 | 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx | 4      |

js 实现 1-3 个字符。

```js
function str2binaryByUtf8(str) {
  const string = str.replace(/\r\n/g, "\n");
  let result = "";
  let code;
  for (var n = 0; n < string.length; n++) {
    //获取麻点
    code = str.charCodeAt(n);
    if (code < 0x007f) {
      // 1个字节
      // 0000 0000 ~ 0000 007F  0 ~ 127 1个字节

      // (code | 0b100000000).toString(2).slice(1)
      result += code.toString(2).padStart(8, "0");
    } else if (code > 0x0080 && code < 0x07ff) {
      // 0000 0080 ~ 0000 07FF 128 ~ 2047 2个字节
      // 0x0080 的二进制为 10000000 ，8位，所以大于0x0080的，至少有8位
      // 格式 110xxxxx 10xxxxxx

      // 高位 110xxxxx
      result += ((code >> 6) | 0b11000000).toString(2);
      // 低位 10xxxxxx
      result += ((code & 0b111111) | 0b10000000).toString(2);
    } else if (code > 0x0800 && code < 0xffff) {
      // 0000 0800 ~ 0000 FFFF 2048 ~ 65535 3个字节
      // 0x0800的二进制为 1000 00000000，12位，所以大于0x0800的，至少有12位
      // 格式 1110xxxx 10xxxxxx 10xxxxxx

      // 最高位 1110xxxx
      result += ((code >> 12) | 0b11100000).toString(2);
      // 第二位 10xxxxxx
      result += (((code >> 6) & 0b111111) | 0b10000000).toString(2);
      // 第三位 10xxxxxx
      result += ((code & 0b111111) | 0b10000000).toString(2);
    } else {
      // 0001 0000 ~ 0010 FFFF   65536 ~ 1114111   4个字节
      // https://www.unicode.org/charts/PDF/Unicode-13.0/U130-2F800.pdf
      throw new TypeError("暂不支持码点大于65535的字符");
    }
  }
  return result;
}
```

## base64

即 64 个字符。还有一个字符`=`属于填充字符。

- `A-Z` 26
- `a-z` 26
- `0-9` 10
- `+` `/` 2

### 编码规则

对照表（从0开始算）：`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`

1. 对于一个二进制数据。根据字节数进行补齐，补到能被 3 整除，也就是最多补 2 个字节。
2. 以 6 位进行分组（2^6=64），分别计算其数值，然后根据字符表顺序转换成对应的 base64 字符。填充字节数使用`=`号补充（一个字节补充一个=号）。

### js 实现
这里的二进制数据可使用上述`str2binaryByUtf8`方法取得。
```js
function utf82base64(binaryStr) {
  const BASE64_CHARTS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const len = binaryStr.length;

  // 需要填补的=的数量
  let paddingCharLen = len % 24 !== 0 ? (24 - (len % 24)) / 8 : 0;

  //6个一组
  const groups = [];
  for (let i = 0; i < binaryStr.length; i += 6) {
    let g = binaryStr.slice(i, i + 6);
    if (g.length < 6) {
      g = g.padEnd(6, "0");
    }
    groups.push(g);
  }

  // 求值
  let base64Str = groups.reduce((b64str, cur) => {
    console.log(cur, +`0b${cur}`);
    b64str += BASE64_CHARTS[+`0b${cur}`];
    return b64str;
  }, "");

  // 填充=
  if (paddingCharLen > 0) {
    base64Str += paddingCharLen > 1 ? "==" : "=";
  }

  return base64Str;
}
```

## Data URLs

URL 意味统一资源定位符，而 Data URLs 就是一种以 data 形式来进行资源定位的一种方案（这里的 s 代表 scheme）。它的格式为：

```
data:[<mediaType>][;base64],<data>
```

- 文本，可以省略 mediaType 以及 base64 标识，例如：`data:,Hello`。另外，mediaType 默认`text/plain;charset=US-ASCII`
- 非文本，这里使用 base64 编码来对内容进行编码成字符串，然后填充在 data 域里。例如：`data:image/png;base64,iVBORw0`

这种方案允许内容创建者以内联的形式把小文件插入到文档中。这个小文件可以是 html、图片、svg 图片等。

> ???mdn 这句话没懂。Data URLs are treated as unique opaque origins by modern browsers, rather than inheriting the origin of the settings object responsible for the navigation.

## 数值的操作

### 右移

去低位，例如：64 >> 2 = 16

```
0 1 0 0 0 0 0 0       64
-------------------
   0 1 0 0 0 0 | 0 0  16
```

### `&`操作符

都为 1 的时候，值为 1。可用来去高位。

### `|`操作符

任意为 1 时，值为 1，可用来填补 0。
