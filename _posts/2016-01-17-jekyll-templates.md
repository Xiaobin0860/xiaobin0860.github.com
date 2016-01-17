---
layout: post
title:  "jekyll templates"
date:   2016-01-17
categories: jekyll
---

Variables
---------

Variables are surrounded by `{{` and  `}}` like this:

    My first name is {{ first_name  }}. My last name is {{ last_name  }}.

Tags
----

Tags provide arbitrary logic in the rendering process.

    {% if user.is_authenticated %}Hello, {{ user.username  }}.{% endif %}

Filters
-------

Filters transform the values of variables and tag arguments.

    {{ site.time | date_to_xmlschema  }}

Comments
--------

Comments look like this:

    {# this won't be rendered #}

![大宝]({{ site.url }}/imgs/20160117.jpg)

