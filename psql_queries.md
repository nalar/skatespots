create table users (
id serial primary key,
username text,
password text,
email text,
firstname text,
lastname text,
location array
);

create table spots (
id serial primary key,
name text,
type text,
location array,
photo text,
description text,
videolink array,
author integer references users
);