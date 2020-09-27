# 数据结构与算法

## 计算机科学

> Computer science should be called computing science, for the same reason why surgery is not called knife science. -- E. Dijkstra
> 古代的计算机：

- 绳索计算机（求垂直线）
- 尺规计算机（求一条线的 2 个等分点）

## 算法

程序 != 算法，例如 Hailstone(n)求解。

评判一个算法分为：

- 正确性（暂时忽略）
- 效率性：时间成本 + 空间成本（暂时忽略）

通过一定的计算模型（图灵机模型，RAM 模型），可以把算法的运行时间通过**执行的基本操作次数**来反应。

**T(n) = 算法为求解规模为 n 的问题，所需执行的基本操作次数。**

### 时间复杂度记号 O

诸如此类的还有记号 Ω（最好情况），记号 Θ（平均情况）。

- O(1)。常数解
- O(logn)。不超过 O(n)。来自于调和级数 1 + 1/2 + 1/3 + ... + 1/n
- O(n)。线性复杂度
- O(nlogn)。来自对数级数 log1 + log2 + log3 +... + logn = log(n!)
- O(n^c)多项式复杂度，不超过 O(2^n)
- O(2^n)指数复杂度

## 数据结构

### Array & String

优点：

- 构建非常简单。
- 获取指定位置的元素很快（下标）O(1)。

缺点：

- 构建时分配的空间是连续的空间。
- 查找/增加/删除很慢 O(n)。

### Linked-List

优点：

- 灵活的分配内存空间。
- 增加/删除很快 O(1)。

缺点：

- 查找很慢 O(n)。
  > 经常需要构建一个虚拟的链表头进行计算。

### Stack

后进先出。

只关心最近一次的操作，处理完最近一次操作后,能在 O(1)的时间内找到上更上一次的操作。

（20 有效的括号）
（739 每日温度，存储到栈的里的是暂时不能处理的数据，因为碰到新数据大于栈顶数据才能处理栈顶，以至于处理余下的）

### Queue

先进先出。

利用单链表实现。

按照一定顺序进行操作，例如广度优先搜索。

### Deque

利用双链表实现。实现一个长度动态变化的窗口或者连续区间。

### Tree

满二叉树、完全二叉树、二叉搜索树、平衡二叉树、红黑树、自平衡二叉搜索树

3 中深度遍历方法：

#### 前序遍历

#### 中序遍历

对于二叉搜索树的中序遍历，是按照大小顺序遍历的。1-2-3-4。

（230 二叉搜索树中第 K 小的元素）

#### 后续遍历

当根节点的信息需要由左右子树的信息汇合而成时使用，比如求树的深度。

### 优先队列 / Priority Queue

### Graph

### Trie

### Segment Tree

### 树状数组 Fenwick Tree / Binary Indexed Tree

## 排序

### 冒泡排序（bubble sort）

`O(n^2)` / 稳定

#### 基础写法

```javascript
const bubbleSortByASC = (arr) => {
  let flag = true;
  for (let i = 0; i < arr.length && flag; i++) {
    flag = false;
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        flag = true;
      }
    }
  }
};
```

#### 优化：找出有序边界

每轮回一次，尽量缩小无序数组的范围

```javascript
const bubbleSortByASC = (arr) => {
  // 上次交换位置
  let lastExchangeIndex = 0;
  // 无序数组边界，即在这个范围内进行两两比较
  let sortBorder = arr.length - 1;

  for (let i = 0; i < arr.length; i++) {
    let isSorted = true;
    for (let j = 0; j < sortBorder; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        // 设false，说明这一轮进行了交换，是无序的
        isSorted = false;
        // 每次更新交换位置
        lastExchangeIndex = j;
      }
    }
    // 这一轮的最后交换位置即为有序数组与无序数组的分界
    // lastExchangeIndex属于无序数组
    sortBorder = lastExchangeIndex;
    // 这一轮没进行任何交换，即已是有序数组，跳出，不再轮回
    if (isSorted) {
      break;
    }
  }
};
```

### 插入排序 (insertion sort)

依次比较前面有序的部分，不满足条件的就向后移动一位。原始序列越有序，时间复杂度越低。

`O(n^2)` / `Ω(n)` / `Θ(n^2)` / 稳定。

```javascript
const insertionSort = (arr) => {
  for (let i = 1; i < arr.length; i++) {
    let curr = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > curr) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = curr;
  }
};
```

### 归并排序（merge sort）

分治策略（重点在合）
不超过 O(nlogn)

``` javascript
const mergeSort = (arr, lo, hi) => {
  if(lo >= hi) return

  const mid = Math.floor(lo + (hi - lo) / 2)
  console.log(mid)
  mergeSort(arr, lo, mid)
  mergeSort(arr, mid + 1, hi)

  merge(arr, lo, mid, hi)
}

const merge = (arr, lo, mid, hi) => {
  const temp = arr.slice()
  let i = lo, j = mid + 1, k = lo
  while(k  <= hi) {
    if(i > mid) {
      arr[k++] = temp[j++]
    } else if(j > hi) {
      arr[k++] = temp[i++]
    } else if(temp[i] <= temp[j]) {
      arr[k++] = temp[i++]
    } else if(temp[i] > temp[j]) {
      arr[k++] = temp[j++]
    }
  }
}
```

### 快速排序 (quick sort)

O(n^2)/Θ(nlogn)，分治策略（重点在分），不稳定，就地
空间复杂度：O(logn)

方案一：两个指针向中间靠，通过空闲元素来进行交换，最后把轴点交换到中间

```javascript
const quickSort = (arr, lo, hi) => {
  if (hi - lo < 1) return; //循环终止条件
  const mi = partition(arr, lo, hi); //轴点
  quickSort(arr, lo, mi);
  quickSort(arr, mi + 1, hi);
};
```

```javascript
const partition = (arr, lo, hi) => {
  const pivot = arr[lo];
  while (lo < hi) {
    //这里使用等于号，并不能保证轴点在一堆，轴点可能分散在左右两侧，但无关紧要
    while (lo < hi && arr[hi] >= pivot) hi--;
    [arr[lo], arr[hi]] = [arr[hi], arr[lo]];
    while (lo < hi && arr[lo] <= pivot) lo++;
    [arr[lo], arr[hi]] = [arr[hi], arr[lo]];
  }
  return lo;
};
```

方案二：一个指针不断检测新元素，小的交换放左，大的不动，最后复位元素

```javascript
const partition = (arr, lo, hi) => {
  const pivot = arr[lo];
  let mi = lo;
  for (let k = lo + 1; k <= hi; k++) {
    if (arr[k] < pivot) {
      mi++;
      [arr[k], arr[mi]] = [arr[mi], arr[k]];
    }
  }
  // 不能使用mi + 1进行交换到大序列中去，防止溢出，例如mi = hi的情况下，js中数组会乱
  [arr[lo], arr[mi]] = [arr[mi], arr[lo]];
  return mi;
};
```

### 拓扑排序 (topological sort)



### 选择排序（selection sort）

O(n^2)/Θ(n^2)，雷打不动 n^2。

### 堆排序（heap sort）

### 桶排序（bucket sort）

## 树

## 选取

### 众数（majority）

占比一半以上。

选取方法：

```javascript
const majority = (arr) => {
  const majEleCandidate = (arr) => {
    let maj;
    for (let i = 0, c = 0; i < arr.length; i++) {
      if (c === 0) {
        maj = arr[i];
        c = 1;
      } else {
        maj === arr[i] ? c++ : c--;
      }
    }
    return maj;
  };
  const majEleCheck = (arr, maj) => {
    let occurrence = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === maj) occurrence++;
    }
    return 2 * occurrence > arr.length;
  };
  const maj = majEleCandidate(arr);
  return majEleCheck(arr, maj) ? maj : null;
};
```

### 中位数（median）

S[n/2]（向下取整）

### 快速选取（quick select）

```javascript
const quickSelect = (arr, k) => {
  for (let lo = 0, hi = arr.length - 1; lo < hi; ) {
    const pivot = arr[lo];
    let i = lo,
      j = hi;
    while (i < j) {
      while (i < j && arr[j] >= pivot) j--;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      while (i < j && arr[i] <= pivot) i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    arr[i] = pivot;
    // 如果相等，lo必然大于hi循环结束
    if (k <= i) hi = i - 1;
    if (k >= i) lo = i + 1;
  }
};
```

### （linear select）

## 常见算法时间复杂度

- 二分`O(logn)`
- 二叉树遍历`O(n)`
- 合并排序`O(nlogn)`

## 递归（recursion）
递归就是函数调用自身，把一个复杂的问题，逐渐缩小要解决的范围，直至解决问题，核心就是测试规模n的问题，是不是可以利用规模n-1的结果。

例如汉诺塔问题，把n块的移动规划成了移动n-1块加1个已知的简单操作（这个简单操作就是构成解决实际问题的基础操作），然后依次类推得出结果。
``` javascript
const hano = (a, b, c, n) => {
  if (n > 0) {
    hano(a, c, b, n - 1);
    console.log(a, "->", c);
    hano(b, a, c, n - 1);
  }
};
```

再比如，中心对称数问题：
``` javascript
// 中心对称数是指一个数字在旋转了180度之后看起来依旧相同的数字
const findCentralSymmetricalNumber = (n, m) => {
  if (n < 0 || m < 0) return;
  if (n === 0) {
    return [];
  }
  if (n === 1) {
    return ["0", "1", "8"];
  }
  if (n === 2) {
    return ["11", "88", "69", "96", ...(n !== m ? ["00"] : [])];
  }
  const ret = [];
  const s = findCentralSymmetricalNumber(n - 2, m);
  const temp = [
    ["1", "1"],
    ["8", "8"],
    ["6", "9"],
    ["9", "6"],
    ...(n !== m ? [["0", "0"]] : [])
  ];
  s.forEach(v => {
    temp.forEach(v2 => {
      ret.push(`${v2[0]}${v}${v2[1]}`);
    });
  });
  return ret;
};
```
递归次数，取决于递归树，而递归树取决于轴枢的选择。树越平衡，递归次数越少。

而对分区的长短处理顺序，影响的是递归时对栈的使用内存，而不是递归次数

- 避免人肉递归
  > 这是最易想到，也是效率最低的方法
- 找到最近最简方法，将其拆解成可重复解决的问题（重复子问题）
  > 从最初始出发，边穷举边归纳重复的东西（例如爬楼梯问题）
- 数学归纳法思维

JAVA 递归模板：

```java
public void recur(int level, int param) {
  // terminator 跳出条件
  if(level > MAX_LEVEL) {
    return
  }

  // process current logic 逻辑代码
  process(level, param)

  // drill down 下钻下一次逻辑
  recur(level + 1, new Param)

  // restore current status 一般不需要，重置状态
}
```

如果计算类的递归，那么递归结果应该返回计算值。如果是查找类的递归，那么递归结果应该返回结果。

## 回溯（backtracking）
回溯是一种试探算法，一步步的向前，每一步评估结果，一旦结果不满足条件，就即时终止并回退到上一步的状态。

例如，组合总和问题（39）：
``` javascript
/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
var combinationSum = function(candidates, target) {
  const res = [];
  helper(candidates, target, 0, [], res);
  return res;
};

const helper = (candidates, target, start, solution, res) => {
  if (target < 0) {
    return;
  }
  if (target === 0) {
    // 把当前结果复制出来存在最终结果中
    res.push(solution.slice());
    return;
  }
  for (let i = start; i < candidates.length; i++) {
    solution.push(candidates[i]);
    helper(candidates, target - candidates[i], i, solution, res);
    solution.pop();
  }
};
```
再比如，N皇后问题（51）:
``` javascript
/**
 * @param {number} n
 * @return {string[][]}
 */
var solveNQueens = function(n) {
  const columns = [];
  const res = [];
  backtracking(n, 0, columns, res);
  return res;
};

const backtracking = (n, row, columns, res) => {
  if (row === n) {
    // 行已经用完了，说明已经排完了
    res.push(
      columns.map(v => {
        const res2 = Array(n).fill(".");
        res2[v] = "Q";
        return res2.join("");
      })
    );
    return;
  }
  for (let i = 0; i < n; i++) {
    columns[row] = i;
    if (check(row, i, columns)) {
      // 在当前行满足条件的情况下，排下一行
      backtracking(n, row + 1, columns, res);
    }
    columns[row] = -1;
  }
};

const check = (row, col, columns) => {
  for (let r = 0; r < row; r++) {
    // 同列以及对角线不满足条件
    if (columns[r] === col || row - r === Math.abs(columns[r] - col)) {
      return false;
    }
  }
  return true;
};
```
## 二分法
常用写法，主要领略**左闭右开**区间的魅力。
``` python
def bisect_left(arr, lo, hi, target):
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] < target: lo = mid + 1
        else: hi = mid
    return lo 
```

> 左闭右开。循环后lo = hi。

如何用lower_bound和upper_bound在[first, last)完成所有四种binary search (上/下界，开/闭区间)？

- lower_bound(value)本身找的是x >= value的下界，若为last则不存在；
- upper_bound(value)本身找的是x > value的下界，若为last则不存在；

因为区间是离散的，所以：
- lower_bound(value) - 1 即为x < value的上界，若为first - 1则不存在；
- upper_bound(value) - 1 即为x <= value的上界，若为first - 1则不存在。



## 零星知识点

- 加速数据经常采用的方式就是升维，多了一个维度就多了一些信息
- 双指针的用法，可以同向进行（26 删除排序数组重复项），也可以从两端开始往中间靠拢（11 盛最多水容器）
- 检测重复性用哈希数据结构（3 无重复子串）
- for/while 循环中可提前返回（242 有效的字母异位词）
- 递归中如果有if句柄，会很容易陷入堆栈溢出，这时可以用迭代处理（34 在排序数组中查找元素的第一个和最后一个位置）
``` javascript
if (nums[p] === target) {
  if (p === 0 || nums[p - 1] !== target) {
    ret[0] = p;
    return;
  } else {
    helper(nums, 0, p - 1, target);
  }
  if (p === nums.length - 1 || nums[p + 1] !== target) {
    ret[1] = p;
    return;
  } else {
    helper(nums, p + 1, hi, target);
  }
}
```
- 二分查找边界控制（同上34）