---
title: 具体数学-第13课（组合数各种性质）
date: 2018-05-27 16:30:06
top: false
cover: false
password:
toc: true
mathjax: true
summary:
tags:
- 具体数学
categories:
- 数学
---

<div align="middle"><iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=33035611&auto=1&height=66"></iframe></div>

> 首先庆祝我自己顺利毕业了，忙完了毕业论文答辩一直在浪，所以上周的具体数学没有更新，现在补更一下，大家见谅。

首先这节课讲的基本都是组合数的相关性质，而且特别多，所以我就不在这里详细证明了，如果你们对某一个性质感兴趣，可以自己证明去。

# 性质1
---
首先将组合数推广到负数域，也就是底数为负数的情况：
\\[\left( {\begin{array}{\*{20}{c}}r\\k\end{array}} \right) = {( - 1)^k}\left( {\begin{array}{\*{20}{c}}{k - r - 1}\\k\end{array}} \right)\\]
证明可以从下降阶乘幂的定义直接得到。

# 性质2
---
由于
\\[\left( {\begin{array}{\*{20}{c}}{m + n}\\m\end{array}} \right) = \left( {\begin{array}{\*{20}{c}}{m + n}\\n\end{array}} \right)\\]
所以由性质1可得
\\[{( - 1)^m}\left( {\begin{array}{\*{20}{c}}{ - n - 1}\\m\end{array}} \right) = {( - 1)^n}\left( {\begin{array}{\*{20}{c}}{ - m - 1}\\n\end{array}} \right)\\]

# 性质3
---
\\[\sum\limits_{k \le m} {\left( {\begin{array}{\*{20}{c}}r\\k\end{array}} \right){ {( - 1)}^k}}  = {( - 1)^m}\left( {\begin{array}{\*{20}{c}}{r - 1}\\m\end{array}} \right)\\]
这就说明了杨辉三角同一行的前面若干项交错和是可以求得的，但是它们的直接和是无法求出的。

# 性质4
---
\\[\sum\limits_{k \le m} {\left( {\begin{array}{\*{20}{c}}{m + r}\\k\end{array}} \right){x^k}{y^{m - k}} = \sum\limits_{k \le m} {\left( {\begin{array}{\*{20}{c}}{ - r}\\k\end{array}} \right){ {( - x)}^k}{ {(x + y)}^{m - k}}} } \\]
证明可以通过令
\\[{S_m} = \sum\limits_{k \le m} {\left( {\begin{array}{\*{20}{c}}{m + r}\\k\end{array}} \right){x^k}{y^{m - k}}}  = \sum\limits_{k \le m} {\left( {\begin{array}{\*{20}{c}}{m + r - 1}\\k\end{array}} \right){x^k}{y^{m - k}}}  + \sum\limits_{k \le m} {\left( {\begin{array}{\*{20}{c}}{m + r - 1}\\{k - 1}\end{array}} \right){x^k}{y^{m - k}}} \\]
将左边表示成递归式的形式，同理如果右边可以表示成相同的递归式，那么左右就相等了。

性质4看起来特别复杂，那么它有什么用呢？如果令$x$和$y$等于不同的值，那么就可以得到许多不同的恒等式。

# 性质5
---
令$x =  - 1,y = 1$可以得到
\\[\sum\limits_{k \le m} {\left( {\begin{array}{\*{20}{c}}{m + r}\\k\end{array}} \right){ {( - 1)}^k}}  = \left( {\begin{array}{\*{20}{c}}{ - r}\\m\end{array}} \right)\\]
这其实就是性质3的特例。

# 性质6
---
令$x = y = 1,r = m + 1$可以得到
\\[\sum\limits_{k \le m} {\left( {\begin{array}{\*{20}{c}}{2m + 1}\\k\end{array}} \right)}  = \sum\limits_{k \le m} {\left( {\begin{array}{\*{20}{c}}{m + k}\\k\end{array}} \right){2^{m - k}}} \\]
左边就是杨辉三角一行中左边一半的和，所以可以得到
\\[\sum\limits_{k \le m} {\left( {\begin{array}{\*{20}{c}}{m + k}\\k\end{array}} \right){2^{ - k}}} {\rm{ = }}{2^m}\\]

# 性质7
---
\\[\left( {\begin{array}{\*{20}{c}}r\\m\end{array}} \right)\left( {\begin{array}{\*{20}{c}}m\\k\end{array}} \right) = \left( {\begin{array}{\*{20}{c}}r\\k\end{array}} \right)\left( {\begin{array}{\*{20}{c}}{r - k}\\{m - k}\end{array}} \right)\\]
这个公式可以形象理解为，从$r$个物品中取$m$个，再从这$m$个中取$k$个的方法数等于从$r$个物品中取$k$个，再从剩下的$r-k$个中取$m-k$个的方法数。证明的话直接用定义可证。

# 性质8
---
之前介绍了二项式系数，那么可以推广到任意$m$个未知数，它的展开式为
\\[{({x_1} + {x_2} +  \cdots  + {x_m})^n} = \sum\limits_{\scriptstyle0 \le {a_1},{a_2}, \cdots ,{a_m} \le n\atop\scriptstyle{a_1} + {a_2} +  \cdots  + {a_m} = n} {\left( {\begin{array}{\*{20}{c}}{ {a_1} + {a_2} +  \cdots  + {a_m}}\\{ {a_1},{a_2}, \cdots ,{a_m}}\end{array}} \right)} {x_1}^{ {a_1}}{x_2}^{ {a_2}} \cdots {x_m}^{ {a_m}}\\]
其中
\\[\left( {\begin{array}{\*{20}{c}}{ {a_1} + {a_2} +  \cdots  + {a_m}}\\{ {a_1},{a_2}, \cdots ,{a_m}}\end{array}} \right) = \left( {\begin{array}{\*{20}{c}}{ {a_1} + {a_2} +  \cdots  + {a_m}}\\{ {a_2} +  \cdots  + {a_m}}\end{array}} \right) \cdots \left( {\begin{array}{\*{20}{c}}{ {a_{m - 1}} + {a_m}}\\{ {a_m}}\end{array}} \right)\\]

# 性质9
---
范德蒙德卷积式：
\\[\sum\limits_k {\left( {\begin{array}{\*{20}{c}}r\\{m + k}\end{array}} \right)} \left( {\begin{array}{\*{20}{c}}s\\{n - k}\end{array}} \right) = \left( {\begin{array}{\*{20}{c}}{r + s}\\{m + n}\end{array}} \right)\\]
很多公式都可以通过替换其中的一些变量推导得到：
\\[\begin{array}{l}\sum\limits_k {\left( {\begin{array}{\*{20}{c}}l\\{m + k}\end{array}} \right)} \left( {\begin{array}{\*{20}{c}}s\\{n + k}\end{array}} \right) = \left( {\begin{array}{\*{20}{c}}{l + s}\\{l - m + n}\end{array}} \right)\\\sum\limits_k {\left( {\begin{array}{\*{20}{c}}l\\{m + k}\end{array}} \right)} \left( {\begin{array}{\*{20}{c}}{s + k}\\n\end{array}} \right){( - 1)^k} = {( - 1)^{l + m}}\left( {\begin{array}{\*{20}{c}}{s - m}\\{n - l}\end{array}} \right)\\\sum\limits_{k \le l} {\left( {\begin{array}{\*{20}{c}}{l - k}\\m\end{array}} \right)} \left( {\begin{array}{\*{20}{c}}s\\{k - n}\end{array}} \right){( - 1)^k} = {( - 1)^{l + m}}\left( {\begin{array}{\*{20}{c}}{s - m - 1}\\{l - m - n}\end{array}} \right)\\\sum\limits_{0 \le k \le l} {\left( {\begin{array}{\*{20}{c}}{l - k}\\m\end{array}} \right)} \left( {\begin{array}{\*{20}{c}}{q + k}\\n\end{array}} \right) = \left( {\begin{array}{\*{20}{c}}{l + q + 1}\\{m + n + 1}\end{array}} \right)\end{array}\\]

# 例题1
---
最后详细求解一道组合题，其他的题目就不介绍了，可以去看具体数学英文版第173页。

求下面式子的闭形式解：
\\[\sum\limits_{k = 0}^m {\left( {\begin{array}{\*{20}{c}}m\\k\end{array}} \right)/\left( {\begin{array}{\*{20}{c}}n\\k\end{array}} \right)} ,n \ge m \ge 0\\]

根据性质7，可以得到
\\[\left( {\begin{array}{\*{20}{c}}m\\k\end{array}} \right)/\left( {\begin{array}{\*{20}{c}}n\\k\end{array}} \right) = \left( {\begin{array}{\*{20}{c}}{n - k}\\{m - k}\end{array}} \right)/\left( {\begin{array}{\*{20}{c}}n\\m\end{array}} \right)\\]
所以
\\[\sum\limits_{k = 0}^m {\left( {\begin{array}{\*{20}{c}}m\\k\end{array}} \right)/\left( {\begin{array}{\*{20}{c}}n\\k\end{array}} \right)}  = \sum\limits_{k = 0}^m {\left( {\begin{array}{\*{20}{c}}{n - k}\\{m - k}\end{array}} \right)/\left( {\begin{array}{\*{20}{c}}n\\m\end{array}} \right)} \\]
而
\\[\begin{array}{l}\sum\limits_{k \ge 0} {\left( {\begin{array}{\*{20}{c}}{n - k}\\{m - k}\end{array}} \right)}  = \sum\limits_{m - k \ge 0} {\left( {\begin{array}{\*{20}{c}}{n - (m - k)}\\{m - (m - k)}\end{array}} \right)} \\ = \sum\limits_{k \le m} {\left( {\begin{array}{\*{20}{c}}{n - m + k}\\k\end{array}} \right)} \\ = \left( {\begin{array}{\*{20}{c}}{(n - m) + m + 1}\\m\end{array}} \right)\\ = \left( {\begin{array}{\*{20}{c}}{n + 1}\\m\end{array}} \right)\end{array}\\]
所以
\\[\sum\limits_{k = 0}^m {\left( {\begin{array}{\*{20}{c}}m\\k\end{array}} \right)/\left( {\begin{array}{\*{20}{c}}n\\k\end{array}} \right)}  = \left( {\begin{array}{\*{20}{c}}{n + 1}\\m\end{array}} \right)/\left( {\begin{array}{\*{20}{c}}n\\m\end{array}} \right) = \frac{ {n + 1}}{ {n + 1 - m}}\\]