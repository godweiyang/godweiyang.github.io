---
title: 具体数学-第5课（8种方法求和）
date: 2018-03-26 11:44:26
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

<div align="middle"><iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=4875084&auto=1&height=66"></iframe></div>

今天继续讲求和的方法。
针对以下求和式，我们用8种方法来求解：
\\[{S_n} = \sum\limits_{0 \le k \le n} { {k^2}} \\]
大家应该都已经背上了它的答案：
\\[{S_n} = \frac{ {n(n + 1)(2n + 1)}}{6}\\]

# 方法0
---
**查表。**
这就不用说了，很多文献都有现成的解，拿来直接用就行了。
再给大家推荐一个整数序列查询网站OEIS：[链接](http://oeis.org/)

# 方法1
---
**猜答案，然后用数学归纳法证明。**
这个也不多说了，前提是你得猜得出来，这题的公式还是很难猜的。

# 方法2
---
**扰动法。**
令
\\[T = \sum\limits_{0 \le k \le n} { {k^3}} \\]
所以
\\[\begin{array}{l}T + {(n + 1)^3}\\ = \sum\limits_{1 \le k \le n + 1} { {k^3}} \\ = \sum\limits_{1 \le k \le n + 1} { { {(k - 1)}^3}}  + \sum\limits_{1 \le k \le n + 1} {(3{k^2} - 3k + 1)} \\ = \sum\limits_{0 \le k \le n} { {k^3}}  + \sum\limits_{1 \le k \le n + 1} {[3{ {(k - 1)}^2} + 3k - 2]} \\ = T + 3{S_n} + \frac{ {3(n + 2)(n + 1)}}{2} - 2(n + 1)\end{array}\\]
解出
\\[3{S_n} = {(n + 1)^3} - \frac{ {3(n + 2)(n + 1)}}{2} + 2(n + 1) = n(n + \frac{1}{2})(n + 1)\\]
最终得到
\\[{S_n} = \frac{ {n(n + 1)(2n + 1)}}{6}\\]

可以看出，我们本来是要对$k^2$求和的，但是只要对$k^3$用扰动法求和即可，因为求和过程中$k^3$项会被抵消掉。

# 方法3
---
**成套方法。**
定义如下递归式：
\\[\begin{array}{l}{R_0} = \alpha \\{R_n} = {R_{n - 1}} + \beta  + \gamma n + \delta {n^2}\end{array}\\]
由[第2课](http://godweiyang.com/2018/03/05/concrete-math-2/)可知，设解的形式为：
\\[{R_n} = A(n)\alpha  + B(n)\beta  + C(n)\gamma  + D(n)\delta \\]
分别令${R_n} = 1,n,{n^2}$可以解出
\\[A(n) = 1,B(n) = n,C(n) = \frac{ {n(n + 1)}}{2}\\]
再另${R_n} = {n^3}$，可以得到
\\[3D(n) = {n^3} + 3C(n) - B(n) = n(n + \frac{1}{2})(n + 1)\\]
即
\\[D(n) = \frac{ {n(n + 1)(2n + 1)}}{6}\\]

这时如果令
\\[\alpha  = \beta  = \gamma  = 0,\delta  = 1\\]
那么
\\[{R_n} = \sum\limits_{0 \le k \le n} { {k^2}}  = D(n) = \frac{ {n(n + 1)(2n + 1)}}{6}\\]

# 方法4
---
**积分法**
求和式可以近似成积分\\[\int_0^n { {x^2}dx}  = {n^3}/3\\]
但是还少算了一部分误差，设为$E_n$，则有
\\[{E_n} = {S_n} - \frac{1}{3}{n^3} = {S_{n - 1}} + {n^2} - \frac{1}{3}{n^3} = {E_{n - 1}} + n - \frac{1}{3}\\]
解得
\\[{E_n} = \frac{ {3{n^2} + n}}{6}\\]
所以
\\[{S_n} = {E_n} + \frac{1}{3}{n^3} = \frac{ {n(n + 1)(2n + 1)}}{6}\\]

其实这种方法就是把最高次直接给算出来了，低次项可以直接求和的。

# 方法5
---
**扩展成二重指标求和**
\\[\begin{array}{l}{S_n} = \sum\limits_{1 \le k \le n} { {k^2}}  = \sum\limits_{1 \le j \le k \le n} { {k^2}} \\ = \sum\limits_{1 \le j \le n} {\sum\limits_{j \le k \le n} k } \\ = \sum\limits_{1 \le j \le n} {(\frac{ {j + n}}{2})(n - j + 1)} \\ = \frac{1}{2}\sum\limits_{1 \le j \le n} {(n(n + 1) + j - {j^2})} \\ = \frac{1}{2}{n^2}(n + 1) + \frac{1}{4}n(n + 1) - \frac{1}{2}{S_n}\\ = \frac{1}{2}n(n + \frac{1}{2})(n + 1) - \frac{1}{2}{S_n}\end{array}\\]
所以
\\[{S_n} = \frac{ {n(n + 1)(2n + 1)}}{6}\\]

# 方法6
---
**用有限微分求和**
微分的形式大家都知道，如下：
\\[\Delta f(x) = f(x + 1) - f(x)\\]
那如果我们定义
\\[f(x) = {x^m}\\]
则有
\\[\Delta f(x) = {(x + 1)^m} - {x^m}\\]
似乎并不能和导数形式统一起来，用起来也不方便，那么我们定义一个新的函数，叫做**下降阶乘幂**：
\\[f(x) = {x^{\underline{m}}} = x(x - 1) \ldots (x - m + 1)\\]
同理还可以定义**上升阶乘幂**。
这个函数有一个很好的性质，那就是
\\[\Delta ({x^{\underline{m}}}) = m{x^{\underline{ {m - 1}}}}\\]
令
\\[g(x) = \Delta f(x)\\]
那么和积分类似，有
\\[\sum\nolimits_a^b {g(x)\delta x}  = f(b) - f(a)\\]
所以
\\[\sum\limits_{0 \le k < n} { {k^{\underline{m}}}}  = \left. {\frac{ { {k^{ {\underline{m + 1}}}}}}{ {m + 1}}} \right|_0^n = \frac{ { {n^{ {\underline{m + 1}}}}}}{ {m + 1}}\\]

因为有
\\[{k^2} = {k^{\underline{2}}} + {k^{\underline{1}}}\\]
所以
\\[\sum\limits_{0 \le k < n} { {k^2}}  = \frac{ { {n^{\underline{3}}}}}{3} + \frac{ { {n^{\underline{2}}}}}{2} = \frac{ {n(n - 1)(2n - 1)}}{6}\\]
同样可以得到
\\[{S_n} = \frac{ {n(n + 1)(2n + 1)}}{6}\\]

下降阶乘幂还有很多好用的性质，下节课继续。

# 方法7
---
**生成函数。**
以后章节会讲。