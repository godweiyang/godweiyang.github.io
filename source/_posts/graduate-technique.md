---
title: 毕业论文相关细节记录
date: 2018-03-18 12:46:37
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
- 句法分析
categories:
- 句法分析
---

<div align="middle"><audio src="http://mp3.qqmusic.cc/yq/3583938.mp3" controls autoplay>
Your browser does not support the element.
</audio></div>


# 随机数种子
---
这是玄学，姑且就设为我的QQ号792321264，看起来效果不错。

# 神经网络维数
---
不断测试发现，64维效果最好，但最后可能改成512维的。
而且64维的话CPU跑的比GPU还要快6倍，但是512维的话GPU就比CPU快6倍左右了。
所以维度低还是用CPU比较好。

# 结点分数
---
\\[\begin{array}{l}Score(A \to BC) = \lambda d \cdot (W \cdot e + b) + Spcfg(A)\\Spcfg(A) = \log (Spcfg(B) \cdot Spcfg(C) \cdot p(A \to BC))\end{array}\\]
其中$d,W,b$是权值矩阵，$\lambda$是超参数，测试发现设为100左右效果最好。

# 结点表示
---
\\[e = LST{M^{left}}({e_{right}})\\]
至于用左儿子还是右儿子作为LSTM，还是加一层动态规划记录两者最优值，小数据上暂时没有太大差别。

# 损失函数
---
\\[L(\theta ) = Scor{e_{predict}}(ROOT) - Scor{e_{gold}}(ROOT) + k \cdot \Delta (predict,gold) + \frac{1}{2}{\left\| \theta  \right\|^2}\\]
其中正则项加了可以使loss下降更稳定，但是效果貌似不如不加，可能是因为数据集太小吧。
$k$一般取0.1。

# batch
---
batch取50左右效果最好，不过我用的是dynet自带的自动batch，手动batch还不是很会写，所以效率提升不是很大。

# 动态规划
---
原来是4层循环，用时特别久，改进了一下变成6层循环效率大大提高。
原算法：
```python
for i from 0 to n
    for j from 0 to n
        for k from i to j
            for A->BC in grammar
                balabala...
```
改进算法：
```python
for i from 0 to n
    for j from 0 to n
        for k from i to j
            for B in nodetype[left]
                for C in nodetype[right]
                    for A in panode[BC]
                        balabala...
```

# 未来改进
---
* 如果测试集中的句法规则在训练集中没有出现的话，会直接产生None的结果，是否可以考虑产生新的规则，这样就可以对所有句子进行句法分析了？
* 效率虽然有了很大提升，但是大数据依然跑的很慢，可以考虑加上手动batch、减少规则数量、动态规划算法优化等等。


最后附上我的主要代码（丑是丑了点，不喜勿喷，封装什么的以后再说）：
```python
import random
import numpy as np
from collections import defaultdict as dd, defaultdict
from itertools import count
import re
import time
import math
import _dynet as dy

dyparams = dy.DynetParams()
dyparams.from_args()
dyparams.set_requested_gpus(1)
dyparams.set_mem(2048)
dyparams.set_random_seed(792321264)
dyparams.init()

# ==============================================================
# read train file
DEBUG = True

train_string_file = "data/train.strings"
train_tree_file = "data/train.trees.pre.unk"
dev_string_file = "data/dev.strings"
dev_tree_file = "data/dev.trees"
dev_parse_file = "data/dev.parses"
if DEBUG:
    train_string_file = "data/train_small.strings"
    train_tree_file = "data/train_small.trees.pre.unk"
    dev_string_file = "data/dev_small.strings"
    dev_tree_file = "data/dev_small.trees"
    dev_parse_file = "data/dev_small.parses"

train_string = []
train_tree = []
words = []
with open(train_string_file, "r") as fh:
    for line in fh:
        train_string.append(line)
        for word in line.split():
            words.append(word)
words.append("<unk>")

with open(train_tree_file, "r") as fh:
    for line in fh:
        train_tree.append(line)

w2i = defaultdict(count(0).next)
for word in words:
    w2i[word]
i2w = {i:w for w, i in w2i.iteritems()}
nwords = len(w2i)

# ==============================================================
# read grammar file
nonTerms = set()
rules_set1 = set()
rules_set2 = set()
rules = {}
lexicons = []
origText = list()
probs = defaultdict(float)
node_pa = {}

def read_grammar(f):
    grammar = {}
    file = open(f, 'r')
    for rule in file:
        # AAA -> # BBB @ prob
        tokens = re.split(r"\-\>|\@", rule.strip())
        lhs = tokens[0].strip()
        rhs = tokens[1].strip().strip(r'\'')
        rhs = rhs.strip(r'\"')
        prob = tokens[2].strip()
        probs[(lhs, rhs)] = float(prob)
        nonTerms.add(lhs)
        if len(rhs.split()) == 1:
            rules_set1.add((lhs, rhs))
        else:
            rules_set2.add((lhs, rhs))
            if rhs in node_pa:
                node_pa[rhs].add(lhs)
            else:
                node_pa[rhs] = set()
                node_pa[rhs].add(lhs)
        rules[lhs] = rhs
        if len(rhs.split()) == 1 and rhs != '<unk>':
            lexicons.append(rhs)

if DEBUG:
    grammar = read_grammar('data/pcfg_small')
else:
    grammar = read_grammar('data/pcfg')
print rules_set1.__len__(), rules_set2.__len__()

# ==============================================================
# LSTM and parameters initialization
EPOCH = 40
EMBDDING_SIZE = 512
lamda = 100
k = 0.1
model = dy.ParameterCollection()
builder = dy.FastLSTMBuilder(2, EMBDDING_SIZE, EMBDDING_SIZE, model)
trainer = dy.AdamTrainer(model)
WORDS_LOOKUP = model.add_lookup_parameters((nwords, EMBDDING_SIZE))
pd = model.add_parameters((1, EMBDDING_SIZE))
pW = model.add_parameters((EMBDDING_SIZE, EMBDDING_SIZE))
pb = model.add_parameters((EMBDDING_SIZE,))

# ==============================================================
# construct trees
class MTree(object):
    def __init__(self, lhs, wrd=None, subs=None):
        self.label = lhs
        self.word = wrd
        self.subs = subs
        self.str = None

    def is_lexicon(self):
        return self.word is not None

    def dostr(self):
        return "(%s %s)" % (self.label, self.word) if self.is_lexicon() \
                else "(%s %s)" % (self.label, " ".join(map(str, self.subs)))

    def __str__(self):
        if True or self.str is None:
            self.str = self.dostr()
        return self.str

def helper(next, text, backPointers, terminals, score):
    begin = next[0]
    end = next[1]
    A = next[2]
    if next not in backPointers:
        if next in terminals:   #base condition
            word = origText[next[0]]
            node = MTree(lhs=A, subs=None, wrd=word)
        return (node, score[(begin, end, A)])
    (split, B, C) = backPointers[next]
    next1 = (begin, split, B)
    next2 = (split, end, C)
    t1, s1 = helper(next1, text, backPointers, terminals, score)
    t2, s2 = helper(next2, text, backPointers, terminals, score)
    return (MTree(lhs=A, subs=[t1, t2], wrd=None), score[(begin, end, A)])

def backtrack(text, backPointers, terminals, score):
    n = len(text)
    if (0, n, 'S') not in backPointers:
        return (None, 0)
    t, s = helper((0, n, 'S'), text, backPointers, terminals, score)
    return (t, s)

def math_log(x):
    if x <= 0:
        return -100
    else:
        return math.log(x)

def score_calc(d, W, p, b, lamda, s_pcfg):
    return d * (W * p + b) * lamda + s_pcfg

def cal_loss(result, gold):
    if result == None:
        return dy.inputTensor(list([len(gold)]))
    result = result.split()
    gold = gold.split()
    cnt = dy.inputTensor(list([0]))
    for i in range(0, len(result)):
        if result[i] != gold[i]:
            cnt += 1
    return cnt

def cal_gold(gold, d, W, b):
    words = gold.split()
    n = len(words)
    if n == 2:
        A = words[0][1:]
        word = words[1][:-1]
        # print gold, word, w2i[word]
        LSTM = builder.initial_state()
        TMP = LSTM.add_input(WORDS_LOOKUP[w2i[word]])
        e = TMP.output()
        s_pcfg = math_log(probs[(A, word)])
        s = score_calc(d, W, e, b, lamda, probs[(A, word)])
        return (e, s, s_pcfg, TMP, A)
    else:
        sz = len(gold)
        p = 0
        for i in xrange(0, sz):
            if gold[i] == ' ':
                p = i
                break
        m = 0
        cnt = 0
        for i in xrange(p+1, sz):
            if gold[i] == '(':
                cnt += 1
            elif gold[i] == ')':
                cnt -= 1
            if cnt == 0:
                m = i
                break
        x1, s1, s1_pcfg, LSTM1, B = cal_gold(gold[p+1 : m+1], d, W, b)
        x2, s2, s2_pcfg, LSTM2, C = cal_gold(gold[m+2 : sz-1], d, W, b)
        A = gold[1:p]
        TMP = LSTM2.add_input(x1)
        e = TMP.output()
        s_pcfg = math_log(probs[(A, B+" "+C)]) + s1_pcfg + s2_pcfg
        ss1 = score_calc(d, W, e, b, lamda, s_pcfg)
        return (e, ss1, s_pcfg, TMP, A)

total_time = 0.0
# print nonTerms.__len__()
ff = open("loss.txt", "w")
for epoch in xrange(0, EPOCH):
    print "epoch %d" % epoch
    sumloss = 0
    num = len(train_string)
    batch = []
    start = time.time()
    for idx, line in enumerate(train_string):
        sstart = time.time()
        gold = train_tree[idx].strip()
        sent = line.split()
        origText = list(sent)
        n = len(sent)
        d = pd.expr()
        W = pW.expr()
        b = pb.expr()
        terminals = {}
        embdding = {}
        score = defaultdict(float)
        score_pcfg = defaultdict(float)
        backPointers = {}
        LSTM = {}
        node_rules = {}
        for i in range(0, n):
            begin = i
            end = i + 1
            node_rules[(begin, end)] = set()
            word = sent[i]
            for A in nonTerms:
                if (A, word) in rules_set1:
                    LSTM[(begin, end, A)] = builder.initial_state()
                    LSTM[(begin, end, A)] = LSTM[(begin, end, A)].add_input(WORDS_LOOKUP[w2i[sent[i]]])
                    embdding[(begin, end, A)] = LSTM[(begin, end, A)].output()
                    score_pcfg[(begin, end, A)] = math_log(probs[(A, word)])
                    score[(begin, end, A)] = score_calc(d, W, embdding[(begin, end, A)], b, lamda, probs[(A, word)])
                    terminals[(begin, end, A)] = word
                    node_rules[(begin, end)].add(A)
        for span in range(2, n + 1):
            for begin in range(0, n - span + 1):
                end = begin + span
                node_rules[(begin, end)] = set()
                for split in range(begin + 1, end):
                    for B in node_rules[(begin, split)]:
                        for C in node_rules[(split, end)]:
                            X = B+" "+C
                            if X in node_pa:
                                for A in node_pa[X]:
                                    node_rules[(begin, end)].add(A)
                                    TMP = LSTM[(split, end, C)].add_input(embdding[(begin, split, B)])
                                    p = TMP.output()
                                    s_pcfg = math_log(probs[(A, X)]) + score_pcfg[(begin, split, B)] + score_pcfg[(split, end, C)]
                                    s = score_calc(d, W, p, b, lamda, s_pcfg)
                                    # print (d * (W * p + b) * 100).value(), s_pcfg
                                    if (begin, end, A) not in score or s.value() > score[(begin, end, A)].value():
                                        LSTM[(begin, end, A)] = TMP
                                        score[(begin, end, A)] = s
                                        score_pcfg[(begin, end, A)] = s_pcfg
                                        embdding[(begin, end, A)] = p
                                        backPointers[(begin, end, A)] = (split, B, C)

        t, s = backtrack(sent, backPointers, terminals, score)
        result = None
        if t != None:
            result = t.dostr()
        golds_e, golds, golds_pcfg, lstm, S = cal_gold(gold, d, W, b)
        cnt = cal_loss(result, gold)
        # loss = dy.abs(s - golds) + cnt * k
        loss = dy.abs(s - golds) + cnt * k + 0.5 * (dy.l2_norm(W) + dy.l2_norm(b) + dy.l2_norm(d))
        sumloss += loss.value()
        batch.append(loss)
        if len(batch) == 50:
            loss = dy.esum(batch)
            loss.backward()
            trainer.update()
            dy.renew_cg()
            batch = []
        eend = time.time()
        # print "time of sent ", idx, ": ", eend - sstart
        if idx > 0 and idx % 500 == 0:
            print "time of 500 sent: ", (eend - start) / (idx / 500)
            # print idx, " -------------"
            # print "result: " + result
            # print "gold:   " + gold
            # print "loss: ", loss.value()
    end = time.time()
    total_time += end - start
    print "epoch time: ", end - start
    print "epoch loss: ", sumloss / num
    ff.write('%f\n'%(sumloss / num))

print "total time: ", total_time

fh = open(dev_string_file, "r")
outfile = open(dev_parse_file, "w")
for line in fh:
    sent = line.split()
    origText = list(sent)
    for i, word in enumerate(sent):
        if word not in lexicons:
            sent[i] = '<unk>'
    n = len(sent)
    dy.renew_cg()
    d = pd.expr()
    W = pW.expr()
    b = pb.expr()
    terminals = {}
    embdding = {}
    score = defaultdict(float)
    score_pcfg = defaultdict(float)
    backPointers = {}
    LSTM = {}
    node_rules = {}
    for i in range(0, n):
        begin = i
        end = i + 1
        node_rules[(begin, end)] = set()
        word = sent[i]
        for A in nonTerms:
            if (A, word) in rules_set1:
                LSTM[(begin, end, A)] = builder.initial_state()
                LSTM[(begin, end, A)] = LSTM[(begin, end, A)].add_input(WORDS_LOOKUP[w2i[sent[i]]])
                embdding[(begin, end, A)] = LSTM[(begin, end, A)].output()
                score_pcfg[(begin, end, A)] = math_log(probs[(A, word)])
                score[(begin, end, A)] = score_calc(d, W, embdding[(begin, end, A)], b, lamda, probs[(A, word)])
                terminals[(begin, end, A)] = word
                node_rules[(begin, end)].add(A)
    for span in range(2, n + 1):
        for begin in range(0, n - span + 1):
            end = begin + span
            node_rules[(begin, end)] = set()
            for split in range(begin + 1, end):
                for B in node_rules[(begin, split)]:
                    for C in node_rules[(split, end)]:
                        X = B+" "+C
                        if X in node_pa:
                            for A in node_pa[X]:
                                node_rules[(begin, end)].add(A)
                                TMP = LSTM[(split, end, C)].add_input(embdding[(begin, split, B)])
                                p = TMP.output()
                                s_pcfg = math_log(probs[(A, X)]) + score_pcfg[(begin, split, B)] + score_pcfg[(split, end, C)]
                                s = score_calc(d, W, p, b, lamda, s_pcfg)
                                if (begin, end, A) not in score or s.value() > score[(begin, end, A)].value():
                                    LSTM[(begin, end, A)] = TMP
                                    score[(begin, end, A)] = s
                                    score_pcfg[(begin, end, A)] = s_pcfg
                                    embdding[(begin, end, A)] = p
                                    backPointers[(begin, end, A)] = (split, B, C)
                        
    t, s = backtrack(sent, backPointers, terminals, score)
    if t == None:
        outfile.write("None\n")
    else:
        result = t.dostr()
        outfile.write(result+"\n")
```