---
layout: post
title:  "Parsing XML in a Node Express App"
date:   2016-08-06 21:30:00 +0200
categories: blog
tags: code
featured: true
---

# Parsing XML in a Node Express App

>This is a simple way to parse received XML data. If your aplication needs to be 
able to receive data in XML format and, for example save it to a database, you 
will need to parse it, and maybe convert it to another type for easyer 
manipulation. We are going to setup a simple Express application that will 
listen on a port and accept POST messages containing the XML data in the body 
of the request.

* first lets open a PowerShell window, and create a project folder. 
Install the three packages we will use for this project which are express and 
express-xml-bodyparser.

```bash
cd C:\projects
mkdir node-express-xml
```

* Then we will initialize the git repository (a good practice on any new 
project) and npm. Accept all the defaults (they can be changed later from the 
package.json file).

```bash
git init
npm init
```

* Install the two packages we will use for this project which are express-xml-bodyparser and express.

```bash
npm install --save express express-xml-bodyparser
```

* Now let's open the project folder in a code editor, I will use VS Code so:

```bash
code .
```

* Create a new file called `index.js` tat will serve as the main entry point of 
our application. I will use new ES6 syntax, and that is only supported using 
`'use strict';` in the current version of Node. If you are unfamiliar with the 
new type declarations like `const` and `let`, arrow 
functions `() => {}` and string interpolation ``` `text ${var} text` ``` you 
can visit the [ES6 documentation](http://es6-features.org). 
OK, so lets get to it.

* Import all the needed packages:

```js
"use strict";
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const xmlparser = require('express-xml-bodyparser');

/* 
* once initialized, xmlparser it can be used as any other middleware:
*/
app.use(xmlparser());
```

* Next lets define a POST route for our simple API. Since this application will
only have one route, I will not bother setting the routes in a separate file.

```js
app.post('/xml', (req, res) => {
  console.log(req.body);
  
  /* 
  * if you dont return anything, the request will hang.
  */
  return res.status(200).send('OK');
});
```

* When the request comes in, following the flow of the application, if first
passes trough the middleware. Middleware has access to the request and response
objects. 
* The middlewate can alter, do checks and verifications or process the
request/response infomration. In this speciffic case, xmlparser parses the
`request.body` and transforms the XML data into a JavaScript object.
* Let's have the app listening for requests on port 3000.

```js
let port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
```

* Let's create a start script for our application inside the `package.json`
file:

```js
  "scripts": {
    "start": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```

* Int he command line opened on the project folder, type `npm start` to spin up 
our application.
* We are just logging the request body to the console at the moment. Lets test 
it out using [Postman](https://www.getpostman.com/).
* Setup postman to send a POST request to `localhost:3000/xml` setup 
`Content-Type` as `application/xml` in the request header. Enter the following
int he body of the request.

```xml
<?xml version="1.0"?>
<TEST>
  <SOMETAG>
    Testing our application.
  </SOMETAG>
</TEST>
```

* You should be seeing the following in your console:

```js
{ test: { sometag: [ 'Testing our application.' ] } }
```

* You can see that each XML tag is converted to an oject key. It also preserves
the tree structure of the original XML file.
* Usually XML files are not so simple so lets try something more complicated:

```xml
<?xml version="1.0"?>
<BOOKSHELF>
  <BOOK author = "Simon Timms" year = "2016">
    Mastering JavaScript Design Patterns, 2nd Edition
  </BOOK>
  <BOOK author = "David Herron" year = "2016 ">
    Node.js Web Development, 3rd Edition 
  </BOOK>
</BOOKSHELF>
```

* Here the XML file contains properties and a repeating tag, which we eventually
want to turn to an array.
* Sending the above XML file to our service, you should see in your console 
something like this:

```js
{ bookshelf: { book: [ [Object], [Object] ] } }
```

* And low and behold, `express-xml-bodyparser` did exactly what we expected. It
took our main tag and converted it into a key, took the second tag which it saw
that it was repeating and turned it into an array. This array contains two 
object arrays, one for each of the repeating `BOOK` tags.
* Lets continue parsing these objects and see how we can handle those properties
that you see in the XML file (`author` and `year`) and how do those 
`book` objects look.

```js
app.post('/xml', (req, res) => {
  let jsXml = req.body;

  let bookshelf = jsXml.bookshelf.book;
  console.log(bookshelf);
  
  /* 
  * if you dont return anything, you leave the request hanging, which is very
  * unpolite
  */
  return res.status(200).send('OK');
});
```

* We cahced the request body `let jsXml = req.body;` and now lets see how the
array looks.
* Save the `index.js` file with the new changes and restart the Node app. 
* Sending the request to the app now should get you something like this in the 
console: 

```js
[ { _: 'Mastering JavaScript Design Patterns, 2nd Edition',
    '$': { author: 'Simon Timms', year: '2016' } },
  { _: 'Node.js Web Development, 3rd Edition',
    '$': { author: 'David Herron', year: '2016' } } ]
```

* As you can see each `book` object has two keys, `_` that stores the value
in each tag and `$` that stores the properties. Accessiong them is straight 
forward, you can do something like:

```js
app.post('/xml', (req, res) => {
  let jsXml = req.body;

  let bookshelf = jsXml.bookshelf.book;
  
  bookshelf.forEach(element => {
    console.log(`${element._} by ${element.$.author}, ${element.$.year}`);
  });

  return res.status(200).send('OK');
});
```

* The output should be:

```shell
Mastering JavaScript Design Patterns, 2nd Edition by Simon Timms, 2016
Node.js Web Development, 3rd Edition by David Herron, 2016
```

* XML has fallen out of favour lately, web develoeprs prefer to work with JSON
for obvious reasons. But if you find yourself in a situation where you need to
work with XML or you need to parse some RSS feed (which is usually XML), I hope
this will come in handy.

> Thank you!