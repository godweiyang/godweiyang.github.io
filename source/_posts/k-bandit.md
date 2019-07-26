---
title: K-bandit Algorithm
date: 2018-08-05 16:16:42
top: false
cover: false
password:
toc: true
mathjax: true
summary:
tags:
- 神经网络
- 深度学习
- 强化学习
categories:
- 强化学习
---

# 问题描述
---
有$K$个赌博机，每个赌博机有一定概率$P$吐出硬币，但是我们不知道这个概率是多少，每个赌博机吐出的硬币价值$V$也是不一样的，现在有$T$次机会选择赌博机，怎么选才能使得到的硬币总价值最大？

在下面的不同算法实现中，统一设定
\\[\begin{array}{l}K = 5 \\ P = [0.1,0.9,0.3,0.2,0.7] \\ V = [5,3,1,7,4] \\ T = 1000000\end{array}\\]
可以计算出，这种情况下：
1. 如果每次都选期望价值最高的4号赌博机，可以获得的最高总价值为2800000。
2. 如果每次都选期望价值最低的2号赌博机，可以获得的最低总价值为300000。
3. 如果随机选取赌博机，可以获得的期望总价值为1540000。

# 探索与利用算法
---
## 原理
“仅探索”（exploration-only）算法就是将机会平均分配给每一个赌博机，随机挑选赌博机。
“仅利用”（exploitation-only）算法就是选取当前平均价值最高的那台赌博机。

## 实现代码
```python
#!/usr/bin/python
# -*- coding: UTF-8 -*-
import random
import numpy as np

def R(k, P, V):
    if random.random() < P[k]:
        return V[k]
    else:
        return 0

def exploration_bandit(K, P, V, R, T):
    r = 0
    for t in range(T):
        k = random.randint(0, K - 1)
        v = R(k, P, V)
        r += v
    return r

def main():
    K = 5
    P = np.array([0.1, 0.9, 0.3, 0.2, 0.7])
    V = np.array([5, 3, 1, 7, 4])
    T = 1000000
    print exploration_bandit(K, P, V, R, T)

if __name__ == '__main__':
    main()
```
代码运行结果为：获得总价值1538893。

# $\varepsilon $贪心算法
---
## 原理


## 实现代码
```python
#!/usr/bin/python
# -*- coding: UTF-8 -*-
import random
import numpy as np

def R(k, P, V):
    if random.random() < P[k]:
        return V[k]
    else:
        return 0

def eplison_bandit(K, P, V, R, T):
    r = 0
    Q = np.zeros(K)
    count = np.zeros(K)
    for t in range(T):
        eplison = 1. / np.sqrt(t + 1)
        if random.random() < eplison:
            k = random.randint(0, K - 1)
        else:
            k = np.argmax(Q)
        v = R(k, P, V)
        r += v
        Q[k] += (v - Q[k]) / (count[k] + 1)
        count[k] += 1
    return r

def main():
    K = 5
    P = np.array([0.1, 0.9, 0.3, 0.2, 0.7])
    V = np.array([5, 3, 1, 7, 4])
    T = 1000000
    print eplison_bandit(K, P, V, R, T)

if __name__ == '__main__':
    main()
```
代码运行结果为：获得总价值2795546。

# Softmax算法
---
## 原理

## 实现代码
```python
#!/usr/bin/python
# -*- coding: UTF-8 -*-
import random
import numpy as np

def softmax(x):
    return np.exp(x) / np.sum(np.exp(x))

def R(k, P, V):
    if random.random() < P[k]:
        return V[k]
    else:
        return 0

def eplison_bandit(K, P, V, R, T, tau=0.1):
    r = 0
    Q = np.zeros(K)
    count = np.zeros(K)
    for t in range(T):
        p = softmax(Q / tau)
        rand = random.random()
        total = 0.0
        for i in range(K):
            total += p[i]
            if total >= rand:
                k = i
                break
        v = R(k, P, V)
        r += v
        Q[k] += (v - Q[k]) / (count[k] + 1)
        count[k] += 1
    return r

def main():
    K = 5
    P = np.array([0.1, 0.9, 0.3, 0.2, 0.7])
    V = np.array([5, 3, 1, 7, 4])
    T = 1000000
    tau = 0.1
    print eplison_bandit(K, P, V, R, T, tau)

if __name__ == '__main__':
    main()
```
代码运行结果为：$tau=0.01$时，获得总价值1397795。$tau=0.1$时，获得总价值2798372。当然随机性很大，每次运行结果都会不同