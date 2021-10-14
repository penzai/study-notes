# 计算机知识

## 容量

1 byte = 8 bit

1 KiB = 1024 byte

1 KB = 1000 byte

## ASCII
American Standard Code for Infomation Interchange，美国信息交换标准代码，是基于拉丁字母的一套电脑编码系统。一共128个字符，32-126为具体的可显示字符，其余代表非字符意义。

网络起源于西方，这128个字符表示信息绰绰有余，计算机中1个字节，可表示256中信息，显示中文不够，因此中文文字一个字占据2个字节。编码方式，老式为GB2312，目前均为Unicode。

## Data URLs
URL意味统一资源定位符，而Data URLs就是一种以data形式来进行资源定位的一种方案（这里的s代表scheme）。它的格式为：

```
data:[<mediaType>][;base64],<data>
```

- 文本，可以省略mediaType以及base64标识，例如：`data:,Hello`。另外，mediaType默认`text/plain;charset=US-ASCII`
- 非文本，这里使用base64编码来对内容进行编码成字符串，然后填充在data域里。例如：`data:image/png;base64,iVBORw0`

这种方案允许内容创建者以内联的形式把小文件插入到文档中。这个小文件可以是html、图片、svg图片等。

> ???mdn这句话没懂。Data URLs are treated as unique opaque origins by modern browsers, rather than inheriting the origin of the settings object responsible for the navigation.