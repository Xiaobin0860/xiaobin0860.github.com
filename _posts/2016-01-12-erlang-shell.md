---
layout: post
title:  "erlang执行shell"
date:   2016-01-12
categories: erlang
---

os:cmd(Cmd)
-----------

    cmd(Command) -> string()
    Types:
    Command = atom() | io_lib:chars()

erlang:open\_port(PortName, PortSettings)
-----------------------------------------

    open_port(PortName, PortSettings) -> port()
    Types:
    PortName = 
        {spawn, Command :: string() | binary()} |
        {spawn_driver, Command :: string() | binary()} |
        {spawn_executable, FileName :: file:name()} |
        {fd, In :: integer() >= 0, Out :: integer() >= 0}
    PortSettings = [Opt]
    Opt = 
        {packet, N :: 1 | 2 | 4} |
        stream |
        {line, L :: integer() >= 0} |
        {cd, Dir :: string() | binary()} |
        {env, Env :: [{Name :: string(), Val :: string() | false}]} |
        {args, [string() | binary()]} |
        {arg0, string() | binary()} |
        exit_status |
        use_stdio |
        nouse_stdio |
        stderr_to_stdout |
        in |
        out |
        binary |
        eof |
        {parallelism, Boolean :: boolean()} |
        hide

Example
-------

    loop2() ->
        receive
            {build} ->
                io:format("build ...~n"),
                Port = open_port({spawn_executable, "path/build_ios_nolog.sh"}, [stream, exit_status, eof, hide]),
                Result = get_data(Port, []),
                io:format("~p~n", [Result]),
                loop2();
            stop ->
                ok;
            _ ->
                io:format("recv unknown message!~n"),
                loop2()
        end.

    get_data(Port, Sofar) ->
        receive
            {Port, {data, Bytes}} ->
                get_data(Port, [Sofar|Bytes]);
            {Port, eof} ->
                Port ! {self(), close},
                receive
                    {Port, closed} -> true
                end,
                receive
                    {'EXIT',  Port,  _} -> ok
                after 1 -> ok
                end,
                ExitCode =
                receive
                    {Port, {exit_status, Code}} -> Code
                end,
                {ExitCode, lists:flatten(Sofar)}
                %{ExitCode, Sofar}
        end.


