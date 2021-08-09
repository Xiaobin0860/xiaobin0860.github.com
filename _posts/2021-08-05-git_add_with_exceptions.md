---
layout: post
title: "Git Add"
date: 2021-08-03
categories: git
---

Add a folder to git with exceptions

Given this folder structure:

```
app
├── bin
│  └── parse-ansi-codes.rs
├── Cargo.lock
├── Cargo.toml
├── README.md
├── src
│  ├── cursor.rs
│  ├── lib.rs
│  └── style.rs
├── target
│  └── debug
└── test
```

I can add the entire `app` directory to git, while ignoring the bin folder:

```
$ git add . ':!bin'
```

---

![宝]({{ site.url }}/imgs/20210805.jpg)
