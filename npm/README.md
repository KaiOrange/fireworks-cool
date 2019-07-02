# fireworks-cool #

**使用electron构建的一个放烟花的小玩意。**

## 使用 🐌 ##

1. 首先需要确保你的系统上拥有`NodeJS`并且可以运行`npm`命令。

2. 下载全局包（这个过程可能会比较耗时，请耐心等待）。

    ```sh
    npm install -g fireworks-cool
    ```

3. 运行程序。

    ```sh
    fireworks-cool
    ```

## 参数 🐍 ##

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

    参数为number类型，就比如删除列表中第一行文本，如下：

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

> 注：输入`cool`让烟花变得更酷。
