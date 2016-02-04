---
layout: post
title:  "chicagoboss return json"
date:   2016-02-05
categories: chicagoboss
---

return `{json, Data::proplist()}`

    -module(hhs_realtor_controller, [Req]).
    -compile(export_all).
    -include("hhs_config.hrl").

    register('POST', []) ->
        log:d("register post_params: ~p", [Req:post_params()]),
        Phone = Req:post_param("phone"),
        Pass = Req:post_param("pass"),
        log:d("register: phone=~p, pass=~p", [Phone, Pass]),
        case boss_db:find(realtor, [phone, equals, Phone]) of
            [_SavedRealtor] ->
                log:w("realtor with phone ~p already exists!", [Phone]),
                {json, [{success, false}, {message, "already exists!"}]};
            [] ->
                log:d("create new realotr: phone=~p, pass=~p", [Phone, Pass]),
                NewRealtor = realtor:new(id, Phone, "", user_lib:hash_password(Pass), "", ""),
                case NewRealtor:save() of   %{ok, SavedBossRecord} | {error, [ErrorMessages]}
                    {ok, Saved} ->
                        %{json, #result{success=true, json=Saved}};
                        {json, [{success, true}, {realtor, Saved}]};
                    {error, [Errors]} ->
                        {json, [{success, false}, {message, Errors}]}
                end
        end.

    login('POST', []) ->
        log:d("login post_params: ~p", [Req:post_params()]),
        Phone = Req:post_param("phone"),
        Pass = Req:post_param("pass"),
        log:d("login: phone=~p, pass=~p", [Phone, Pass]),
        case boss_db:find(realtor, [phone, equals, Phone]) of
            [SavedRealtor] ->
                case SavedRealtor:check_password(Pass) of
                    true ->
                        %{json, #result{success=true, json=SavedRealtor}};
                        {json, [{success, true}, {realtor, SavedRealtor}]};
                    false ->
                        %{json, #result{success=false, message="wrong password"}}
                        {json, [{success, false}, {message, "wrong password"}]}
                end;
            [] ->
                log:w("realtor with phone ~p not exists!", [Phone]),
                {json, [{success, false}, {message, "no account"}]}
        end.

