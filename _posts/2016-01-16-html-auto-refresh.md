---
layout: post
title:  "Auto-Refresh code in HTML"
date:   2016-01-16
categories: html
---

use meta tag
------------

    <meta http-equiv="refresh" content="5">
    Please within the `head` tag of your html document, this `meta` tag  
    will instruct the browser to refresh every `5` seconds.

AutoBuild系统中我想有个页面能够一直看到当前项目的状态，先用着这个方法去定时查询。
以后看有没有办法实现通知。^\_^

click to refresh
----------------

    <body onclick="window.location.reload();">
        ...
    </body>

scroll to bottom
----------------

    window.scrollTo(0, document.body.scrollHeight);

![大宝]({{ site.url }}/imgs/20160116.jpg)
