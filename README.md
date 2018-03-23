# fireworks-cool
#### 使用electron的一个烟花小程序。


## 使用 🐌
1. 确保你的系统上拥有`NodeJS`和`electron`，如果没有`electron`请执行下面的命令安装该依赖包.
```sh
npm install -g electron@1.8.3
```

2. 下载该全局包.
```sh
npm install -g fireworks-cool
```
3. 运行程序：成功安装全局包后可以输入下面命令运行程序，windows操作系统使用`win+R`快捷键后输入`CMD`打开DOS界面运行.
```sh
fireworks-cool
```

## 参数 🐍
1. 运行
```sh
fireworks-cool
```
2. 添加文本

假如我们输入文本HelloWorld如下（目前并不支持特殊字符），待提示设置成功后运行程序
```sh
fireworks-cool --test=HelloWorld
```
3. 查看文本列表
```sh
fireworks-cool --list
```
4. 删除某个文本

参数为number类型，就比如使用列表中第一行文本，如下：
```sh
fireworks-cool --delete=1
```
5. 使用列表中某个文本

参数为number类型，就比如使用列表中第五行文本，如下：
```sh
fireworks-cool --use=5
```
6. 清空所有文本
```sh
fireworks-cool --clear
```
> 在你快要出生的时候，输入：上上下下左右左右BABA，这样你一出生就有很多条命还有一份超棒的工作。