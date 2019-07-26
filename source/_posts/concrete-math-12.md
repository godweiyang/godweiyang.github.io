---
title: 具体数学-第12课（数论进阶与组合数入门）
date: 2018-05-14 15:41:51
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

<div align="middle"><iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=554191378&auto=1&height=66"></iframe></div>

> 这节课内容太多了，再加上感冒身体不舒服，下面的定理就不一一证明了，大家可以自行练习。以后有空我会补上的！

# 例题1
---
首先接着上节课同余继续讲，在[第三章例题2](http://godweiyang.com/2018/04/23/concrete-math-9/)中，我们遗留了一个问题：对于如下序列
\\[0\bmod m,n\bmod m,2n\bmod m, \ldots ,(m - 1)n\bmod m\\]
它的值就是
\\[0,d,2d, \ldots ,(m/d - 1)d\\]
的某个排列，并且重复了$d$次。其中$d = gcd(m, n)$

首先我们有如下同余式：
\\[jn \equiv kn(\bmod m) \Leftrightarrow j(n/d) \equiv k(n/d)(\bmod m/d)\\]
这就可以看出该序列的确是重复出现了$d$次，那么剩下的问题就是证明这$m/d$个数恰好就是
\\[\{ 0,d,2d, \ldots ,m - d\} \\]
的某个排列。
令$m = m'd,n = n'd$，所以有
\\[kn\bmod m = d(kn'\bmod m')\\]
所以我们只考虑$m \bot n$的情形，在此情形下，我们可以得到
\\[jn \equiv kn(\bmod m) \Leftrightarrow j \equiv k(\bmod m)\\]
由此可以看出，这$m-1$个数一定就是
\\[\{ 0,1,2, \ldots ,m - 1\} \\]
至此得证。

下面介绍几个著名的数论定理。

# 费马最后定理
---
对于所有的正整数$a,b,c,n>2$，有
\\[{a^n} + {b^n} \ne {c^n}\\]

# 费马小定理
---
如果$n \bot p$，那么有
\\[{n^{p - 1}} \equiv 1(\bmod p)\\]

证明也很好证。

之前证过了，序列
\\[n\bmod p,2n\bmod p, \ldots ,(p - 1)n\bmod p\\]
结果就是
\\[1,2, \ldots ,p-1\\]
的某个排列，所以有
\\[n \cdot (2n) \cdot  \ldots  \cdot ((p - 1)n) \equiv (p - 1)!\\]
所以
\\[(p - 1)!{n^{p - 1}} \equiv (p - 1)!(\bmod p)\\]
所以
\\[{n^{p - 1}} \equiv 1(\bmod p)\\]

# 欧拉函数
---
定义$\varphi (m)$为小于$m$且与其互素的正整数个数。

所以我们有欧拉定理
\\[{n^{\varphi (m)}} \equiv 1(\bmod m)\\]
其中$n \bot m$，可以发现，当$m$是素数时，欧拉定理就是费马小定理，所以欧拉定理是费马小定理的推广形式。

欧拉定理有很多有趣的性质，这里就不一一介绍了，详情见[博客地址](https://blog.csdn.net/howe_young/article/details/50282775)。

# 莫比乌斯函数
---
定义莫比乌斯函数$\mu (m)$为
\\[\sum\limits_{d|m} {\mu (d)}  = [m = 1]\\]

这个定义看起来很奇怪是不是？其实这是一个递归定义，可以递归地计算得到所有的值。

这个函数有什么用呢？主要用来进行莫比乌斯反演：
\\[g(m) = \sum\limits_{d|m} {f(d)}  \Leftrightarrow f(m) = \sum\limits_{d|m} {\mu (d)g(\frac{m}{d})} \\]

详细的性质及应用也不介绍了，给大家推荐一个牛逼的博客[博客地址](https://blog.csdn.net/acdreamers/article/details/8542292)，我当时学ACM的时候这部分都是看着他的学的。

# 组合数入门
---
定义组合数$\left( {\begin{array}{c}n\\k\end{array}} \right)$为从$n$个物品中取出$k$个物品的方法数，具体计算为
\\[\left( {\begin{array}{c}n\\k\end{array}} \right) = \frac{ {n(n - 1) \ldots (n - k + 1)}}{ {k(k - 1) \ldots 1}}\\]

推广到实数领域，定义
\\[\left( {\begin{array}{c}r\\k\end{array}} \right) = \left\{ {\begin{array}{c}{\frac{ {r(r - 1) \ldots (r - k + 1)}}{ {k(k - 1) \ldots 1}} = \frac{ { {r^{\underline{k}}}}}{ {k!}},k \ge 0}\\{0,k < 0}\end{array}} \right.\\]

下面介绍一些组合数性质。
## 性质1
\\[\left( {\begin{array}{c}n\\k\end{array}} \right) = \left( {\begin{array}{c}n\\{n - k}\end{array}} \right),n,k \in \mathbb{Z},n \ge 0\\]
这里为什么要限定$n \ge 0$呢？举个例子，如果$n = -1$，那么有
\\[\left( {\begin{array}{c}{ - 1}\\k\end{array}} \right) \ne \left( {\begin{array}{c}{ - 1}\\{ - 1 - k}\end{array}} \right)\\]
因为左边等于${( - 1)^k}$，而右边等于${( - 1)^{-1-k}}$。

## 性质2
\\[\left( {\begin{array}{c}r\\k\end{array}} \right) = \frac{r}{k}\left( {\begin{array}{c}{r - 1}\\{k - 1}\end{array}} \right)\\]

## 性质3
\\[(r - k)\left( {\begin{array}{c}r\\k\end{array}} \right) = r\left( {\begin{array}{c}{r - 1}\\k\end{array}} \right)\\]

## 性质4
\\[\left( {\begin{array}{c}r\\k\end{array}} \right) = \left( {\begin{array}{c}{r - 1}\\k\end{array}} \right) + \left( {\begin{array}{c}{r - 1}\\{k - 1}\end{array}} \right)\\]
这条性质可以通过性质3和性质4两边分别相加得到。

## 性质5
\\[\sum\limits_{k \le n} {\left( {\begin{array}{c}{r + k}\\k\end{array}} \right)}  = \left( {\begin{array}{c}{r + n + 1}\\n\end{array}} \right)\\]

## 性质6
\\[\sum\limits_{0 \le k \le n} {\left( {\begin{array}{c}k\\m\end{array}} \right)}  = \left( {\begin{array}{c}{n + 1}\\{m + 1}\end{array}} \right)\\]

## 性质7
微分形式：
\\[\Delta \left( {\left( {\begin{array}{c}x\\m\end{array}} \right)} \right) = \left( {\begin{array}{c}{x + 1}\\m\end{array}} \right) - \left( {\begin{array}{c}x\\m\end{array}} \right) = \left( {\begin{array}{c}x\\{m - 1}\end{array}} \right)\\]
\\[\sum {\left( {\begin{array}{c}x\\m\end{array}} \right)\delta x = } \left( {\begin{array}{c}x\\{m + 1}\end{array}} \right) + C\\]

# 二项式系数
---
\\[{(x + y)^r} = \sum\limits_k {\left( {\begin{array}{c}r\\k\end{array}} \right)} {x^k}{y^{r - k}},r \in \mathbb{Z}\\]

二项式系数也有很多有趣的性质。

\\[{2^n} = \left( {\begin{array}{c}n\\0\end{array}} \right) + \left( {\begin{array}{c}n\\1\end{array}} \right) +  \cdots  + \left( {\begin{array}{c}n\\n\end{array}} \right)\\]

\\[{0^n} = \left( {\begin{array}{c}n\\0\end{array}} \right) - \left( {\begin{array}{c}n\\1\end{array}} \right) +  \cdots  + {( - 1)^n}\left( {\begin{array}{c}n\\n\end{array}} \right)\\]
即奇数项系数和等于偶数项系数和。

推广到实数域：
\\[{(1 + z)^r} = \sum\limits_k {\left( {\begin{array}{c}r\\k\end{array}} \right){z^k}} ,\left| z \right| < 1,r \in \mathbb{R}\\]
可以通过泰勒展开证明。

