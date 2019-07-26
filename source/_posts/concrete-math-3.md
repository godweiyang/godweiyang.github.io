---
title: 具体数学-第3课（递归式转化为求和求解）
date: 2018-03-12 15:01:44
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

<div align="middle"><iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=539941039&auto=1&height=66"></iframe></div>

今天讲了一种将递归式转化为求和的方法。

考虑如下递归式：
\\[{a_n}{T_n} = {b_n}{T_{n - 1}} + {c_n}\\]
两边同时乘以$s_n$得到：
\\[{s_n}{a_n}{T_n} = {s_n}{b_n}{T_{n - 1}} + {s_n}{c_n}\\]
要想转化成可以求和的递归式，那么必须有：
\\[{s_n}{b_n} = {s_{n - 1}}{a_{n - 1}}\\]
也就是：
\\[{s_n} = \frac { { {a_{n - 1}}{a_{n - 2}} \cdots {a_1}}}{ { {b_n}{b_{n - 1}} \cdots {b_2}}}\\]
这时令
\\[{S_n} = {s_n}{a_n}{T_n}\\]
得到：
\\[{S_n} = {S_{n - 1}} + {s_n}{c_n}\\]
这时就可以转化为求和了，解出：
\\[{S_n} = {s_0}{a_0}{T_0} + \sum\limits_{k = 1}^n { {s_k}{c_k}} \\]
所以
\\[{T_n} = \frac{1}{ { {s_n}{a_n}}}({s_0}{a_0}{T_0} + \sum\limits_{k = 1}^n { {s_k}{c_k}} )\\]

# 例题1
---
设$n$个数快速排序的操作次数为$C_n$，那么有
\\[\begin{array}{l}{C_0} = 0\\{C_n} = n + 1 + \frac{2}{n}\sum\limits_{k = 0}^{n - 1} { {C_k}} ,n > 0\end{array}\\]
用$n-1$取代$n$可以得到
\\[{C_{n - 1}} = n + \frac{2}{ {n - 1}}\sum\limits_{k = 0}^{n - 2} { {C_k}} ,n > 1\\]
两式相减可以得到
\\[\begin{array}{l}{C_0} = 0\\n{C_n} = (n + 1){C_{n - 1}} + 2n,n > 0\end{array}\\]
由上面方法可以得到
\\[{a_n} = n,{b_n} = n + 1,{c_n} = 2n\\]
所以
\\[{s_n} = \frac{2}{ {n(n + 1)}}\\]
进而可以求出
\\[{C_n} = 2(n + 1)\sum\limits_{k = 1}^n {\frac{1}{ {k + 1}}} \\]
这里介绍一个概念叫做调和级数：
\\[{H_n} = 1 + \frac{1}{2} +  \cdots  + \frac{1}{n} = \sum\limits_{k = 1}^n {\frac{1}{k}} \\]
所以
\\[{C_n} = 2(n + 1){H_n} - 2n\\]

# 求和三大定律
---
结合律、分配率、交换律。这里就不展开说了，相信你们都知道的。
来两题简单的例题说明一下。

# 例题2
---
求
\\[S = \sum\limits_{0 \le k \le n} {(a + bk)} \\]
普通的方法每个人应该都会，等差数列嘛。这里用求和定律来做一做。
用$n-k$取代$k$，得到
\\[S = \sum\limits_{0 \le n - k \le n} {(a + b(n - k))} \\]
即
\\[S = \sum\limits_{0 \le k \le n} {(a + b(n - k))} \\]
两式相加得到
\\[2S = \sum\limits_{0 \le k \le n} {(2a + bn)}  = (2a + bn)\sum\limits_{0 \le k \le n} 1  = (2a + bn)(n + 1)\\]
所以
\\[S = (2a + bn)(n + 1)/2\\]

# 例题3
---
求
\\[S = \sum\limits_{0 \le k \le n} {k{x^k}} \\]
这里用到另一种求和的方法。
两边同时加上第$n+1$项，得到
\\[\begin{array}{l}S + (n + 1){x^{n + 1}}\\ = \sum\limits_{0 \le k \le n + 1} {k{x^k}} \\ = \sum\limits_{1 \le k \le n + 1} {k{x^k}} \\ = \sum\limits_{0 \le k \le n} {(k + 1){x^{k + 1}}} \\ = x\sum\limits_{0 \le k \le n} {(k{x^k} + {x^k})} \\ = xS + x\sum\limits_{0 \le k \le n} { {x^k}} \\ = xS + x\frac{ {1 - {x^{n + 1}}}}{ {1 - x}}\end{array}\\]
所以
\\[S = \frac{ {x - (n + 1){x^{n + 1}} + n{x^{n + 2}}}}{ { { {(1 - x)}^2}}}\\]
这里介绍另一种方法来求解。
令
\\[f(x) = \sum\limits_{0 \le k \le n} { {x^k}}  = \frac{ {1 - {x^{n + 1}}}}{ {1 - x}}\\]
求导得到
\\[f'(x) = \sum\limits_{0 \le k \le n} {k{x^{k - 1}}}  = \frac{1}{x}S\\]
所以
\\[\frac{1}{x}S = \frac{ {\partial f}}{ {\partial x}}(\frac{ {1 - {x^{n + 1}}}}{ {1 - x}}) = \frac{ {1 - (n + 1){x^n} + n{x^{n + 1}}}}{ { { {(1 - x)}^2}}}\\]
同样可以得到
\\[S = \frac{ {x - (n + 1){x^{n + 1}} + n{x^{n + 2}}}}{ { { {(1 - x)}^2}}}\\]