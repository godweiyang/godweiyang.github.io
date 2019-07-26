---
title: Ubuntu16.04下Nvidia+Cuda8.0+Dynet安装教程
date: 2018-03-09 00:31:12
top: false
cover: false
password:
toc: true
mathjax: true
summary:
tags:
- Dynet
- Cuda
- Ubuntu
categories:
- 软件安装与配置
---

<div align="middle"><iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=28936057&auto=1&height=66"></iframe></div>

之前也在笔记本上装过几次cuda，均以失败告终，网上的教程都没有完全能拿来用的，多多少少都会出现一些问题。
这次终于完完全全安装成功了，可喜可贺。。。说起来都是泪。

注意显卡驱动安装最新版就行了，但是cuda最好还是别安装最新版了，装个8.0版本吧，不然都是泪。

最终版本为ubuntu16.04 + cuda8.0 + gcc5.4。

# NVIDIA驱动安装
---

进入[NVIDIA官网](http://www.nvidia.com/Download/index.aspx?lang=en-us)，选择适合自己显卡的驱动，下载后是一个.run文件。

清除之前安装过的NVIDIA：`sudo apt-get remove --purge nvidia*`

禁止nouveau等驱动：`sudo gedit /etc/modprob.d/blacklist.conf`



加入下列语句并保存：
```
blacklist vga16fb
blacklist nouveau
blacklist rivafb
blacklist nvidiafb
blacklist rivatv
```

执行`sudo update-initramfs -u`并重启`reboot`。

按`ctrl+alt+f1`，登录命令行界面。

执行`sudo service lightdm stop`

进入NVIDIA.run目录，运行`sudo sh ./NVIDIA.run –no-x-check –no-nouveau-check –no-opengl-files`

安装过程中会报错，直接无视。会问你要不要自动更新X配置文件，选择是就行了。

重启。输入`sudo nvidia-smi`或者`nvidia-settings`，如果显示显卡信息，那么恭喜你安装成功了。

# CUDA安装
---

进入[cuda官网](https://developer.nvidia.com/cuda-toolkit)，根据自己版本下载cuda.run文件。

执行`sudo sh cuda.run`，注意中间问你要不要安装驱动程序，选择no

执行`sudo gedit /etc/profile`
添加下列语句并保存：
```
export PATH=/usr/local/cuda-8.0/bin:$PATH
export LD_LIBRARY_PATH=/usr/local/cuda-8.0/lib64$LD_LIBRARY_PATH
```

重启，打开`/NVIDIA_CUDA-8.0_Samples/1_Utilities/deviceQuery`

执行``sudo make``和``./deviceQuery``，如果出现显卡信息，那么cuda安装成功了。

# Dynet安装
---

首先安装Anaconda，过程就不说了，直接运行shell脚本就行了。

然后重要的地方来了，创建虚拟环境，在虚拟环境里安装dynet！！！

执行
```
conda create --name python2 python=2 cython numpy
source activate python2
```

然后CPU版本的话很简单，直接执行`pip install dynet`就行了。

GPU版本执行`BACKEND=cuda pip install git+https://github.com/clab/dynet#egg=dynet -i https://pypi.tuna.tsinghua.edu.cn/simple`。

然后就成功啦，但是运行dynet程序的时候还是会报错，找不到libcudart库，这时执行下面三条语句就行了：
```
sudo cp /usr/local/cuda-8.0/lib64/libcudart.so.8.0 /usr/local/lib/libcudart.so.8.0 && sudo ldconfig
sudo cp /usr/local/cuda-8.0/lib64/libcublas.so.8.0 /usr/local/lib/libcublas.so.8.0 && sudo ldconfig
sudo cp /usr/local/cuda-8.0/lib64/libcurand.so.8.0 /usr/local/lib/libcurand.so.8.0 && sudo ldconfig
```

然后终于可以运行了，感动哭了。。。