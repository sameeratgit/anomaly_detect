
var express = require('express');
var serveStatic = require('serve-static');

var app = express();

app.use(serveStatic('public', {
    'index': ['default.html', 'default.htm', 'view.html']
}));

app.use(serveStatic('public/assets'));
app.use(serveStatic('public/data'));

app.listen(3000);
