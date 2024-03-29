<h1 align="center">halo-comment-dream</h1>

<p align="center">
<a href="https://github.com/nineya/halo-comment-dream/releases"><img alt="releases" src="https://img.shields.io/github/release/nineya/halo-comment-dream.svg?style=flat-square"/></a>
<a href="https://github.com/nineya/halo-comment-dream/blob/master/LICENSE"><img alt="license" src="https://img.shields.io/github/license/nineya/halo-comment-dream?style=flat-square"/></a>
<a href="https://github.com/nineya/halo-comment-dream/releases"><img alt="downloads" src="https://img.shields.io/github/downloads/nineya/halo-comment-dream/total.svg?style=flat-square"/></a>
<a href="https://github.com/nineya/halo-comment-dream/releases"><img alt="size" src="https://img.shields.io/github/languages/code-size/nineya/halo-comment-dream?style=flat-square"/></a>
<a href="https://github.com/nineya/halo-comment-dream/commits"><img alt="commits" src="https://img.shields.io/github/last-commit/nineya/halo-comment-dream.svg?style=flat-square"/></a>
<a href="https://github.com/nineya/halo-comment-dream#donate"><img alt="donate" src="https://img.shields.io/badge/$-donate-ff69b4.svg?style=flat-square"/></a>
</p>


> [halo-theme-dream](https://github.com/nineya/halo-theme-dream) 博客主题对应的博客评论组件，适用于 Halo 博客系统。非常完善的一个博客插件，支持图片上传、显示评论弹幕功能。



## 一、预览

![玖涯博客](https://cdn.jsdelivr.net/gh/nineya/halo-comment-dream@master/preview.png)

预览地址：[https://blog.nineya.com](https://blog.nineya.com)



## 二、使用指南

1. 进入后台 -> 系统 -> 博客设置 -> 评论设置
2. 将 `评论模块 JS` 修改为：`https://unpkg.com/halo-comment-dream@latest/dist/halo-comment.min.js`



## 三、自定义配置

如果你需要自定义该评论组件，下面提供了一些属性：

| 属性               | 说明                                                         | 默认值                         | 可选                       |
| ------------------ | ------------------------------------------------------------ | ------------------------------ | -------------------------- |
| autoLoad           | 是否自动加载评论列表                                         | true                           | `true` `false`             |
| showUserAgent      | 是否显示评论者的 UA 信息                                     | true                           | `true` `false`             |
| priorityQQAvatar   | 是否优先展示QQ头像                                           | false                          | `true` `false`             |
| getQQInfo          | 昵称输入框输入QQ号自动获取QQ昵称和邮箱                       | false                          | `true` `false`             |
| commentHtml        | 开启html内容，启用后有被 `XSS` 恶意代码注入的风险，建议同时开启评论审核。 | false                          | `true` `false`             |
| loadingStyle       | 评论加载样式                                                 | `default`                      | `default` `circle` `balls` |
| unfoldReplyNum     | 评论的回复列表默认展开的回复数量                             | 10                             | 大于 0 的正整数            |
| night              | 评论模块以黑暗模式初始化样式                                 | `localStorage` 中 `night` 的值 | `true` `false`             |
| replyDescSoft      | 评论的二级回复是否采用按时间从晚到早排序                     | false                          | `true` `false`             |
| enableImageUpload  | 开启评论区图片上传功能                                       | false                          | `true` `false`             |
| enableBulletScreen | 开启评论弹幕                                                 | false                          | `true` `false`             |
| imageUploadApi     | 接受图片上传的后端 `api` 地址                              | undefined | `url` 路径               |
| anonymousUserName | 匿名评论的用户昵称，配置后允许用户匿名评论 | undefined | 用户名 |
| avatarLoading      | 头像加载动画                                                 | `assets/img/loading.svg`       | 图片路径                   |
| enableBloggerOperation| 如果博主已登录，允许博主直接在评论区进行操作                  | false              | `true` `false`            |
| defaultAvatar      | 默认头像，当头像加载失败时显示                               | `assets/img/avatar.svg`        | 图片路径                   |



配置方法：

在引入评论组件的页面加上：

```javascript
<script>
var configs = {
    autoLoad: true,
    showUserAgent: true
}
</script>
```

修改评论组件标签加上：

```html
:configs="configs"
```

示例：

```html
<halo-comment id="${post.id?c}" type="post" :configs="configs">
```

```html
<halo-comment id="${sheet.id?c}" type="sheet" :configs="configs">
```

```html
<halo-comment id="${journal.id?c}" type="journal" :configs="configs">
```



## 四、使用指南

### 4.1 Vue 方式

> 适用于基于 `Vue` 开发的主题，否则不能通过 `:configs` 的方式指定配置

新建 comment.ftl：

```html
<#macro comment target,type>
    <#if !post.disallowComment!false>
        <script src="//cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.min.js"></script>
        <script src="${options.comment_internal_plugin_js!'//unpkg.com/halo-comment-dream@latest/dist/halo-comment.min.js'}"></script>
        <script>
        var configs = {
            autoLoad: true,
            showUserAgent: true
        }
        </script>
        <halo-comment id="${target.id?c}" type="${type}" :configs="configs"/>
    </#if>
</#macro>
```

然后在 `post.ftl` / `sheet.ftl` 中引用：

post.ftl：

```html
<#include "comment.ftl">
<@comment target=post type="post" />
```

sheet.ftl：

```html
<#include "comment.ftl">
<@comment target=sheet type="sheet" />
```



### 4.2普通方式

> 非 `Vue` 则需要直接将 `JSON` 格式的配置写入到 `configs` 属性。

新建 comment.ftl：

```html
<#macro comment target,type>
    <#if !post.disallowComment!false>
        <script src="//cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.min.js"></script>
        <script src="${options.comment_internal_plugin_js!'//unpkg.com/halo-comment-dream@latest/dist/halo-comment.min.js'}"></script>
        <halo-comment id="${target.id?c}" type="${type}" configs='{"autoLoad": true,"showUserAgent": true}'/>
    </#if>
</#macro>
```

然后在 `post.ftl` / `sheet.ftl` 中引用：

post.ftl：

```html
<#include "comment.ftl">
<@comment target=post type="post" />
```

sheet.ftl：

```html
<#include "comment.ftl">
<@comment target=sheet type="sheet" />
```



## 五、进阶配置

### 5.1 通过主题进行配置

可以将 `configs` 中的属性通过 `settings.yaml` 保存数据库中，以供用户自行选择，如：

settings.yaml：

```yaml
...

comment:
  label: 评论设置
  items:
    autoLoad:
      name: autoLoad
      label: 自动加载评论
      type: radio
      data-type: bool
      default: true
      options:
        - value: true
          label: 开启
        - value: false
          label: 关闭
    showUserAgent:
      name: showUserAgent
      label: 评论者 UA 信息
      type: radio
      data-type: bool
      default: true
      options:
        - value: true
          label: 显示
        - value: false
          label: 隐藏

...
```

那么我们需要将上面的 script 改为下面这种写法：

```javascript
<script>
var configs = {
    autoLoad: ${settings.autoLoad!},
    showUserAgent: ${settings.showUserAgent!}
}
</script>
```



### 5.2 使用明亮/黑暗模式

评论模块支持明亮和黑暗两种模式，默认通过 `localStorage` 中 `night` 的值来初始化评论模块的模式。

动态切换模式的 `js` 方法：

```javascript
// isNight为要切换到的模式，true表示黑暗模式
isNight = true 
$("halo-comment").each(function () {
    const shadowDom = this.shadowRoot.getElementById("halo-comment");
    $(shadowDom)[`${isNight ? "add" : "remove"}Class`]("night");
})
// 存储模式配置，用于打开网页时评论区的初始化
localStorage.setItem('night', isNight);
```



### 5.3 实现图片上传

本插件支持文件上传功能，后端文件上传接口需要基于以下报文格式实现。

- 请求类型：`POST`

- 请求报文（`multipart/form-data`）：

| 参数  | 说明                 |
| :---: | -------------------- |
| image | 上传图片文件的文件流 |

- 响应报文（`application/json`）：

|    参数     | 说明                               |
| :---------: | ---------------------------------- |
| code/status | 错误状态码，响应成功的码值为 `200` |
|   message   | 错误信息                           |
|  data.name  | 文件名                             |
|  data.url   | 访问图片的url                      |



### 5.4 暂停弹幕

允许主题通过 `stop-bullet-screen` 属性暂停弹幕，添加该属性后弹幕将被暂停，删除属性后可继续进行属性轮播。

实现示例如下：

```javascript
const applyStopBulletScreen = (stopBulletScreenValue) => {
    $('halo-comment[bullet-screen]').each(function () {
    const shadowDom = this.shadowRoot.getElementById("halo-comment");
    if (stopBulletScreenValue) {
      $(shadowDom).attr('stop-bullet-screen', 'true');
    } else {
      $(shadowDom).removeAttr('stop-bullet-screen');
    }
  })
  localStorage.setItem('stop-bullet-screen', stopBulletScreenValue);
}
$bulletScreen.on('click', () => {
  let stopBulletScreen = localStorage.getItem('stop-bullet-screen') || false;
  applyStopBulletScreen(stopBulletScreen.toString() !== 'true')
});
```



### 5.5 设置主题色

评论模块支持为明亮/黑暗模式分别指定一个主题色，默认明亮模式的主题色为 `#50bfff`，黑暗模式的主题色为 `#5d93db`，你可以通过 `--theme` 属性在你的主题指定一个主题色。

```css
html {
  --theme: #50bfff;
}
```



## 六、说明

1. configs 可以不用配置。
2. 具体主题开发文档请参考：<https://halo.run/develop/theme/ready.html>。



## 七、打赏项目

感谢您对本项目的喜爱，您的打赏是对本项目最好的支持！本项目所有打赏收益将全部投入到支付宝公益项目，捐赠记录在[关于我的](https://blog.nineya.com/about)中可见，一起为公益事业加油。

![打赏项目](https://blog.nineya.com/upload/2022/08/funding.png)
