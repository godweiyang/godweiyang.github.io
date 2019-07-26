---
title: Sublime Text安装与配置教程
date: 2017-10-02 13:27:35
top: false
cover: false
password:
toc: true
mathjax: true
summary:
tags:
- Sublime
categories:
- 软件安装与配置
---

Sublime Text是我一直使用的代码编辑器，我喜爱它的原因就是好看啊！当然打开速度毋庸置疑啦，毕竟不是IDE。这里我把我的安装与配置步骤教给大家，如有未尽之处，大家自己摸索咯，也欢迎与我交流。
先附上一张美图：
![](sublime.png)
# 安装Sublime Text 3
---
下载地址请点击[这里](https://download.sublimetext.com/Sublime%20Text%20Build%203143%20x64%20Setup.exe)。
安装过程就不多说了，一直点`next`就行了。

# 配置C++运行环境
---
装完后可以直接写代码了，但是不能运行C++的哦，还需要配置运行环境。
* 首先要安装C++的编译器MinGW，可以直接去官网下（[传送门](http://www.mingw.org/)）。不过我自己是直接下的CodeBlocks（[传送门](https://downloads.sourceforge.net/project/codeblocks/Binaries/16.01/Windows/codeblocks-16.01mingw-setup.exe)），然后用的自带的MinGW。
* 装完编译器之后在`我的电脑`右键，依次点击`属性 - 高级系统设置 - 环境变量`，在`系统变量`中找到`Path`，编辑它，新建一条，添加MinGW路径，以我的为例是`E:\software\codeblocks\MinGW\bin`。
* 打开Sublime Text，依次点击`Tools - Build System - new Build System`，粘贴以下代码：
```
{
	"encoding": "utf-8",
	"working_dir": "$file_path",
	"shell_cmd": "g++ -Wall -std=c++11 \"$file_name\" -o \"$file_base_name\"",
	"file_regex": "^(..[^:]*):([0-9]+):?([0-9]+)?:? (.*)$",
	"selector": "source.c++",
 
	"variants": 
	[
		{	
		"name": "Run",
        	"shell_cmd": "g++ -Wall -std=c++11 \"$file\" -o \"$file_base_name\" && start cmd /c \"\"${file_path}/${file_base_name}\" & pause\""
		}
	]
}
```
* 然后`ctrl+s`保存，命名为c++11。

这时候随便写一个C++代码，然后`Tools - Build System`选择`c++11`，然后按`ctrl+b`就可以运行啦。
我这配置的是控制台运行的C++，所以支持输入数据的哦！

# 配置Java运行环境
---
* 首先下载Java的编译器jdk（[传送门](http://download.oracle.com/otn-pub/java/jdk/9+181/jdk-9_windows-x64_bin.exe)），安装过程就不说了。
* 环境变量应该不用自己添加了，安装过程会帮你自动添加。
* 打开Sublime Text，依次点击`Tools - Build System - new Build System`，粘贴以下代码：
```
{
	"cmd": ["javac","-d",".","$file"],
	"file_regex": "^(...*?):([0-9]*):?([0-9]*)",
	"selector": "source.java",
	"encoding":"cp936",
	//执行完上面的命令就结束
	// 下面的命令需要按Ctrl+Shift+b来运行
	"variants":
	[
		{
			"name": "Run",
			"shell": true,
			"cmd" : ["start","cmd","/c", "java ${file_base_name} &echo. & pause"],
 			//c是执行完命令后关闭cmd窗口,
			//k是执行完命令后不关闭cmd窗口。
			// echo. 相当于输入一个回车
			// pause命令使cmd窗口按任意键后才关闭
			"working_dir": "${file_path}",
			"encoding":"cp936"
		}
	]
}
```
* 然后`ctrl+s`保存，命名为JavaC。

这时候随便写一个Java代码，然后`Tools - Build System`选择`JavaC`，然后按`ctrl+b`就可以运行啦。
我这配置的是控制台运行的Java，所以支持输入数据的哦！

# 配置Python运行环境
---
* 强烈推荐配合Python发行版本Anaconda使用，下载地址（[传送门](https://www.anaconda.com/download/)），下载速度有点慢，推荐使用迅雷下载。安装过程就不多说了。一定要记得安装过程中有一步添加系统变量一定要勾上！
* 然后...就没有然后了，Python运行环境安装就是这么简单，直接按`ctrl+b`就能运行了，但是不支持输入数据哦，想要输入数据的话要安装`Sublime REPL`插件，请看后面的教程。

# 安装插件
Sublime Text的强大之处就是可以安装各种插件满足你的需求。
安装过程很简单：
* 首先要安装插件管理工具`Package Control`，按`ctrl+shift+p`，输入`Install Package`，按回车，等待安装完毕。
* 然后`Preferences`选项菜单就会出现`Package Control`子菜单。
* 然后按`ctrl+shift+p`，输入各种插件名称就能安装啦。

下面推荐几个我使用的插件，其他的可以自行百度搜索。
* Anaconda
这个需要你先安装了Anaconda，然后可以提供各种强大的功能，比如代码提示、函数文档查询、代码风格纠正等等。
* SublimeREPL
这个是为了Python输入数据准备的插件，装完之后点击`Preferences - Key Bindings`，在`User`文件里粘贴以下代码：
	```
	[ 
		{ "keys": ["f5"],
			"caption": "SublimeREPL: Python - RUN current file",
			"command": "run_existing_window_command", "args":
			{
				"id": "repl_python_run",
				"file": "config/Python/Main.sublime-menu"
			}
		}
	]
	```
	然后运行Python代码时直接按`F5`就行啦！
下面两个随意装。
* SublimeHighLight
装完之后选中你要复制的代码，右键`Copy as RTF`，然后粘贴到Word里就会保留代码格式，很漂亮的啊！
* ConvertToUTF8
这是为了某些中文显示准备的插件，貌似不怎么用得到，随意装吧。

我用的就这些啦，Sublime Text写代码还是很方便的，现在基本不用其他的IDE了，能少打开一个软件是一个嘛。

# 快捷键
---
直接递上[传送门](http://www.jb51.net/softjc/180873.html)。

# sublime配置
**Settings:**
```
{
	"color_scheme": "Packages/Color Scheme - Default/Monokai.sublime-color-scheme",
	"font_options":
	[
		"gdi"
	],
	"font_size": 14,
	"ignored_packages":
	[
		"Vintage"
	],
	"theme": "Adaptive.sublime-theme",
	"translate_tabs_to_spaces": true,
	"expand_tabs_on_save": true,
	"tab_size": 4,
}
```

**Anaconda Settings User:**
```
{
	"python_interpreter": "E:/software/anaconda/python.exe",
	"suppress_word_completions": false,
	"suppress_explicit_completions": false,
	"complete_parameters": true,
	"complete__all_parameters": true,
	"anaconda_linting": false,
	"swallow_startup_errors": true,
	"auto_formatting": true,
	"enable_docstrings_tooltip": true,
	"enable_signatures_tooltip": true,
	"display_signatures": true,
}
```
