---
title: 具体数学-第2课（成套方法求解递归式）
date: 2018-03-05 13:06:28
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

<div align="middle"><iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=316275&auto=1&height=66"></iframe></div>

今天主要讲了关于递推式和求和的一些方法，主要是成套方法。

# 约瑟夫环推广
上一节课说到，约瑟夫环问题的解是
\\[f(n) = 2l + 1\\]
其中$n = {2^m} + l$
将$n$写成二进制可以发现，$f(n)$就是$n$的二进制循环左移1位。
现在做一下推广，求解如下递推式：
\\[\begin{array}{l}f(1) = \alpha \\f(2n) = 2f(n) + \beta \\f(2n + 1) = 2f(n) + \gamma \end{array}\\]
可以设
\\[f(n) = A(n)\alpha  + B(n)\beta  + C(n)\gamma \\]
同样，令$n = {2^m} + l$
可以解出
\\[\begin{array}{l}A(n) = {2^m}\\B(n) = {2^m} - 1 - l\\C(n) = l\end{array}\\]
再从二进制角度理解一下，将递推式继续推广：
\\[\begin{array}{l}f(j) = {\alpha _j},1 \le j < d\\f(dn + j) = cf(n) + {\beta _j},0 \le j \le d,n \ge 1\end{array}\\]
可以得到解为
\\[f({({b_m}{b_{m - 1}} \ldots {b_1}{b_0})_d}) = {({\alpha _{ {b_m}}}{\beta _{ {b_{m - 1}}}}{\beta _{ {b_{m - 2}}}} \ldots {\beta _{ {b_1}}}{\beta _{ {b_0}}})_c}\\]

# 递推式求和
求解如下递推式：
\\[\begin{array}{l}{R_0} = \alpha \\{R_n} = {R_{n - 1}} + \beta n + \gamma \end{array}\\]
用成套方法求解，设
\\[{R_n} = A(n)\alpha  + B(n)\beta  + C(n)\gamma \\]
首先令${R_n} = 1$，可以得到$\alpha  = 1,\beta  = 0,\gamma  = 0$，所以$A(n) = 1$。
再令${R_n} = n$，可以得到$\alpha  = 0,\beta  = 0,\gamma  = 1$，所以$C(n) = n$。
最后令${R_n} = {n^2}$，可以得到$\alpha  = 0,\beta  = 2,\gamma  =  - 1$，所以$2B(n) - C(n) = {n^2}$，所以$B(n) = ({n^2} + n)/2$

再来一个更复杂的递推式：
\\[\begin{array}{l}{R_0} = \alpha \\{R_n} = 2{R_{n - 1}} + \beta n + \gamma \end{array}\\]
同样的方法，设
\\[{R_n} = A(n)\alpha  + B(n)\beta  + C(n)\gamma \\]
首先令${R_n} = 1$，可以得到$\alpha  = 1,\beta  = 0,\gamma  = -1$，所以$A(n) - C(n) = 1$。
再令${R_n} = n$，可以得到$\alpha  = 0,\beta  = -1,\gamma  = 2$，所以$2C(n) - B(n) = n$。
这时候能不能令${R_n} = {n^2}$呢？答案是不能，因为如果${R_n} = {n^2}$，那么
\\[{n^2} = 2{(n - 1)^2} + \beta n + \gamma \\]显然不可能成立。
观察系数，可以令${R_n} = 2^n$，可以得到$\alpha  = 1,\beta  = 0,\gamma  = 0$，所以$A(n) = 2^n$。
所以
\\[A(n) = {2^n},B(n) = {2^{n + 1}} - n + 2,C(n) = {2^n} + 1\\]
