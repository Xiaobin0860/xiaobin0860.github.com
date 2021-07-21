---
layout: post
title:  "Elixir String Manipulation"
date:   2018-05-05
categories: elixir
---

To get the list of string that compose a longer string, use String.codepoints/1

```elixir
iex(1)> String.codepoints("你好a")
["你", "好", "a"]
```

To get the list of codepoints that represent each letter in the string, use String.to_charlist/1

```elixir
iex(2)> String.to_charlist("你好a")
[20320, 22909, 97]
```

---

![大宝]({{ site.url }}/imgs/20180505.jpg)
