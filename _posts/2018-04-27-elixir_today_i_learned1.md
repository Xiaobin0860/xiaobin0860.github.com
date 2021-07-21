---
layout: post
title:  "Elixir - Today I Learned"
date:   2018-04-27
categories: elixir phoenix
---

## 1. Elixir with macro `<-` and `=`

[with macro]: https://hexdocs.pm/elixir/Kernel.SpecialForms.html#with/1

So Elixir [with macro] accepts **Matching clauses** `<-` and **Bare expressions** `=`. Both match patterns and do not leak variables assigned inside these structures.

```elixir
with {:ok, width} <- Map.fetch(%{width: 10}, :width),
  do: {:ok, 2 * width}
#=> {:ok, 20}

with {:ok, width} = Map.fetch(%{width: 10}, :width),
  do: {:ok, 2 * width}
#=> {:ok, 20}
```

So what is the difference between these?

When a match fails, matching clauses `<-` returns **failed result** but bare expressions `=` raises a `MatchError`:

```elixir
with {:ok, width} <- Map.fetch(%{height: 10}, :width),
  do: {:ok, 2 * width}
#=> :error

with {:ok, width} = Map.fetch(%{height: 10}, :width),
  do: {:ok, 2 * width}
#=> ** (MatchError) no match of right hand side value: :error
```

Another difference is that `when` guard is only available for matching clause.

```elixir
with {:ok, width} when is_number(width) <- Map.fetch(%{width: 10}, :width),
  do: {:ok, 2 * width}
#=> {:ok, 20}
```

## 2. Binary pattern matching

You might be familiar with the most popular form of Elixir pattern matching involving tuples:

``` elixir
iex > {:ok, x} = {:ok, 1000}
{:ok, 1000}
iex > x
1000
```

You can also pattern match binaries:

``` elixir
iex > <<1, y, 2>> = <<1, 255, 2>>
<<1, 255, 2>>
iex > y
255
```

This gets powerful when you're able to match binary formats.

``` elixir
iex > <<x :: binary-1, y :: binary-2, z :: binary>> = <<1, 255, 254, 2>>
<<1, 255, 254, 2>>
iex > x
<<1>>
iex > y
<<255, 254>>
iex > z
<<2>>
```

Here's an [article](http://www.zohaib.me/binary-pattern-matching-in-elixir/) about using binary pattern matching to parse a png file.

## 3. Word Lists For Atoms

The `~w` sigil allows you to create a list of words (i.e. strings).

```elixir
> ~w(one two three)
["one", "two", "three"]
```

It sets itself apart though with some modifiers. The default behavior
matches the `s` modifier (for strings).

```elixir
> ~w(one two three)s
["one", "two", "three"]
```

Where it gets more interesting is with the `a` modifier allowing you to
create a list of atoms.

```elixir
> ~w(one two three)a
[:one, :two, :three]
```

Note: there is a third modifier, `c`, for char lists.

```elixir
> ~w(one two three)c
['one', 'two', 'three']
```

[source](http://elixir-lang.org/getting-started/sigils.html)

## 4. Find and Open Port with Elixir

```elixir
iex(1)> {:ok, port} = :gen_tcp.listen(0, []) #listen on an available port
{:ok, #Port<0.1465>}
iex(2)> {:ok, port_number} = :inet.port(port) #get the port number of that port
{:ok, 63470}
iex(3)> port_number #here is the port number!
63470
iex(4)> Port.close port #go ahead and close that port if you want
true
```

## 5. Virtual Fields With Ecto Schema

If you'd like to include a particular key-value pair in an Ecto changeset,
it needs to be included as a field in the schema. In the case of something
akin to a password field, you want to be able to perform validations against
it, but the password itself does not have a column in the database. In other
words, you want to use the password in memory as part of the validation
process but not save it to the database. To accomplish this, you need to
specify that it is a `virtual` field.

```elixir
schema "users" do
  field :username, :string
  field :password_digest, :string
  field :password, :string, virtual: true
end
```

With that schema, you can then validate the `:password` and transform it
into the corresponding `:password_digest` field.

```elixir
def registration_changeset(model, params) do
  model
  |> changeset(params)                  # do other standard validations
  |> cast(params, [:password])          # include :password in the changeset
  |> validate_length(:password, min: 8) # validations
  |> put_pass_hash()                    # transform into :password_digest
end
```
Mix xref and Elixir compiler warnings

The [release](https://elixir-lang.org/blog/2016/06/21/elixir-v1-3-0-released/) of Elixir v1.3 added a mix task called `xref` for performing cross reference checks of your code. `mix xref` gives us some handy tools!

## 6. Find unreachable code:

```sh
❯ mix xref unreachable
lib/exonk8s/foo.ex:16: SomeModule.non_existant/0
```

Find callers of modules and functions:
```sh
❯ mix xref callers SomeModule
lib/exonk8s/foo.ex:16: SomeModule.non_existant/0
```

Generate a dependency graph:
```sh
> mix xref graph
lib/exonk8s.ex
├── lib/exonk8s/repo.ex
└── lib/router.ex
    └── lib/exonk8s/musician_controller.ex (compile)
        ├── lib/exonk8s/foo.ex
        ├── lib/exonk8s/musician.ex
        └── lib/exonk8s/repo.ex
...snipped for brevity
```

The [release](https://elixir-lang.org/blog/2018/01/17/elixir-v1-6-0-released/) of Elixir v1.6 added the module attribute `@deprecated` to enable library authors to warn users of deprecated functions.

```sh
❯ mix xref deprecated
Compiling 2 files (.ex)
Foo Loaded
warning: ExOnK8s.Foo.lazy/0 is deprecated. You should be more eager.
  lib/exonk8s/musician_controller.ex:10

lib/exonk8s/musician_controller.ex:10: ExOnK8s.Foo.lazy/0
```

Lastly I should note that `xref deprecated` and `xref unreachable` are included in the compiler warnings, so you you've likely seen these at work even if you didn't know they were there.

[Learn more](https://hexdocs.pm/mix/Mix.Tasks.Xref.html#content)

## 7. View your outdated packages

To see which packages in a mix app need updating, you can run `mix hex.outdated`

```shell
$ mix hex.outdated
Dependency           Current  Latest  Update possible
appsignal            1.3.2    1.3.3   Yes
basic_auth           2.1.4    2.1.4
cachex               2.1.0    2.1.0
...
```
It prints out a handy table letting you quickly view the current and latest versions and if they can be updated. If `Update possible` is `No`, check your semantic version lockdown of that package in `mix.exs`. 

`mix hex.outdated` accepts a few arguments:

  *  `--all`  which shows all outdated packages, including children of packages defined in mix.exs
  * `--pre` which include pre-releases when checking for newer versions (be adventurous!)

  Visualize Your Elixir Dependencies

## 8. To visualize your Elixir dependencies, try this:

```sh
$ mix deps.tree
```

This prints a tree showing your dependencies (and their dependencies):

```sh
$ mix deps.tree
tilex
├── gettext ~> 0.13 (Hex package)
├── hackney 1.8.0 (Hex package)
│   ├── certifi 1.1.0 (Hex package)
│   ├── idna 4.0.0 (Hex package)
│   ├── metrics 1.0.1 (Hex package)
│   ├── mimerl 1.0.2 (Hex package)
│   └── ssl_verify_fun 1.1.1 (Hex package)
```

## 9. Phoenix will watch your JS for you, just watch!

With es6 javascript ecosystems most compilation/transpilation is done with watchers, programs that watch for changes in your code and then trigger compilation based on the changes you've made.

Phoenix has a method of integrating those watchers into the server itself.

``` elixir
config :myapp, MyApp.Endpoint,
  watchers: [yarn: ["run", "watch", cd: Path.expand("../assets", __DIR__)]]
```

The above configuration goes in `config/dev.exs` and runs the watch command whenever you start the server/endpoint.  The keyword option `cd` is as of yet undocumented, but does what you think it does, changes the directory to the path you configure, which by convention in Phoenix 1.3 would be the assets directory.  `cd` is the only keyword option.

The watchers start when you run your server.  Just make a change to your javascript and refresh the page!

## 10. Setting breaks in IEx for debugging

With the release of Elixir 1.5 comes some handy new IEx helpers, one of which is the ability to add break points throughout your code. 

You can add a break to any function using `break!/2` or `break!/4`:
```elixir
defmodule MyModule do
  def hello(name) do
    "hello " <> name
  end
end
```
```shell
iex(1)> break!(MyModule.hello/ 1)
or
iex(1)> break!(MyModule, :hello, 1)
```
Both `break/2` and `break/4` accept an additional argument for how many stops you want to make. Useful for recursive functions where you may want to stop multiple times. 

To see what breaks you have use  `breaks/0`
```shell
iex(1)> breaks()
 ID   Module.function/arity   Pending stops
---- ----------------------- ---------------
 1    MyModule.hello/1        1
```
Now when you call the function, you'll be placed into the a debugger and you can inspect whats being passed in:
```shell
iex(4)> MyModule.hello("world")
Break reached: MyModule.hello/1 (lib/my_module.ex:2)
    1: defmodule MyModule do
    2:   def hello(name) do
    3:     "hello " <> name
    4:   end
pry(1)> name
"world"
```
To exit the break and start a new shell process use `respawn/0`
```shell
pry(2)> respawn
Interactive Elixir (1.5.0) - press Ctrl+C to exit (type h() ENTER for help)
"hello world"
iex(1)>
```

---

![大宝]({{ site.url }}/imgs/20180427.png)
