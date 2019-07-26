---
title: 具体数学-第三章作业解答
date: 2018-04-20 14:01:06
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

<div align="middle"><iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=29534449&auto=1&height=66"></iframe></div>

# 题3
---
**题目**
求$\left\lfloor {nx} \right\rfloor  = n\left\lfloor x \right\rfloor $的充要条件。
**解答**
因为

\\[
x = \left\lfloor x \right\rfloor  + \{ x\}
\\]
所以

\\[
\left\lfloor {nx} \right\rfloor  = \left\lfloor {n(\left\lfloor x \right\rfloor  + \{ x\} )} \right\rfloor  = n\left\lfloor x \right\rfloor  + \left\lfloor {n\{ x\} } \right\rfloor
\\]
要使得$\left\lfloor {nx} \right\rfloor  = n\left\lfloor x \right\rfloor$，就必须有

\\[
\left\lfloor {n\{ x\} } \right\rfloor  = 0
\\]
所以

\\[
n\{ x\}  < 1
\\]
即

\\[
\{ x\}  < \frac{1}{n}
\\]
# 题7
---
**题目**
求下列递推式
\\[\begin{array}{l}{X_n} = n,0 \le n < m\\{X_n} = {X_{n - m}} + 1,n \ge m\end{array}\\]
**解答**
因为

\\[
n - \left\lfloor {\frac{n}{m}} \right\rfloor m = n\bmod m < m
\\]
所以

\\[
\begin{array}{l}{X_n} = {X_{n - m}} + 1 = {X_{n - 2m}} + 2 =  \cdots \\ = {X_{n - \left\lfloor {\frac{n}{m}} \right\rfloor m}} + \left\lfloor {\frac{n}{m}} \right\rfloor  = n - \left\lfloor {\frac{n}{m}} \right\rfloor m + \left\lfloor {\frac{n}{m}} \right\rfloor \\ = n\,\bmod \,m + \left\lfloor {\frac{n}{m}} \right\rfloor \end{array}
\\]
# 题8
---
**题目**
$n$个物品放到$m$个盒子中，求证至少有一个盒子物品数大于等于$\left\lceil {\frac{n}{m}} \right\rceil$，至少有一个盒子物品数小于等于$\left\lfloor {\frac{n}{m}} \right\rfloor$。
**解答**
假设所有的盒子物品数都小于$\left\lceil {\frac{n}{m}} \right\rceil$，那么总物品数$S$满足

\\[
S \le m(\left\lceil {\frac{n}{m}} \right\rceil  - 1)
\\]
令$n = qm + r,0 \le r < m$，那么有

\\[
S \le m(\left\lceil {q + \frac{r}{m}} \right\rceil  - 1) = qm - m + m\left\lceil {\frac{r}{m}} \right\rceil
\\]
如果$r=0$，那么有

\\[
S \le qm - m < n
\\]
如果$r>0$，那么有

\\[
S \le qm < n
\\]
这与$S=n$矛盾！所以至少有一个盒子物品数大于等于$\left\lceil {\frac{n}{m}} \right\rceil$。

假设所有的盒子物品数都大于$\left\lfloor {\frac{n}{m}} \right\rfloor$，那么总物品数$S$满足

\\[
S \ge m(\left\lfloor {\frac{n}{m}} \right\rfloor  + 1)
\\]
令$n = qm + r,0 \le r < m$，那么有

\\[
S \ge m(\left\lfloor {q + \frac{r}{m}} \right\rfloor  + 1) = qm + m + m\left\lfloor {\frac{r}{m}} \right\rfloor  = qm + m > qm + r = n
\\]
这与$S=n$矛盾！所以至少有一个盒子物品数小于等于$\left\lfloor {\frac{n}{m}} \right\rfloor$。