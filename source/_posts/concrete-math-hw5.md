---
title: 具体数学-第五章作业解答
date: 2018-06-01 16:20:51
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

<div align="middle"><iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=460578140&auto=1&height=66"></iframe></div>

# 4.
---
**题目：**
通过上指标翻转计算出$\left( {\begin{array}{\*{20}{c}}{ - 1}\\k\end{array}} \right)$。
**解答：**
如果$k \ge 0$，那么
\\[
\left( {\begin{array}{\*{20}{c}}{ - 1}\\k\end{array}} \right) = {( - 1)^k}\left( {\begin{array}{\*{20}{c}}{k - ( - 1) - 1}\\k\end{array}} \right) = {( - 1)^k}\left( {\begin{array}{\*{20}{c}}k\\k\end{array}} \right) = {( - 1)^k}
\\]
如果$k<0$，那么
\\[
\left( {\begin{array}{\*{20}{c}}{ - 1}\\k\end{array}} \right) = 0
\\]

# 46.
---
**题目：**
求出下列和式的闭形式解，其中$n$是正整数。
\\[
\sum\limits_k {\left( {\begin{array}{\*{20}{c}}{2k - 1}\\k\end{array}} \right)\left( {\begin{array}{\*{20}{c}}{4n - 2k - 1}\\{2n - k}\end{array}} \right)\frac{ { { {( - 1)}^{k - 1}}}}{ {(2k - 1)(4n - 2k - 1)}}}
\\]
**解答：**
由公式$(5.69)$可得
\\[
{\mathcal B_{ - 1}}(z) = \sum\limits_k {\left( {\begin{array}{\*{20}{c}}{2k - 1}\\k\end{array}} \right)\frac{ { { {( - z)}^k}}}{ {1 - 2k}}}  = \sum\limits_k {\left( {\begin{array}{\*{20}{c}}{2k - 1}\\k\end{array}} \right)\frac{ { { {( - 1)}^{k - 1}}}}{ {2k - 1}}{z^k}}
\\]
\\[
{\mathcal{B}_{ - 1}}( - z) = \sum\limits_k {\left( {\begin{array}{\*{20}{c}}{2k - 1}\\k\end{array}} \right)\frac{ { {z^k}}}{ {1 - 2k}}}  = \sum\limits_k {\left( {\begin{array}{\*{20}{c}}{2k - 1}\\k\end{array}} \right)\frac{ { - 1}}{ {2k - 1}}{z^k}}
\\]
两式相乘得到${\mathcal{B}_{ - 1}}(z){\mathcal{B}_{ - 1}}( - z)$，其中$z^{2n}$项的系数恰好就是
\\[
\begin{array}{l}\sum\limits_k {\left( {\begin{array}{\*{20}{c}}{2k - 1}\\k\end{array}} \right)\frac{ { { {( - 1)}^{k - 1}}}}{ {2k - 1}} \cdot \left( {\begin{array}{\*{20}{c}}{2(2n - k) - 1}\\{2n - k}\end{array}} \right)\frac{ { - 1}}{ {2(2n - k) - 1}}} \\ =  - \sum\limits_k {\left( {\begin{array}{\*{20}{c}}{2k - 1}\\k\end{array}} \right)\left( {\begin{array}{\*{20}{c}}{4n - 2k - 1}\\{2n - k}\end{array}} \right)\frac{ { { {( - 1)}^{k - 1}}}}{ {(2k - 1)(4n - 2k - 1)}}} \end{array}
\\]
所以题目所求的和式的闭形式解就是${\mathcal{B}_{ - 1}}(z){\mathcal{B}_{ - 1}}( - z)$的$z^{2n}$项的系数的相反数。
由公式$(5.69)$还可以得到
\\[
{\mathcal{B}_{ - 1}}(z) = \frac{ {1 + \sqrt {1 + 4z} }}{2}
\\]
\\[
{\mathcal{B}_{ - 1}}( - z) = \frac{ {1 + \sqrt {1 - 4z} }}{2}
\\]
所以
\\[
(2{\mathcal{B}_{ - 1}}(z) - 1)(2{\mathcal{B}_{ - 1}}( - z) - 1) = \sqrt {1 - 16{z^2}} 
\\]
展开化简可以得到
\\[
{\mathcal{B}_{ - 1}}(z){\mathcal{B}_{ - 1}}( - z) = \frac{1}{4}\sqrt {1 - 16{z^2}}  + \frac{1}{2}{\mathcal{B}_{ - 1}}(z) + \frac{1}{2}{\mathcal{B}_{ - 1}}( - z) - 1
\\]
而
\\[
\begin{array}{l}{(1 - 16{z^2})^{1/2}} = \sum\limits_k {\left( {\begin{array}{\*{20}{c}}{1/2}\\k\end{array}} \right){ {( - 16)}^k}{z^{2k}}} \\ = \sum\limits_k {\frac{1}{ {1 - 2k}}\left( {\begin{array}{\*{20}{c}}{ - 1/2}\\k\end{array}} \right){ {( - 16)}^k}{z^{2k}}} \\ = \sum\limits_k {\frac{1}{ {1 - 2k}}\frac{ { { {( - 1)}^k}}}{ { {4^k}}}\left( {\begin{array}{\*{20}{c}}{2k}\\k\end{array}} \right){ {( - 16)}^k}{z^{2k}}} \\ = \sum\limits_k {\frac{1}{ {1 - 2k}}\left( {\begin{array}{\*{20}{c}}{2k}\\k\end{array}} \right){4^k}{z^{2k}}} \end{array}
\\]
所以题目答案即${\mathcal{B}_{ - 1}}(z){\mathcal{B}_{ - 1}}( - z)$的$z^{2n}$项的系数的相反数为
\\[
\left( {\begin{array}{\*{20}{c}}{2n}\\n\end{array}} \right)\frac{ { {4^{n - 1}}}}{ {2n - 1}} + \left( {\begin{array}{\*{20}{c}}{4n - 1}\\{2n}\end{array}} \right)\frac{1}{ {4n - 1}}
\\]

# 64.
---
**题目：**
计算
\\[
\sum\limits_{k = 0}^n {\left( {\begin{array}{\*{20}{c}}n\\k\end{array}} \right)/\left\lceil {\frac{ {k + 1}}{2}} \right\rceil } 
\\]
**解答：**
\\[
\begin{array}{l}\sum\limits_{k = 0}^n {\left( {\begin{array}{\*{20}{c}}n\\k\end{array}} \right)/\left\lceil {\frac{ {k + 1}}{2}} \right\rceil } \\ = \sum\limits_{k = 0}^n {\left( {\left( {\begin{array}{\*{20}{c}}n\\{2k}\end{array}} \right) + \left( {\begin{array}{\*{20}{c}}n\\{2k + 1}\end{array}} \right)} \right)\frac{1}{ {k + 1}}} \\ = \sum\limits_{k = 0}^n {\left( {\begin{array}{\*{20}{c}}{n + 1}\\{2k + 1}\end{array}} \right)\frac{1}{ {k + 1}}} \\ = \frac{2}{ {n + 2}}\sum\limits_{k = 0}^n {\left( {\begin{array}{\*{20}{c}}{n + 2}\\{2k + 2}\end{array}} \right)} \\ = \frac{ { {2^{n + 2}} - 2}}{ {n + 2}}\end{array}
\\]

# 65.
---
**题目：**
证明
\\[
\sum\limits_k {\left( {\begin{array}{\*{20}{c}}{n - 1}\\k\end{array}} \right){n^{ - k}}(k + 1)!}  = n
\\]
**解答：**
等号左边可以写为
\\[
\sum\limits_{0 \le k \le n - 1} {\left( {\begin{array}{\*{20}{c}}{n - 1}\\k\end{array}} \right){n^{ - k}}(k + 1)!}
\\]
替换$k$为$n-1-k$，得到
\\[
\sum\limits_{0 \le k \le n - 1} {\left( {\begin{array}{\*{20}{c}}{n - 1}\\k\end{array}} \right){n^{1 + k - n}}(n - k)!}  
\\]
即证
\\[
\sum\limits_{0 \le k \le n - 1} {\left( {\begin{array}{\*{20}{c}}{n - 1}\\k\end{array}} \right){n^{1 + k - n}}(n - k)!}  = n
\\]
等式两边同时乘以$n^{n-1}$，即证
\\[
\sum\limits_{0 \le k \le n - 1} {\left( {\begin{array}{\*{20}{c}}{n - 1}\\k\end{array}} \right){n^k}(n - k)!}  = {n^n}
\\]
等式左边等于
\\[
\begin{array}{l}\sum\limits_{0 \le k \le n - 1} {\left( {\begin{array}{\*{20}{c}}{n - 1}\\k\end{array}} \right){n^k}(n - k)!} \\ = (n - 1)!\sum\limits_{0 \le k \le n - 1} {\frac{ { {n^k}(n - k)}}{ {k!}}} \\ = (n - 1)!\sum\limits_{0 \le k \le n - 1} {\left( {\frac{ { {n^{k + 1}}}}{ {k!}} - \frac{ { {n^k}}}{ {(k - 1)!}}} \right)} \\ = (n - 1)!\frac{ { {n^n}}}{ {(n - 1)!}}\\ = {n^n}\end{array}
\\]
得证。