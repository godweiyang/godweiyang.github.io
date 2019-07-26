---
title: Latex撰写论文常用技巧总结
date: 2019-01-13 17:34:07
top: true
cover: false
password:
toc: true
mathjax: true
summary:
tags:
- LaTeX
categories:
- 软件安装与配置
---

<div align="middle"><iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=28636660&auto=1&height=66"></iframe></div>

这篇博文专门用来记录Latex写论文过程中遇到的一些技巧与心得。

# 插入矢量图片
---
首先在Office PowerPoint中画好模型图，然后有两种方法在Latex中插入矢量图。
![](1.jpg)
**方法一：**
直接另存为pdf，例如存为`figure.pdf`。
![](2.jpg)
注意到pdf打开来左右两个侧边栏有较大的空余空间，所以最好在ppt中绘制模型图的时候就调整好。
然后在Latex中使用如下代码插入pdf图片即可：
```latex
\begin{figure*}[htbp]
    \centering
    \includegraphics[width=\textwidth]{figure.pdf}
    \caption{ Model. }
    \label{fig::model}
\end{figure*}
```
其中参数`width=\textwidth`是用来调整图片宽度，使得图片占满整个论文，效果如下：
![](3.jpg)
注意到这里左右两个侧边栏间距的确有点大了，没有占满整个页面。
如果想要图片只显示在一半的页面上，那么只需要用如下代码即可：
```latex
\begin{figure}[htbp]
    \centering
    \includegraphics[width=\linewidth]{figure.pdf}
    \caption{ Model. }
    \label{fig::model}
\end{figure}
```
效果如下：
![](4.jpg)

**2019.1.14更新：**
关于生成出来的模型图pdf侧边距过大的问题，可以下载“迅捷pdf编辑器”，使用它强大的页面裁剪功能。当然非会员会留下水印，只需要修改水印透明度为0即可。

**方法二：**
ppt绘制好的模型图右键另存为`emf`格式，这是一种Windows的矢量图格式，然后下载一款软件叫`Metafile to EPS Converter`[地址](http://wiki.lyx.org/uploads/Windows/metafile2eps/metafile2eps.exe)，将图片转为Latex支持的`eps`格式，例如命名为`figure.eps`。

最后在Latex使用相同的代码插入图片即可，效果如下：
![](5.jpg)
可以看出两侧间距比原来小了很多。

**2019.3.6更新：**
# 中文支持
---
```latex
\usepackage{CJK}

\begin{document}
\begin{CJK*}{GBK}{song}

% 正文

\end{CJK*}
\end{document}
```

# 图片
---
**单幅图片：**
```latex
\begin{figure}[htbp]
    \centering
    \includegraphics[width=\linewidth]{figure.pdf}
    \caption{xxxxx.}
    \label{Fig:xxxxx}
\end{figure}
```
跨双栏的话把`figure`改成`figure*`，`htbp`控制位置，自己看着调。

难点是跨双栏图片置顶，一般情况下会自动跑到下一页去，找了半天才找到解决方法：
```latex
\twocolumn[{
    \renewcommand\twocolumn[1][]{#1}
    \begin{center}
        \centering
        \includegraphics[width=\textwidth]{figure.pdf}
        \captionof{xxxxx.}
    \end{center}
}]
```
缺点是无法添加`label`，正文只能手动加引用了。

**两幅图片同一行显示：**
```latex
\begin{figure*}[htbp]
    \centering
    \subfigure[fig1.]{
        \begin{minipage}[t]{0.58\textwidth}
        \includegraphics[width=\textwidth]{figure1.pdf}
        \end{minipage}
        \label{Fig:fig1a}
    }
    \subfigure[fig2.]{
        \begin{minipage}[t]{0.34\textwidth}
        \includegraphics[width=\textwidth]{figure2.pdf}
        \end{minipage}
        \label{Fig:fig1b}
    }
    \caption{xxxxx.}
    \label{Fig:fig1}
\end{figure*}
```
注意的是，两个图片宽度之和`0.58 + 0.34 = 0.92`要尽量小于1，不然会显示出问题。

# 伪代码
---

```latex
\renewcommand{\algorithmicrequire}{ \textbf{Input:}}
\renewcommand{\algorithmicensure}{ \textbf{Output:}}

\begin{algorithm}[t]
    \caption{ alg1. }\label{Alg:Alg1}
    \begin{algorithmic}[1]
        \Require
            % 输入
        \Ensure
            % 输出
        % 过程
        \Function {xxxxxx}{$i, j$}
            % 函数体
        \EndFunction
    \end{algorithmic}
\end{algorithm}
```

# 表格
---

```latex
\newcommand{\tabincell}[2]{\begin{tabular}{@{}#1@{}}#2\end{tabular}}

\begin{table}[t]
\normalsize
\begin{center}
\begin{tabular}{l|l|ccc}

\hline
\multicolumn{2}{c|}{Model} & LR & LP & F1\\

\hline\hline

\end{tabular}
\end{center}
\caption{ xxxxx.}
\label{Tab:CompDiffConfig}
\end{table}
```

两个难点，一个是合并同一行的单元格，用`\multicolumn{cols}{pos}{text}`。

一个是合并同一列的单元格，用：
```latex
\begin{table}
    \centering
    \begin{tabular}{|c|c|c|c|}
        \hline
        \multirow{2}*{合并两行一列} & 二 & 三 & 四 \\
        ~ & 2 & 3 & 4 \\
        \hline
    \end{tabular}
\end{table}
```
注意第二行第一列要用`~`补上空位。用`\cline{start-end}`来代替`\hline`划线。

**暂时就想到这些了，等想到了再更吧，祝我paper顺利。**