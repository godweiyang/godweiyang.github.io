---
title: 具体数学-第11课（Stern-Brocot树和同余关系）
date: 2018-05-07 15:48:55
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

<div align="middle"><iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=543607345&auto=1&height=66"></iframe></div>

# Stern-Brocot树
---
我们接着上节课讲到的Stern-Brocot树继续往下讲。

## LR序列表示
对于任意分数$\frac{a}{b}$，我们从$\frac{1}{1}$开始走到它所在的结点。如果向左走就记为L，向右走记为R，最终可以得到一个L和R的序列。例如$\frac{5}{7}$的表示就是LRRL。

这种表示产生了两个问题：
1. 给定满足正整数$m$和$n$互素的分数$\frac{m}{n}$，它所对应的LR序列是什么？
2. 给定LR序列，它所表示的分数是什么？

第二个问题看起来更好解决一点，我们先解决第二个问题。
我们定义
\\[f(S) = 与S对应的分数\\]
例如
\\[f(LRRL) = \frac{5}{7}\\]
如果用代码实现的话，对于每个L或者R，如果是L，那么就把右边界设为中间值，如果是R，那么就把左边界设为中间值。

但是如何用数学式子来表达这一过程呢？

我们建立一个2阶方阵：
\\[M(S) = \left( {\begin{array}{*{20}{c}}n&{n'}\\m&{m'}\end{array}} \right)\\]
表示$f(S)$的两个祖先分数$\frac{m}{n}$和$\frac{m'}{n'}$

那么初始状态就可以表示为
\\[M(I) = \left( {\begin{array}{*{20}{c}}1&0\\0&1\end{array}} \right)\\]

如果遇到了向左符号L，那么

\\[M(SL) = \left( {\begin{array}{}n&{n + n'}\\m&{m + m'}\end{array}} \right) = M(S)\left( {\begin{array}{}1&1\\0&1\end{array}} \right)\\]

如果遇到了向右符号R，那么
\\[M(SL) = \left( {\begin{array}{}{n + n'}&{n'}\\{m + m'}&{m'}\end{array}} \right) = M(S)\left( {\begin{array}{}1&0\\1&1\end{array}} \right)\\]
所以我们将L和R定义成2阶方阵就行了：
\\[L = \left( {\begin{array}{}1&1\\0&1\end{array}} \right),R = \left( {\begin{array}{}1&0\\1&1\end{array}} \right)\\]
所以
\\[\begin{array}{l}M(LRRL) = LRRL\\ = \left( {\begin{array}{}1&1\\0&1\end{array}} \right)\left( {\begin{array}{}1&0\\1&1\end{array}} \right)\left( {\begin{array}{}1&0\\1&1\end{array}} \right)\left( {\begin{array}{}1&1\\0&1\end{array}} \right)\\ = \left( {\begin{array}{}3&4\\2&3\end{array}} \right)\end{array}\\]
所以LRRL表示的分数为
\\[\frac{ {2 + 3}}{ {3 + 4}} = \frac{5}{7}\\]
那么第一个问题如何解决呢？
同样可以用类似二叉搜索的方法来求出LR序列，也可以用矩阵的方法来求解，根据上面的L和R的方阵，可以发现：
\\[f(RS) = f(S) + 1\\]
对于L也有类似的性质，所以我们得到了如下的求解算法：
* 如果$m > n$，输出R，令$m = m - n$。
* 如果$m < n$，输出L，令$n = n - m$。

## 无理数近似表示
虽然说无理数不在Stern-Brocot树中，但是我们可以找到无限逼近它的分数。

方法仍然使用二叉搜索，不同的是，搜索过程不会终止，除非得到了我们想要的精度或者我们人为终止。

值得一提的是，无理数$e$的LR表示很有规律性：
\\[e = R{L^0}RL{R^2}LR{L^4}RL{R^6}LR{L^8}RL{R^{10}}LR{L^{12}} \cdots \\]

最后值得一提的是，欧几里得算法和有理数的Stern-Brocot树表示有密切的关系。给定$\alpha  = \frac{m}{n}$，根据之前的算法，它的LR表达式首先是$\left\lfloor {m/n} \right\rfloor $个R，然后是$\left\lfloor {n/(m\bmod n)} \right\rfloor $个L，依次下去，这些系数恰好就是求最大公因数的时候用到的系数。

# 同余关系
---
同余定义为：
\\[a \equiv b(\bmod m) \Leftrightarrow a\bmod m = b\bmod m\\]
读作“a关于模m与b同余”，我们只讨论都是整数的情况。

同样可以写作：
\\[a \equiv b(\bmod m) \Leftrightarrow a - b是m的倍数\\]

同余是等价关系，满足自反律、对称律、传递律，即：
\\[\begin{array}{l}a \equiv a\\a \equiv b \Rightarrow b \equiv a\\a \equiv b \equiv c \Rightarrow a \equiv c\end{array}\\]
如果我们对同余两边的元素加减乘，同余仍然满足：
\\[\begin{array}{l}a \equiv b,c \equiv d \Rightarrow a + c \equiv b + d(\bmod m)\\a \equiv b,c \equiv d \Rightarrow a - c \equiv b - d(\bmod m)\\a \equiv b,c \equiv d \Rightarrow ac \equiv bd(\bmod m)\end{array}\\]
因此可以得到
\\[a \equiv b \Rightarrow {a^n} \equiv {b^n}(\bmod m)\\]

然而对于除法同余并不总是成立，一些特殊条件下可能成立。
如果
\\[ad \equiv bd(\bmod m)\\]
当$d,m$互素的时候，我们可以得到
\\[a \equiv b(\bmod m)\\]
同样
\\[ad \equiv bd(\bmod md) \Leftrightarrow a \equiv b(\bmod m)\\]
更一般的情况下，我们有
\\[ad \equiv bd(\bmod m) \Leftrightarrow a \equiv b(\bmod \frac{m}{ {\gcd (d,m)}})\\]
还有许多性质我就直接列举了，不做证明了，证明很简单：
\\[\begin{array}{l}a \equiv b(\bmod md) \Rightarrow a \equiv b(\bmod m)\\a \equiv b(\bmod m),a \equiv b(\bmod n) \Leftrightarrow a \equiv b(\bmod lcm(m,n))\\a \equiv b(\bmod mn),m \bot n \Leftrightarrow a \equiv b(\bmod m),a \equiv b(\bmod n)\\a \equiv b(\bmod m) \Leftrightarrow \forall p,a \equiv b(\bmod {p^{ {m_p}}})\end{array}\\]
其中$m = \prod\nolimits_p { {p^{ {m_p}}}} $是$m$的素因子分解。
第三条性质是中国剩余定理的特例，今后我们再做证明。

# 独立剩余
---
同余的应用之一就是剩余系，将整数$x$表示为一组互素的模的剩余（余数）序列：
\\[(x\bmod {m_1}, \ldots ,x\bmod {m_r})\\]
其中模$m$两两互素。

通过这个剩余序列可以确定出$x$的通解，其实可以看出来，这就是中国剩余定理的另一种表示形式。

这种表示形式有很多好处，比如可以直接在每个维度上面进行加减乘法。例如对于$m_1 = 3, m_2 = 5$的剩余系，有如下表示：
\\[13 = (1,3),7 = (1,2)\\]
那么$13 \cdot 7\,\bmod \,15$就可以这样计算：
\\[(1 \cdot 1\bmod 3,3 \cdot 2\bmod 5) = (1,1)\\]
所以
\\[13 \cdot 7\bmod 15 = 1 \cdot 1\bmod 15 = 1\\]

