---
title: Sequence Tagging with Little Labeled Data
date: 2017-11-29 00:41:22
top: false
cover: false
password:
toc: true
mathjax: true
summary:
tags:
- 自然语言处理
- 神经网络
- 深度学习
- 序列标注
- 半监督学习
- 迁移学习
categories:
- 序列标注
---
文本挖掘课presentation还有一个多月了，依然很迷茫，不知道选什么课题。
最近看了一些序列标注相关的paper，暂且就准备挑一个相关的点做了，打算做一个“基于少量标注数据的序列标注”。

# 主要方法
---
基于少量标注数据的序列标注，主要有两种方法：迁移学习和半监督学习。
代表性的paper分别有：
[Yang Z, Salakhutdinov R, Cohen W W. Transfer Learning for Sequence Tagging with Hierarchical Recurrent Networks. ICLR, 2017.](https://arxiv.org/pdf/1703.06345.pdf)
[Matthew E. Peters, Waleed Ammar, Chandra Bhagavatula, Russell Power. Semi-supervised sequence tagging with bidirectional language models. ACL, 2017.](https://arxiv.org/pdf/1705.00108.pdf)
具体该讲些什么，该怎么讲，等我慢慢补充吧。
其中传统的半监督序列标注模型有基于HMM之类的，这里就不说了。
下面说说几个基于双向LSTM的。

### Marek Rei. *Semi-supervised Multitask Learning for Sequence Labeling. ACL, 2017.*
![](1.png)
这篇论文介绍了一个附加了语言模型的LSTM序列标注模型。
就是在传统的序列标注模型隐含层输出上额外附加了一层语言模型输出，总的损失函数也加上了语言模型的损失函数，共同训练。
![](2.png)
![](3.png)
![](4.png)
![](5.png)
其中E就是原始序列标注模型的损失。
当然了，这个模型不需要额外的未标注数据，只要用到少量的标注数据就行了。

### Matthew E. Peters, Waleed Ammar, Chandra Bhagavatula, Russell Power. *Semi-supervised sequence tagging with bidirectional language models. ACL, 2017.*
这篇论文就是半监督序列标注模型中我看到的效果最好的一个了。
和上面一篇相同的是，都加入了语言模型，来对单词上下文信息进行编码。但是不同的是，上文将语言模型和序列标注模型融合在了一起，所以只需要少量的标注数据就行了，无法利用大量的无标注数据。这篇的模型将其分开，预先对大量的无标注数据训练语言模型，然后将训练好的词表示加入到序列标注模型中，和原始的词向量结合，然后进行训练。
模型结构如下所示：
![](6.png)

### Yi Luan, Mari Ostendorf, Hannaneh Hajishirzi. *Scientific Information Extraction with Semi-supervised Neural Tagging. EMNLP, 2017.*
这篇论文任务是科技文章的关键词提取，然后分类为task、process、material三类，可以将其看成一个序列标注任务。
这篇论文介绍了一种基于图的半监督方法