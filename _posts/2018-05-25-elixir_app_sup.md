---
layout: post
title:  "Elixir Application Supervisor"
date:   2018-05-25
categories: elixir
---

## `Application` behaviour

In Elixir (actually, in Erlang/OTP), an application is a component implementing some specific functionality, that can be started and stopped as a unit, and which can be re-used in other systems.

### Start and shutdown

Starting an application is done via the “application module callback”, which is a module that defines the `start/2` function. The `start/2` function should then start a supervisor, which is often called as the top-level supervisor, since it sits at the root of a potentially long supervision tree. When the system is shutting down, all applications shut down their top-level supervisor, which terminates children in the opposite order they are started.

### Application module callback

The first step is to pass the module callback in the application definition in the mix.exs file:

```elixir
def application do
  [mod: {MyApp, []}]
end
```

Our application now requires the `MyApp` module to provide an application callback. This can be done by invoking `use Application` in that module and defining a `start/2` callback, for example:

```elixir
defmodule MyApp do
  use Application

  def start(_type, _args) do
    children = []
    Supervisor.start_link(children, strategy: :one_for_one)
  end
end
```

`start/2` typically returns `{:ok, pid}` or `{:ok, pid, state}` where `pid` identifies the supervision tree and `state` is the application state. `args` is the second element of the tuple given to the `:mod` option.

When an application is shutting down, its `stop/1` callback is called after the supervision tree has been stopped by the runtime. This callback allows the application to do any final cleanup. The argument is the state returned by `start/2`, if it did, or `[]` otherwise. The return value of `stop/1` is ignored.

## `Supervisor` behaviour

A supervisor is a process which supervises other processes, which we refer to as `child processes`. Supervisors are used to build a hierarchical process structure called a `supervision tree`. Supervision trees provide fault-tolerance and encapsulate how our applications start and shutdown.

A supervisor may be started directly with a list of children via `start_link/2` or you may define a module-based supervisor that implements the required callbacks. 

### Examples

As an example, we will define a GenServer that represents a stack. The stack is a small wrapper around lists. It allows us to put an element on the top of the stack, by prepending to the list, and to get the top of the stack by pattern matching.

```elixir
defmodule Stack do
  use GenServer

  def start_link(state) do
    GenServer.start_link(__MODULE__, state, name: __MODULE__)
  end

  ## Callbacks

  @impl true
  def init(stack) do
    {:ok, stack}
  end

  @impl true
  def handle_call(:pop, _from, [h | t]) do
    {:reply, h, t}
  end

  @impl true
  def handle_cast({:push, h}, t) do
    {:noreply, [h | t]}
  end
end
```

We can now start a supervisor that will start and supervise our stack process. The first step is to define a list of `child specifications` that control how each child behaves. Each child specification is a map, as shown below:

```elixir
children = [
  # The Stack is a child started via Stack.start_link([:hello])
  %{
    id: Stack,
    start: {Stack, :start_link, [[:hello]]}
  }
]

# Now we start the supervisor with the children and a strategy
{:ok, pid} = Supervisor.start_link(children, strategy: :one_for_one)
```

Notice that when starting the GenServer, we are registering it with name Stack, which allows us to call it directly and get what is on the stack:

```elixir
GenServer.call(Stack, :pop)
#=> :hello
GenServer.cast(Stack, {:push, :world})
#=> :ok
GenServer.call(Stack, :pop)
#=> :world
```

### Child specification

The child specification describes how the supervisor start, shutdown and restart child processes.

* `:id` - a value used to identify the child specification internally by the supervisor; defaults to the given module. In case of conflicting `:id`, the supervisor will refuse to initialize and require explicit IDs. This key is required.

* `:start` - a tuple with the module-function-args to be invoked to start the child process. This key is required.

* `:restart` - an atom that defines when a terminated child process should be restarted (see the “Restart values” section below). This key is optional and defaults to `:permanent`.

* `:shutdown` - an atom that defines how a child process should be terminated (see the “Shutdown values” section below). This key is optional and defaults to 5000 if the type is `:worker` or `:infinity` if the type is `:supervisor`.

* `:type` - if the child process is a `:worker` or a `:supervisor`. This key is optional and defaults to `:worker`.

There is a sixth key, called `:modules`, which is rarely changed and it is set automatically based on the value in `:start`.

---

![大宝]({{ site.url }}/imgs/20180525.jpg)
