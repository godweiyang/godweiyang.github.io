---
title: Better, Faster, Stronger Sequence Tagging Constituent Parsers
date: 2019-03-11 17:45:18
top: false
cover: false
password:
toc: true
mathjax: true
summary:
tags:
- NAACL
- 自然语言处理
- 神经网络
- 深度学习
- 句法分析
categories:
- 句法分析
---

<div align="middle"><iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=416892296&auto=1&height=66"></iframe></div>

> 为了看懂论文里的策略梯度，又去把强化学习看了一遍。。。

**论文地址：**[Better, Faster, Stronger Sequence Tagging Constituent Parsers](https://arxiv.org/abs/1902.10985)

# 介绍
---
这篇论文主要是在之前的那篇论文[Constituent Parsing as Sequence Labeling](https://godweiyang.com/2019/03/11/ConParSeqLab/)基础上解决了如下三个问题：
* 太长的短语预测错误率高。
* 输出空间太大导致label稀疏性。
* 贪心解码导致的错误传播。

本文提出的解决方法分别是：
* 采用融合了相对编码和绝对编码的动态编码。
* 将预测任务分解为多个子任务。
* 采用辅助任务和策略梯度。

# 三大问题以及解决方法
---
## 过长短语预测的高错误率
由下面这张图可以看出，当$n_i$太小时，准确率就会大幅下降。这个问题主要体现在过长短语的闭合上，右括号的预测尤其困难。其实这也跟数据稀疏性有很大关系，训练集中过长短语毕竟占少数。
![](1.jpg)

解决方法就是采用动态编码，如下图所示：
![](2.jpg)
第一行是相对值编码，第二行是绝对值编码，之前文章都已经解释过了。第三行是结合了上面两种编码的动态编码，具体取值情况是大多数时候都还采用相对值编码，因为毕竟相对值编码空间比较小，可以适当缓解数据稀疏性。但是当满足如下两种情况的时候，就采用绝对值编码：
* 绝对值$n_t' \leq 3$，也就是说CA的个数不能超过3个，这样也是为了降低数据的稀疏性。
* 相对值$n_t \leq -2$，也就是说将上图中准确率比较低的那些负数值全部用绝对值替代了，在句法树中表现为$w_{t+1}$所在的子树比$w_t$低两层以上。

## 输出空间太大导致label稀疏性
这个问题主要是由于三元组$(n_t, c_t, u_t)$太稀疏了导致的。假设$n_t \in N, c_t \in C, u_t \in U$，那么这个三元组的状态空间是$\left| N \right| \times \left| C \right| \times \left| U \right|$，可以通过将三元组分解为三个不同的子任务将复杂度降低为$\left| N \right| + \left| C \right| + \left| U \right|$。最后的损失函数定义为三个子任务的损失之和：
\\[
\mathcal{L} = \mathcal{L}\_n + \mathcal{L}\_c + \mathcal{L}\_u
\\]
具体实现上，可以将任务$U$的输出给任务$N$和$C$作为输入。

## 贪心解码导致的错误传播
这个问题在基于贪心的方法中基本都存在，也就是所谓的一步错步步错，这里主要提出了两种解决方法。

**辅助任务** 辅助任务主要就是用来帮助主任务学习到一些不太容易学到的信息。这里才用了两个辅助任务，一个是在预测$n_t$的同时再预测一个$n_{t+1}$，这样就能往后多预测一步，适当的减少了贪心的影响。另一个方法就是将之前博客写到的句法距离（syntactic distances）加入到模型中一起预测：
![](3.jpg)
对于不同的辅助任务，最后将他们的损失求和加到最终的损失函数中去：
\\[
\mathcal{L} = \mathcal{L}\_n + \mathcal{L}\_c + \mathcal{L}\_u + \beta \sum\_a \mathcal{L}\_a
\\]

**策略梯度** 这个方法可以从全局的角度来对模型进行优化。假设模型在$t$时刻的状态为$s_t$，输出标签为$l_t = (n_t, c_t, u_t)$，那么模型选择$l_t$的概率定义为策略$\pi$，模型最终可以获得的奖励为$\mathcal R_{tree}$，定义为句法树的F1值。

定义句法树的概率为每一步决策的概率之积：
\\[
p(tree) = \prod\limits_{t = 1}^T {\pi ({l_t}|{s_t};\theta )}
\\]
所以模型最终就是要最大化如下的奖励：
\\[
\mathcal R = \sum\limits_{tree} { {\mathcal R_{tree}}p(tree)}
\\]
按照梯度上升的方向更新参数$\theta$，求梯度可得：
\\[
\begin{array}{l}\Delta \mathcal R = \sum\limits_{tree} { {\mathcal R_{tree}}\Delta p(tree)} \\ = \sum\limits_{tree} {p(tree){\mathcal R_{tree}}\frac{ {\Delta p(tree)}}{ {p(tree)}}} \\ = \sum\limits_{tree} {p(tree){\mathcal R_{tree}}\Delta \log p(tree)} \\ = {\mathbb{E}_{tree \sim p}}({\mathcal R_{tree}}\Delta \log p(tree))\end{array}
\\]
将$p(tree)$代入可得：
\\[
\begin{array}{l}\Delta \mathcal R = {\mathbb{E}_{tree \sim p}}({\mathcal R_{tree}}\Delta \log p(tree))\\ = {\mathbb{E}_{tree \sim p}}({\mathcal R_{tree}}\Delta \log \prod\limits_{t = 1}^T {\pi ({l_t}|{s_t};\theta )} )\\ = {\mathbb{E}_{tree \sim p}}(\sum\limits_{t = 1}^T { {\mathcal R_{tree}}\Delta \log \pi ({l_t}|{s_t};\theta )} )\\ \approx \frac{1}{N}\sum\limits_{i = 1}^N {\sum\limits_{t = 1}^T {\mathcal R_{i}\Delta \log \pi ({l_t}|{s_t};\theta )} } \end{array}
\\]
其中$\mathcal R_{i}$是根据分布$p$采样出来的$N$棵句法树的奖励。

具体实现的时候有好几个小Tips。

第一个就是要将奖励减去一个baseline，这里定义为模型直接根据贪心求得的句法树的F1值：
\\[
\Delta \mathcal R \approx \frac{1}{N}\sum\limits_{i = 1}^N {\sum\limits_{t = 1}^T {\Delta \log \pi ({l_t}|{s_t};\theta )({\mathcal R_i} - {B_i})} }
\\]
这么做的目的就是为了让奖励有正有负，不然全部都是正数的话，因为采样不可能全部采样到，可能会导致高概率的样本概率越来越高，而没有采样到的低概率样本可能奖励非常高，却因此概率越来越低。

第二个Tip就是加入熵作为正则项：
\\[
\Delta \mathcal R \approx \frac{1}{N}\sum\limits_{i = 1}^N {\sum\limits_{t = 1}^T {\Delta \log \pi ({l_t}|{s_t};\theta )({\mathcal R_i} - {B_i}) + \beta \Delta H(\pi ({l_t}|{s_t};\theta ))} }
\\]
目的就是使概率尽量不要太小，不然的话采样数不够的话就有可能造成采样不到小概率的样本。

还有就是给策略加入噪声：
\\[
\Delta \mathcal R \approx \frac{1}{N}\sum\limits_{i = 1}^N {\sum\limits_{t = 1}^T {\Delta (\log \pi ({l_t}|{s_t};\theta ) + N)({\mathcal R_i} - {B_i}) + \beta \Delta H(\pi ({l_t}|{s_t};\theta ) + N)} }
\\]
目的同样是加大概率，防止概率太接近于0，当然这个可加可不加。。。

# 实验结果
---
首先测试了不同设置的影响：
![](4.jpg)
可以看出上面提到的几种方法对性能都有提升，其中采用动态编码、多任务（也就是减少输出空间）、辅助任务（主要是预测前一个$n_{t-1}$）还有策略梯度可以获得最好的结果。

最终模型在测试集上取得了90.6的F1值，虽然不是很高，但比之前的序列标注模型提升还是不少。
![](5.jpg)

最后再来看一下模型在负数预测上的准确率，可以看出有了非常大的提升：
![](6.jpg)

# 总结
---
这篇论文提出了不少的小Tips来提升序列模型的准确率，但是效果却还是远远低于syntactic distances那篇论文（F1值91.8），具体原因我也不得而知，我猜测跟树到序列映射编码关系可能不是特别大，可能还是跟序列建模有关，那篇论文的序列采用了两次LSTM，中间还夹杂了一次CNN卷积操作。所以编码器的好坏还是直接决定了最后性能的好坏，怪不得Elmo和Bert的效果那么的突出。