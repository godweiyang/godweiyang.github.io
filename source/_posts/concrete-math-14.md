---
title: 具体数学-第14课（牛顿级数和生成函数）
date: 2018-05-28 13:43:43
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

<div align="middle"><iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=26492802&auto=1&height=66"></iframe></div>

# 牛顿级数
---
多项式函数的一般表示形式为：
\\[f(x) = {a_d}{x^d} + {a_{d - 1}}{x^{d - 1}} +  \cdots  + {a_1}{x^1} + {a_0}{x^0}\\]
也可以将其表示为下降阶乘幂的形式：
\\[f(x) = {b_d}{x^\underline{d}} + {b_{d - 1}}{x^{\underline{d - 1}}} +  \cdots  + {b_1}{x^\underline{1}} + {b_0}{x^\underline{0}}\\]
这种表示的好处是，求差分更加方便：
\\[\Delta (f(x)) = {b_d}d{x^{\underline{d - 1}}} + {b_{d - 1}}(d - 1){x^{\underline {d - 2} }} +  \cdots  + {b_1}{x^\underline{0}}\\]
因为有
\\[\left( {\begin{array}{\*{20}{c}}x\\k\end{array}} \right) = \frac{ { {x^\underline{k}}}}{ {k!}}\\]
所以多项式又可以表示为组合数的形式，也被叫做牛顿级数：
\\[f(x) = {c_d}\left( {\begin{array}{\*{20}{c}}x\\d\end{array}} \right) + {c_{d - 1}}\left( {\begin{array}{\*{20}{c}}x\\{d - 1}\end{array}} \right) +  \cdots  + {c_1}\left( {\begin{array}{\*{20}{c}}x\\1\end{array}} \right) + {c_0}\left( {\begin{array}{\*{20}{c}}x\\0\end{array}} \right)\\]
这种形式的差分也特别简单，因为有
\\[\Delta \left( {\left( {\begin{array}{\*{20}{c}}x\\k\end{array}} \right)} \right) = \left( {\begin{array}{\*{20}{c}}x\\{k - 1}\end{array}} \right)\\]
所以$n$阶差分可以写为：
\\[{\Delta ^n}(f(x)) = {c_d}\left( {\begin{array}{\*{20}{c}}x\\{d - n}\end{array}} \right) + {c_{d - 1}}\left( {\begin{array}{\*{20}{c}}x\\{d - 1 - n}\end{array}} \right) +  \cdots  + {c_1}\left( {\begin{array}{\*{20}{c}}x\\{1 - n}\end{array}} \right) + {c_0}\left( {\begin{array}{\*{20}{c}}x\\{ - n}\end{array}} \right)\\]
所以有：
\\[{\Delta ^n}(f(0)) = \left\{ {\begin{array}{\*{20}{c}}{ {c_n},n \le d}\\{0,n > d}\end{array}} \right.\\]
所以牛顿级数又可以写为：
\\[f(x) = {\Delta ^d}(f(0))\left( {\begin{array}{\*{20}{c}}x\\d\end{array}} \right) + {\Delta ^{d - 1}}(f(0))\left( {\begin{array}{\*{20}{c}}x\\{d - 1}\end{array}} \right) +  \cdots  + \Delta (f(0))\left( {\begin{array}{\*{20}{c}}x\\1\end{array}} \right) + f(0){c_0}\left( {\begin{array}{\*{20}{c}}x\\0\end{array}} \right)\\]
这个形式是不是很像泰勒展开？

# 生成函数
---
对于无限序列$\left\langle { {a_0},{a_1},{a_2}, \ldots } \right\rangle $，定义它的生成函数为：
\\[A(z) = {a_0} + {a_1}z + {a_2}{z^2} +  \cdots  = \sum\limits_{k \ge 0} { {a_k}{z^k}} \\]
定义一个函数用来表示$z^n$的系数：
\\[[{z^n}]A(z) = {a_n}\\]
两个生成函数相乘的结果为：
\\[A(z)B(z) = \sum\limits_{k \ge 0} {\sum\limits_{i = 0}^k { {a_i}{b_{k - i}}} {z^k}} \\]
考虑下面的二项展开：
\\[{(1 + z)^r} = \sum\limits_{k \ge 0} {\left( {\begin{array}{\*{20}{c}}r\\k\end{array}} \right){z^k}} \\]
可以发现这就是序列$\left\langle {\left( {\begin{array}{\*{20}{c}}r\\0\end{array}} \right),\left( {\begin{array}{\*{20}{c}}r\\1\end{array}} \right),\left( {\begin{array}{\*{20}{c}}r\\2\end{array}} \right), \ldots } \right\rangle $的生成函数。
替换变量可以得到：
\\[{(1 + z)^s} = \sum\limits_{k \ge 0} {\left( {\begin{array}{\*{20}{c}}s\\k\end{array}} \right){z^k}} \\]
两个式子相乘可以得到：
\\[{(1 + z)^r}{(1 + z)^s} = {(1 + z)^{r + s}}\\]
等式两边$z^n$的系数相等，于是：
\\[\sum\limits_{k = 0}^n {\left( {\begin{array}{\*{20}{c}}r\\k\end{array}} \right)\left( {\begin{array}{\*{20}{c}}s\\{n - k}\end{array}} \right)}  = \left( {\begin{array}{\*{20}{c}}{r + s}\\n\end{array}} \right)\\]
这和上节课讲到的范德蒙德卷积公式类似！这里是用生成函数证出来的。

同理根据
\\[{(1 + z)^r}{(1 - z)^r} = {(1 - {z^2})^r}\\]
可以得到
\\[\sum\limits_{k = 0}^n {\left( {\begin{array}{\*{20}{c}}r\\k\end{array}} \right)\left( {\begin{array}{\*{20}{c}}r\\{n - k}\end{array}} \right)} {( - 1)^k} = {( - 1)^{n/2}}\left( {\begin{array}{\*{20}{c}}r\\{n/2}\end{array}} \right)[n是偶数]\\]
下面是一个重要的生成函数：
\\[\frac{1}{ {1 - z}} = 1 + z + {z^2} + {z^3} +  \cdots  = \sum\limits_{k \ge 0} { {z^k}} \\]
它其实就是序列$\left\langle { {1},{1},{1}, \ldots } \right\rangle $的生成函数。

# 生成函数应用
---
那么生成函数有什么应用呢？一个很重要的应用就是用来求解递归式。

例如大家很熟悉的斐波那契数列：
\\[\begin{array}{l}{g_0} = 0;{g_1} = 1\\{g_n} = {g_{n - 1}} + {g_{n - 2}},n \ge 2\end{array}\\]

首先为了统一表示，将递归式改写为如下形式：
\\[{g_n} = {g_{n - 1}} + {g_{n - 2}} + [n = 1]\\]
然后两边同时乘以$z^n$，得到：
\\[{g_n}{z^n} = {g_{n - 1}}{z^n} + {g_{n - 2}}{z^n} + [n = 1]{z^n}\\]
两边对指标$n$同时求和，可以得到：
\\[G(z) = zG(z) + {z^2}G(z) + z\\]
所以
\\[G(z) = \frac{z}{ {1 - z - {z^2}}}\\]
最后只要将$\frac{z}{ {1 - z - {z^2}}}$表示成多项式的形式就行了，$[{z^n}]\frac{z}{ {1 - z - {z^2}}}$就是斐波那契数列的通项公式了。