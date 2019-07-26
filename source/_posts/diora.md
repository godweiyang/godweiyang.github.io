---
title: Unsupervised Latent Tree Induction with Deep Inside-Outside Recursive Autoencoders
top: false
cover: false
toc: true
mathjax: true
date: 2019-07-25 13:31:28
password:
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

**论文地址：**[Unsupervised Latent Tree Induction with Deep Inside-Outside Recursive Autoencoders](http://arxiv.org/abs/1904.02142)
**代码地址：**[github](https://github.com/iesl/diora)

今天要分享的这篇论文来自NAACL2019，主要利用inside-outside算法推理出给定句子的句法树，不需要任何的监督，也不需要下游任务作为目标函数，只需要masked语言模型就行了。

# 介绍
