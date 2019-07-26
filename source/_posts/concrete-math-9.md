---
title: 具体数学-第9课（取整进阶与数论入门）
date: 2018-04-23 12:02:13
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


<div align="middle"><iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=108910&auto=1&height=66"></iframe></div>

今天讲完了取整的最后一部分知识，并给第四章数论开了个头。

首先还是以一道例题开始我们今天的课程。
# 例题1
---
求和：
\\[\sum\limits_{0 \le k < n} {\left\lfloor {\sqrt k } \right\rfloor } \\]
## 方法1
首先令$m = \left\lfloor {\sqrt k } \right\rfloor $
那么有
\\[\begin{array}{l}\sum\limits_{0 \le k < n} {\left\lfloor {\sqrt k } \right\rfloor }  = \sum\limits_{k,m \ge 0} {m\left[ {k < n} \right]\left[ {m = \left\lfloor {\sqrt k } \right\rfloor } \right]} \\ = \sum\limits_{k,m \ge 0} {m\left[ {k < n} \right]\left[ {m \le \sqrt k  < m + 1} \right]} \\ = \sum\limits_{k,m \ge 0} {m\left[ {k < n} \right]\left[ { {m^2} \le k < { {(m + 1)}^2}} \right]} \\ = \sum\limits_{k,m \ge 0} {m\left[ { {m^2} \le k < { {(m + 1)}^2} \le n} \right]} \\ + \sum\limits_{k,m \ge 0} {m\left[ { {m^2} \le k < n < { {(m + 1)}^2}} \right]} \end{array}\\]
我们先算左半部分，先假设$n = {a^2}$，那么有
\\[\begin{array}{l}\sum\limits_{k,m \ge 0} {m\left[ { {m^2} \le k < { {(m + 1)}^2} \le {a^2}} \right]} \\ = \sum\limits_{m \ge 0} {m(2m + 1)\left[ {m < a} \right]} \\ = \frac{1}{6}(4a + 1)a(a - 1)\end{array}\\]
而对于一般的$n$，令$a = \left\lfloor {\sqrt n } \right\rfloor $，我们只需要计算${a^2} \le k < n$的部分，而这部分$\sqrt k  = a$，所以结果为$(n - {a^2})a$。

所以总的结果为：
\\[\sum\limits_{0 \le k < n} {\left\lfloor {\sqrt k } \right\rfloor }  = na - \frac{1}{3}{a^3} - \frac{1}{2}{a^2} - \frac{1}{6}a,a = \left\lfloor {\sqrt n } \right\rfloor \\]

这里解释一下为什么没有算右半部分？因为右半部分就是${a^2} \le k < n$的这部分，已经计算过了。

## 方法2
因为$\left\lfloor x \right\rfloor  = \sum\nolimits_j {\left[ {1 \le j \le x} \right]} $，所以可以将原式替换掉，还是令$n = {a^2}$，然后如下计算：
\\[\begin{array}{l}\sum\limits_{0 \le k < n} {\left\lfloor {\sqrt k } \right\rfloor }  = \sum\limits_{j,k} {\left[ {1 \le j \le \sqrt k } \right]\left[ {0 \le k < {a^2}} \right]} \\ = \sum\limits_{1 \le j < a} {\sum\limits_k {\left[ { {j^2} \le k < {a^2}} \right]} } \\ = \sum\limits_{1 \le j < a} {({a^2} - {j^2})}  = {a^3} - \frac{1}{3}a(a + \frac{1}{2})(a + 1)\end{array}\\]
其中第二行交换了变量计算顺序。

# 定理1
---
这里直接介绍一个定理，就不证明了，过程比较复杂：
\\[\mathop {\lim }\limits_{n \to \infty } \frac{1}{n}\sum\limits_{0 \le k < n} {f(\{ k\alpha \} )}  = \int_0^1 {f(x)dx} \\]
其中$\alpha $是一个无理数。

这个公式说明了，无理数$\alpha $的整数倍的小数部分均匀分布在$(0,1)$之间。

这就给了我们一个启示，我们可以用它来生成随机数啊！其他用处还有很多，自己想咯。

# 例题2
---
求如下和式：
\\[\sum\limits_{0 \le k < m} {\left\lfloor {\frac{ {nk + x}}{m}} \right\rfloor } \\]
其中整数$m > 0$，$n$也是整数。

通过枚举$m = 1,2,3, \ldots $，可以发现和式满足如下形式：
\\[a\left\lfloor {\frac{x}{a}} \right\rfloor  + bn + c\\]
那么怎么计算出来呢？

首先做一个变形：
\\[\left\lfloor {\frac{ {x + kn}}{m}} \right\rfloor  = \left\lfloor {\frac{ {x + kn\bmod m}}{m}} \right\rfloor  + \frac{ {kn}}{m} - \frac{ {kn\bmod m}}{m}\\]
这就将原来的和式分为了三个部分求和。

**第一个部分为：**
\\[\left\lfloor {\frac{x}{m}} \right\rfloor  + \left\lfloor {\frac{ {x + n\bmod m}}{m}} \right\rfloor  +  \cdots  + \left\lfloor {\frac{ {x + (m - 1)n\bmod m}}{m}} \right\rfloor \\]
具体怎么算留到下一章节，这里通过枚举可以发现它的值是有周期的，周期重复次数是$d = \gcd (m,n)$。所以算出来结果为：
\\[\begin{array}{l}d\left( {\left\lfloor {\frac{x}{m}} \right\rfloor  + \left\lfloor {\frac{ {x + d}}{m}} \right\rfloor  +  \cdots  + \left\lfloor {\frac{ {x + m - d}}{m}} \right\rfloor } \right)\\ = d\left( {\left\lfloor {\frac{ {x/d}}{ {m/d}}} \right\rfloor  + \left\lfloor {\frac{ {x/d + 1}}{ {m/d}}} \right\rfloor  +  \cdots  + \left\lfloor {\frac{ {x/d + m/d - 1}}{ {m/d}}} \right\rfloor } \right)\\ = d\left\lfloor {\frac{x}{d}} \right\rfloor \end{array}\\]
**第二个部分为：**
\\[\sum\limits_{0 \le k < m} {\frac{ {kn}}{m}}  = \frac{ {(m - 1)n}}{2}\\]
**第三个部分为：**
\\[d\left( {\frac{0}{m} + \frac{d}{m} +  \cdots  + \frac{ {m - d}}{m}} \right) = \frac{ {m - d}}{2}\\]

所以总的结果为：
\\[\sum\limits_{0 \le k < m} {\left\lfloor {\frac{ {nk + x}}{m}} \right\rfloor }  = d\left\lfloor {\frac{x}{d}} \right\rfloor  + \frac{ {(m - 1)n}}{2} + \frac{ {d - m}}{2}\\]

这里我们对结果稍稍变形，可以得到另一个结果：
\\[\begin{array}{l}\sum\limits_{0 \le k < m} {\left\lfloor {\frac{ {nk + x}}{m}} \right\rfloor }  = d\left\lfloor {\frac{x}{d}} \right\rfloor  + \frac{ {(m - 1)(n - 1)}}{2} + \frac{ {m - 1}}{2} + \frac{ {d - m}}{2}\\ = d\left\lfloor {\frac{x}{d}} \right\rfloor  + \frac{ {(m - 1)(n - 1)}}{2} + \frac{ {d - 1}}{2}\end{array}\\]
可以发现，$m$和$n$是对称的！所以可以得到如下结论：
\\[\sum\limits_{0 \le k < m} {\left\lfloor {\frac{ {nk + x}}{m}} \right\rfloor }  = \sum\limits_{0 \le k < n} {\left\lfloor {\frac{ {mk + x}}{n}} \right\rfloor } \\]
这有什么用呢？当$m$特别大、$n$很小的时候可以大大减少项的个数！

如果我们令$n=1$，就会发现，得到的式子和之前证过的一个式子一模一样！
\\[\sum\limits_{0 \le k < m} {\left\lfloor {\frac{ {k + x}}{m}} \right\rfloor }  = \left\lfloor x \right\rfloor \\]

到这里为止，第三章取整就讲完了，下面开始讲第四章数论部分。

# 数论相关性质
---
## 整除定义
\\[m|n \Leftrightarrow m > 0,n = mk,k \in \mathbb{Z}\\]
注意这里整除的定义中要求$m>0$。

## 最大公约数和最小公倍数
定义我就不说了，大家应该都知道的。

## 欧几里得定理
又叫辗转相除法，就是用来求最大公约数的。
\\[\begin{array}{l}\gcd (0,n) = n\\\gcd (m,n) = \gcd (n\bmod m,m)\end{array}\\]

## 扩展欧几里得定理
在用欧几里得定理求到最大公约数之后，反过来可以将最大公约数表示为两个数的线性和：
\\[\gcd (m,n) = m'm + n'n\\]

## 性质1
如果$k|m,k|n$，那么$k|gcd(m,n)$。

## 性质2
\\[\sum\limits_{m|n} { {a_m}}  = \sum\limits_{m|n} { {a_{n/m}}} \\]
这个就是用了交换律，按照因子顺序倒过来算。

## 性质3
\\[\sum\limits_{m|n} { {a_m}}  = \sum\limits_k {\sum\limits_{m > 0} { {a_m}[n = mk]} } \\]
这个虽然变成了二重求和，但是对于每个$k$，其实只有一个$m$有效。

## 性质4
\\[\sum\limits_{m|n} {\sum\limits_{k|m} { {a_{k,m}}} }  = \sum\limits_{k|n} {\sum\limits_{l|(n/k)} { {a_{k,kl}}} } \\]
这个一眼就不一定能看出来了。

左边等于：
\\[\begin{array}{l}\sum\limits_{m|n} {\sum\limits_{k|m} { {a_{k,m}}} }  = \sum\limits_{j,l} {\sum\limits_{k,m > 0} { {a_{k,m}}[n = jm][m = kl]} } \\ = \sum\limits_j {\sum\limits_{k,l > 0} { {a_{k,kl}}[n = jkl]} } \end{array}\\]
右边等于：
\\[\begin{array}{l}\sum\limits_{k|n} {\sum\limits_{l|(n/k)} { {a_{k,kl}}} }  = \sum\limits_{j,m} {\sum\limits_{k,l > 0} { {a_{k,kl}}[n = jk][n/k = ml]} } \\ = \sum\limits_m {\sum\limits_{k,l > 0} { {a_{k,kl}}[n = mlk]} } \end{array}\\]
可以看出左右两边相等。

## 算数基本定理
一个整数可以唯一表示为若干个素数乘积：
\\[n = \prod\limits_p { {p^{ {n_p}}}} ,{n_p} \ge 0\\]
所以用指数形式来表示一个整数$n$，例如$18 = {2^1} \times {3^2}$，那么$18$可以表示为：
\\[ < 1,2,0,0, \ldots  > \\]
最大公约数和最小公倍数也能很方便的用指数形式计算：
其中最大公约数的每个素数的指数等于两个数对应指数最小值，最小公倍数的每个素数的指数等于两个数对应指数最大值。
