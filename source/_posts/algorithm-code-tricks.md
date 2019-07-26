---
title: 算法编程小白机试指南（大佬勿进）
date: 2019-07-12 14:26:27
top: true
cover: false
password:
toc: true
mathjax: true
summary:
tags:
- 算法
- 机试
categories:
- 程序设计
---

> 大佬就不用往下看了，这篇文章没有任何逻辑，没有任何进阶的指导意义，纯粹为了应付各种机试（夏令营机试、保研机试、程序设计实践考试等等），对正经编程竞赛没有任何帮助。我就想到哪写到哪了，不定期想到新的在更新。

# 暴力打表法
---
## 题目1
给定$n$个数字$1, 2, \ldots, n$，求任意取一个排列，任意第$i$个位置上的元素都不等于$i$的概率是多少？

如果知道结论的话，这就是一道普通的错位排列题，常规做法是求出递推式
\\[f(n) = (n-1)(f(n-1)+f(n-2))\\]
然后除以全排列的数量$n!$就行了，这里就不讲怎么求的了，百度有很多。这里讲讲如果不会求怎么办？

首先想到的暴力方法就是暴力枚举所有排列，然后看看有多少排列满足题目中的错位的条件。C++中的库函数``next_permutation``正好可以帮助我们枚举全排列，代码如下：

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long LL;

LL a[30] = {0, 0, 1};
int b[30];

int main() {
    for (int n = 3; n <= 20; ++n) {
        for (int i = 1; i <= n; ++i) {
            b[i] = i;
        }
        int cnt = 0;
        do {
            int flag = 1;
            for (int i = 1; i <= n; ++i) {
                if (b[i] == i) {
                    flag = 0;
                    break;
                }
            }
            cnt += flag;
        } while (next_permutation(b + 1, b + n + 1));
        a[n] = cnt;
        printf("%d, ", cnt);
    }
    return 0;
}
```

然后就可以跑出$n \le 12$的结果，但是再大就跑不出来了，因为全排列数量太多了，跑得太慢了。但是不用管，因为题目要求的不是错位排列的数量，而是除以全排列数量之后的概率，巧的是，$n > 12$之后概率保留两位小数的结果是完全相同的，所以直接取$n = 12$的概率就行了，代码如下：
```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long LL;

LL p[30] = {1, 1, 2};
LL a[30] = {0, 0, 1, 2, 9, 44, 265, 1854, 14833, 133496, 1334961, 14684570, 176214841};

int main() {
    for (int i = 3; i < 30; ++i) {
        p[i] = p[i - 1] * (LL)i;
    }
    int T;
    scanf("%d", &T);
    while (T--) {
        int n;
        scanf("%d", &n);
        if (n > 12)
            n = 12;
        double res = (double)a[n] / p[n] * 100.0;
        printf("%.2f%%\n", res);
    }
    return 0;
}
```

这样即使你完全不会计算，也可以100分通过这题啦。


## 题目2
[原题链接](https://acm.ecnu.edu.cn/problem/3337/)

这题其实就是给你$n$个数组，计算任意两个指定数组相同元素的个数。

首先想到的最暴力的方法就是，两层循环遍历两个数组咯，看有多少一样的元素就行了。那我们试试：
```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 40000 + 10;
vector<int> G[MAXN];
int len[MAXN];

int main() {
    int n, m;
    scanf("%d%d", &n, &m);
    for (int i = 0; i < m; ++i) {
        int u, v;
        scanf("%d%d", &u, &v);
        G[u].push_back(v);
        G[v].push_back(u);
    }
    for (int i = 1; i <= n; ++i) {
        len[i] = G[i].size();
    }
    int q;
    scanf("%d", &q);
    while (q--) {
        int s, t;
        scanf("%d%d", &s, &t);
        int cnt = 0;
        for (int i = 0; i < len[s]; ++i) {
            for (int j = 0; j < len[t]; ++j) {
                if (G[s][i] == G[t][j]) {
                    cnt++;
                }
            }
        }
        printf("%d\n", cnt);
    }
    return 0;
}
```

![](3337-1.jpg)

结果已经不错了，过了大多数样例了，这时你实在不想做了，拿了这点分数也可以做下一题了。

但是你稍微动点脑子，就可以发现，可以把所有数组提前排个序啊，然后遍历的时候就不需要每次都从头找起了，代码如下：
```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 40000 + 10;
vector<int> G[MAXN];
int len[MAXN];

int main() {
    int n, m;
    scanf("%d%d", &n, &m);
    for (int i = 0; i < m; ++i) {
        int u, v;
        scanf("%d%d", &u, &v);
        G[u].push_back(v);
        G[v].push_back(u);
    }
    for (int i = 1; i <= n; ++i) {
        sort(G[i].begin(), G[i].end());
        len[i] = G[i].size();
    }
    int q;
    scanf("%d", &q);
    while (q--) {
        int s, t;
        scanf("%d%d", &s, &t);
        int i = 0, j = 0, cnt = 0;
        while (i < len[s] && j < len[t]) {
            if (G[s][i] > G[t][j]) {
                ++j;
            } else {
                if (G[s][i] == G[t][j]) {
                    ++cnt;
                }
                ++i;
            }
        }
        printf("%d\n", cnt);
    }
    return 0;
}
```
![](3337-2.jpg)

然后你就会发现，结果并没有任何变化。。。不过理论上来说是会快一点的，这里数据可能比较小。

所以这里应该想不到啥优化的好方法了，不会做的话就下一题吧，分数够了，下面是正确代码，用`bitset`实现的：
```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 40000 + 10;
bitset<MAXN> G[MAXN];

int main() {
    int n, m;
    scanf("%d%d", &n, &m);
    for (int i = 0; i < m; ++i) {
        int u, v;
        scanf("%d%d", &u, &v);
        G[u][v] = G[v][u] = 1;
    }
    int q;
    scanf("%d", &q);
    while (q--) {
        int s, t;
        scanf("%d%d", &s, &t);
        printf("%d\n", (G[s] & G[t]).count());
    }
    return 0;
}
```