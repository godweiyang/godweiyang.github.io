---
title: Linear-Time Constituency Parsing with RNNs and Dynamic Programming
date: 2018-10-15 22:45:01
top: false
cover: false
password:
toc: true
mathjax: true
summary:
tags:
- ACL
- 自然语言处理
- 神经网络
- 深度学习
- 句法分析
categories:
- 句法分析
---

<div align="middle"><iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=533259686&auto=1&height=66"></iframe></div>

> 好像已经很久没有看论文了呢，开学了一堆事情，以后还是要抽空阅读论文，保持一定的阅读量，并且不能光看最新的论文，还得去前人传统的方法中去寻找有没有能应用于深度学习的东西，说不定就发ACL了呢（手动滑稽）。

**论文地址：**[Linear-Time Constituency Parsing with RNNs and Dynamic Programming](http://aclweb.org/anthology/P18-2076)
**代码地址：**[github](https://github.com/junekihong/beam-span-parser)

# 介绍
---
这次要介绍的论文是huang liang发表在ACL18的一篇短文，提出了一个基于转移系统的线性时间句法分析器。本文的主要贡献点主要有如下几点：
* 传统的基于转移的句法分析模型都是贪心解码，不能考虑到所有的状态空间，所以本文的模型采用beam search将状态空间提升到了指数级别。
* 首次采用cube pruning将分析的时间复杂度降低到了$O(nb \log b)$。
* 采用max-violation损失函数代替原来的求和的损失函数，并且对cross-span的span进行了惩罚。
* 在单模型上取得了最高的F1值。
* 采用图结构的栈（GSS）代替了原来的stack，这样不需要时刻保存历史信息。

# 模型基础
---
## 基于span的转移系统
这个我已经在之前的文章[成分句法分析综述](https://godweiyang.com/2018/09/26/constituent-parsing-summary/#系统改进)中详细阐述过了。核心思想就是stack里面保存的不再是短语结构树，而是span的左右边界下标$(i, j)$，初始时stack里面是$(0, 0)$，终止状态栈里是$(0, n)$，SHIFT之后栈顶变为$(j, j + 1)$，REDUCE之后栈顶变为$(k, j)$（假设之前栈顶两个元素是$(k, i)$和$(i, j)$）。

## Bi-LSTM特征
状态转移时用双向LSTM两端的差值计算每个span的表示，然后计算出得分，用来预测action。

# 动态规划
---
## 句法树得分
还是和之前chart-based模型一样，用每个span的label得分之和作为句法树的总得分。

## 图结构栈（Graph-Struct Stack, GSS）
因为要采用动态规划来枚举每个时刻所有的状态，不是用普通的stack，使用GSS来保存每个时刻的状态。GSS每个时刻只需要保存栈顶的span就行了，假设为$(i, j)$。如果action是SHIFT，那么下一步就变成了$(j, j + 1)$，如果action是REDUCE，那么还需要知道栈顶第二个元素是什么。因为考虑到了所有的状态空间，所以所有的$(k, i)$都是有可能的。

GSS的具体结构如下图所示：
![](1.jpg)
每个时刻的状态仅用一个span表示，在具体实现的时候，每个span还保存了一个span指针数组，指向它前面所有可能的span，还保存了当前span以及之前所有span的分数之和$c$和当前span子树的分数之和$v$。每个状态还保存了一个时刻标记$l$，易知一共有$2n - 1$个时刻。

当采取SHIFT动作时，状态变为了$(j, j + 1)$，并且新的span$(j, j + 1)$的指针数组中新增加一个span也就是$(i, j)$。prefix分数变为$c + \xi$，其中$\xi$是span$(j, j + 1)$的最高label得分，而inside分数就是span$(j, j + 1)$的分数$\xi$。

当采取REDUCE动作时，枚举span$(i, j)$指针数组中所有的前一个span$(k, i)$，然后合并成一个span$(k, j)$，prefix分数变为$c' + v + \sigma$，其中$\sigma$就是span$(k, j)$的最高label得分，inside分数变为了$v' + v + \sigma$。实际代码实现中，REDUCE完了后，span$(k, j)$的指针数组要更新为span$(k, i)$的指针数组。

## Beam Search和Cube Pruning
在每个时刻，只保存prefix得分最高的前b个span状态，这样时间复杂度可以降为$nb^2$，但是$b^2$相对于句子长度来说还是太大了，所以采用cube pruning继续降到$nb \log b$。

cube pruning原理是这样的：普通的beam search每个时刻枚举至多b个span，每个span和之前的至多b个span结合，所以一共最多产生$b^2$个span。

而cube pruning在每个时刻都建立一个堆，首先用上一个时刻的beam里的b个span，来产生b个SHIFT的span，送入堆里。理论上来说还应该产生至多$b^2$个REDUCE的span，但是在这里对于每个span，只取它的指针数组里得分最高的那个span，来和它结合产生新的span，送入堆里。然后在产生好的堆里，每次取出得分最高的span，出堆，如果它是REDUCE得到的span，那么就继续按照它的指针数组得分从高到低顺序产生一个span，REDUCE完之后送入堆里。依次下去，直到出栈了b个span为止。

# 训练
---
还是使用max-margin loss来训练，但是有几点小小的改进。
## cross-span损失
以往的损失函数里有个$\Delta (t,t')$，衡量的是预测树和标准树不同的span的数量。但是这有个问题，因为用了隐式二叉化，所以在预测树里存在label为空的情况。如果这个span在标准树中label也是空，那么原来的损失就不惩罚这一项了，但是要考虑到如果这个span在标准树中与某个标准的span产生了交叉，那么它根本就不可能是对的，也得进行惩罚。

## max violation updates
这是huang liang在2012提出来的，其实就是计算出每个时刻预测得分和标准得分的差距，然后取差距最大的那个时刻的得分差距作为最终的损失函数，之前都是用每个时刻得分差距之和来作为损失函数的。

# 实验
---
下图是不同的beam大小对不同长度句子分析速度的影响：
![](2.jpg)
最终综合考虑速度和准确率，选择beam大小为20。

最后是beam-span模型在PTB测试集上的准确率，在单模型上取得了最好的结果：
![](3.jpg)

# 总结
---
这篇论文是短论文，所以相比之下创新没有那么的大吧，主要还是速度上比chart-based有了提升，准确率上比普通的转移系统有了提升，另外还提出了几点小的改进吧，例如cross-span问题、max-violation损失之类的，转移系统也改成了适合用来进行beam search的GSS，为了进一步加快速度，还用了cube剪枝。

这么多改进其实个人感觉也是影响不大的，不是很通用，cross-span和max-violation损失可以考虑拿来用一下。下一步的工作还是考虑如何增加特征表示、加入头结点之类的吧。