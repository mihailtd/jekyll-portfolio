---
layout: post
title:  "Creating a Message Queue with NodeJS and SQL Server"
date:   2016-10-29 14:24:00 +0300
categories: blog
tags: code database
featured: true
---

> Creating a message queue / dispatcher using NodeJS and SQL Server. 
The system is responsible for checking if it has any new messages to send,
run som sort of building message process and dispatch it to an external system 
via a HTTP POST.

The queue is held in an SQL Server table (of course you could impelemnt this in 
any database engine be it NoSQL or other SQL alternatives). We assume some other system 
inserts data into this table and updates a flag when a message should be queued for sending.

Let's define the schema: 
| ID | UserID | Message | ToSend | Status |
|----|:------:|:-------:|:------:|-------:|

Where ID is an auto incrementing identifier for an entry in this table. 
Lets asume these are some alerts or some kind of messages that should be sent to a user, 
so the UserID column provides this link.
The Message column will be the body of the message to be sent. 
The actual payload will be a combination of UserId + Message just to make it a bit more complciated 
and have some processing, not just sending that value from the Message column.
ToSend will be the flag, an external system maybe enters this data in the table and initializes this to 0.
After that let's imagine some other system comes along and does some processing 
and finally says 'OK, go ahead and send ths' so it will update that flag to 1.
From here our service will build the message, send it and then update this flag back to 0 
and update a log message in the Status column.

We will insert the data and set the flag to '1' manually and only focus on what our service does.

We will also include error handling and and validation.

So here is the basic flowchart of this service: 
<img src="../images/article-images/art-2-basic-flowchart.svg" alt="basic flowchart">

We will need some kind of repetitive task runner, so that our service runs perpetually.

Be carefull with programming errors in this type of application, doing repetitive tasks leaves room for errors 
that manifest later as say memory leaks. If you are not careful and the garbage collector does not handle 
removing data that is no longer needed, you can end up with an application that has a memory leak (grows indefinetly) 
or you could reach the maximum callstack error (for example more than 11,000 function calls - maybe because of an infinite loop) 
which causes the application to crash.

For not we are not getting into the details of the 'Process' block, this will come later.

Ok, Now that we've define what we will build let's start building it: 