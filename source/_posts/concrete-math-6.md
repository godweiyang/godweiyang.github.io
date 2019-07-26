---
title: 具体数学-第6课（下降阶乘幂）
date: 2018-04-02 11:35:17
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

<div align="middle"><iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=28680028&auto=1&height=66"></iframe></div>

上节课讲到下降阶乘幂和差分运算，这节课继续讲它和差分的各种性质。

# 性质1
---
首先在后面章节会证明，${(x + y)^{\underline{m}}}$的二项展开形式和普通的${(x + y)^m}$是一样的，这里提一下，暂时用不到。

# 性质2
---
接下来给出下降阶乘幂为负数的定义：
\\[{x^{ \underline{- m}}} = \frac{1}{ {(x + 1)(x + 2) \ldots (x + m)}}\\]

# 性质3
---
和普通幂${x^{m + n}} = {x^m}{x^n}$不同，下降阶乘幂有如下性质：
\\[{x^{\underline{m + n}}} = {x^{\underline{m}}}{(x - m)^{\underline{n}}}\\]

# 性质4
---
上一节课说到，定义下降阶乘幂的好处就是为了求差分方便，下降阶乘幂的差分为：
\\[\Delta ({x^{\underline{m}}}) = m{x^{\underline{ {m - 1}}}}\\]
反之，类比不定积分，它的不定和为：
\\[\sum\nolimits_a^b { {x^{\underline{m}}}\delta x}  = \left. {\frac{ { {x^{\underline{m + 1}}}}}{ {m + 1}}} \right|_a^b\\]

但是这里$m \ne  - 1$，那要是$m =  - 1$怎么办呢？
直接运用差分定义可以求出
\\[\begin{array}{l}{x^{ \underline{- 1}}} = \frac{1}{ {x + 1}} = \Delta f(x) = f(x + 1) - f(x)\\ \Rightarrow f(x) = {H_x}\end{array}\\]

所以
\\[\sum\nolimits_a^b { {x^{\underline{m}}}\delta x}  = \left\{ {\begin{array}{*{20}{c}}{\left. {\frac{ { {x^{\underline{m + 1}}}}}{ {m + 1}}} \right|_a^b,m \ne  - 1}\\{\left. { {H_x}} \right|_a^b,m =  - 1}\end{array}} \right.\\]


# 性质5
---
在微积分里面，$e^x$的导数是它自身。那么什么函数的差分是自身呢？
通过定义可以很容易算出来：
\\[\begin{array}{l}f(x + 1) - f(x) = f(x)\\ \Rightarrow f(x + 1) = 2f(x)\\ \Rightarrow f(x) = {2^x}\end{array}\\]

进一步推广可以得到：
\\[\Delta ({c^x}) = {c^{x + 1}} - {c^x} = (c - 1){c^x}\\]
所以得到如下一种新的等比数列计算方式：
\\[\sum\limits_{a \le k < b} { {c^k}}  = \sum\nolimits_a^b { {c^x}\delta x}  = \left. {\frac{ { {c^x}}}{ {c - 1}}} \right|_a^b = \frac{ { {c^b} - {c^a}}}{ {c - 1}}\\]

# 性质6
---
结合律和分配律在差分运算里也适用。
\\[\begin{array}{l}\Delta (cf) = c\Delta (f)\\\Delta (f + g) = \Delta (f) + \Delta (g)\end{array}\\]

# 性质7
---
类似分部积分，这里也可以分部来求差分。
\\[\begin{array}{l}\Delta (u(x)v(x)) = u(x + 1)v(x + 1) - u(x)v(x)\\ = u(x + 1)v(x + 1) - u(x)v(x + 1) + u(x)v(x + 1) - u(x)v(x)\\ = [u(x + 1) - u(x)]v(x + 1) + u(x)[v(x + 1) - v(x)]\\ = u(x)\Delta (v(x)) + v(x + 1)\Delta (u(x))\end{array}\\]
这里给出一个新的记号叫做移位运算：
\\[Ef(x) = f(x + 1)\\]
所以就得到了差分的分部运算法则：
\\[\Delta (uv) = u\Delta (v) + Ev\Delta (u)\\]
对两边求和，又可以得到不定求和的分部运算法则：
\\[\sum {u\Delta (v)}  = uv - \sum {Ev\Delta (u)} \\]

这个分部法则非常有用，下面举两个例子来说明一下怎么用。

## 例1
一道老题，计算：
\\[\sum\limits_{k = 0}^n {k{2^k}} \\]
首先计算
\\[\sum {x{2^x}\delta x} \\]
在这里可以令
\\[u = x,v = {2^x}\\]
所以
\\[\sum {x{2^x}\delta x}  = x{2^x} - \sum { {2^{x + 1}}\delta x}  = x{2^x} - {2^{x + 1}} + C\\]
那么求和式就可以转化为不定求和来算了：
\\[\begin{array}{l}\sum\limits_{k = 0}^n {k{2^k}}  = \sum\nolimits_0^{n + 1} {x{2^x}\delta x} \\ = \left. {x{2^x} - {2^{x + 1}}} \right|_0^{n + 1}\\ = (n - 1){2^{n + 1}} + 2\end{array}\\]

## 例2
计算
\\[\sum\limits_{0 \le k < n} {k{H_k}} \\]
首先计算
\\[\sum {x{H_x}\delta x} \\]
这里注意要令
\\[u = {H_x},\Delta v = x\\]
不能倒过来哦，因为$H_x$的不定和很难求出来的。所以
\\[\begin{array}{l}\sum {x{H_x}\delta x}  = \frac{ { {x^{\underline{2}}}}}{2}{H_x} - \sum {\frac{ { { {(x + 1)}^{\underline{2}}}}}{2}} {x^{ \underline{- 1}}}\delta x\\ = \frac{ { {x^{\underline{2}}}}}{2}{H_x} - \frac{1}{2}\sum { {x^{\underline{1}}}\delta x} \\ = \frac{ { {x^{\underline{2}}}}}{2}{H_x} - \frac{ { {x^{\underline{2}}}}}{4} + C\end{array}\\]

所以
\\[\sum\limits_{0 \le k < n} {k{H_k}}  = \sum\nolimits_0^n {x{H_x}\delta x}  = \frac{ { {n^{\underline{2}}}}}{2}({H_n} - \frac{1}{2})\\]

# 无限求和
---
回顾一下以前我们是怎么计算下面求和式的。
\\[S = {\rm{1}} + \frac{1}{2} + \frac{1}{4} +  \cdots \\]
首先两边同时乘2，得到：
\\[2S = 2 + {\rm{1}} + \frac{1}{2} + \frac{1}{4} +  \cdots  = 2 + S\\]
解出
\\[S = 2\\]

那么可不可以用同样的方法计算下面式子呢？
\\[T = 1 + 2 + 4 + 8 +  \cdots \\]
两边同时乘2，得到：
\\[2T = 2 + 4 + 8 +  \cdots  = T - 1\\]
解出
\\[T = -1\\]
显然不可能，因为这里的$T$是发散的，所以不能这么求。那么如何用一般的方法来求解呢？

首先我们只考虑正数求和，求解$\sum\limits_{k \in K} { {a_k}} $，其中$K$是一个无限集合。
那么，如果存在$A$，使得对任意$F \subset K$，都有
\\[\sum\limits_{k \in F} { {a_k}}  \le A\\]
那么我们说这个最小的$A$就是$\sum\limits_{k \in K} { {a_k}} $的结果。
如果不存在这么一个$A$，那么这个求和式就是发散的，即结果为正无穷。

一般使用中，对于$K = N$，我们可以令$F = \{ 0,1,2, \ldots ,n\} $
所以
\\[\sum\limits_{k \ge 0} { {a_k}}  = \mathop {\lim }\limits_{n \to \infty } \sum\limits_{k = 0}^n { {a_k}} \\]

举两个例子，比如
\\[\sum\limits_{k \ge 0} { {x^k}}  = \mathop {\lim }\limits_{n \to \infty } \frac{ {1 - {x^{n + 1}}}}{ {1 - x}} = \left\{ {\begin{array}{*{20}{c}}{\frac{1}{ {1 - x}},0 \le x < 1}\\{\infty ,x \ge 1}\end{array}} \right.\\]
再如：
\\[\sum\limits_{k \ge 0} {\frac{1}{ {(k + 1)(k + 2)}}}  = \sum\limits_{k \ge 0} { {k^{ \underline{- 2}}}}  = \mathop {\lim }\limits_{n \to \infty } \sum\limits_{k = 0}^n { {k^{ \underline{- 2}}}}  = \mathop {\lim }\limits_{n \to \infty } \left. {\frac{ { {k^{ \underline{- 1}}}}}{ { - 1}}} \right|_0^{n + 1} = 1\\]

剩下的问题就是如何求有正有负的和式？

可以考虑的方案就是用不同的配对，将正负组合在一起，从而相消求和。

但是不同的组合方式会得到不同的答案。就比如：
\\[\sum\limits_{k \ge 0} { { {( - 1)}^k}}  = 1 - 1 + 1 - 1 +  \cdots \\]
有两种组合方式：
\\[(1 - 1) + (1 - 1) +  \cdots  = 0\\]
和
\\[1 - (1 - 1) - (1 - 1) -  \cdots  = 1\\]
得到了两种不同的结果。

事实上，我们可以将正数和负数分开求和，因为正数求和我们已经解决了，所以我们定义：
\\[x = {x^ + } - {x^ - }\\]
其中
\\[{x^ + } = x \cdot [x > 0],{x^ - } =  - x \cdot [x < 0]\\]

所以求和式可以分成两部分分别求和：
\\[\sum\limits_{k \in K} { {a_k}}  = \sum\limits_{k \in K} { {a_k}^ + }  - \sum\limits_{k \in K} { {a_k}^ - } \\]

最后推广到二重求和：
\\[\sum\limits_{j \in J,k \in {K_j}} { {a_{j,k}}}  = \sum\limits_{j \in J} {\sum\limits_{k \in {K_j}} { {a_{j,k}}} }  = \sum\limits_{j \in J} { {A_j}}  = A\\]

这里也没啥好细说的，就先了解了解吧。