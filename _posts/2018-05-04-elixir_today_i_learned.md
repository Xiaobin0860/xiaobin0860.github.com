---
layout: post
title:  "Elixir - with"
date:   2018-05-04
categories: elixir
---

## [macrowith(args)](https://hexdocs.pm/elixir/Kernel.SpecialForms.html#with/1)

Used to combine matching clauses.
```
iex> opts = %{width: 10, height: 15}
iex> with {:ok, width} <- Map.fetch(opts, :width),
...>      {:ok, height} <- Map.fetch(opts, :height),
...>      do: {:ok, width * height}
{:ok, 150}
```
If all clauses match, the `do` block is executed, returning its result. Otherwise the chain is aborted and the non-matched value is returned.

Guards can be used in patterns as well:
```
iex> users = %{"melany" => "guest", "bob" => :admin}
iex> with {:ok, role} when not is_binary(role) <- Map.fetch(users, "bob"),
...>      do: {:ok, to_string(role)}
{:ok, "admin"}
```

---

![大宝]({{ site.url }}/imgs/20180427.png)
