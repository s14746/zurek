/*jshint globalstrict: true, devel: true, node: true */
'use strict';

var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var baza = require('./db/books');
var fs = require('fs');


app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    var genres = baza().distinct("genre").sort();
    res.render('index.ejs', {genres: genres});
});

app.get('/:gen', function (req, res) {
    var genres = baza().distinct("genre").sort();
    var books = baza({genre: req.params.gen}).select("title", "author");
    var genre = req.params.gen;
    res.render('index.ejs', {genres: genres, books: books, genre: genre, badLogin: req.query.badLogin});
});

app.post('/:gen', function (req, res) {
    var genre = req.params.gen;

    if (req.body.login == "admin" && req.body.password == "nimda") {
        baza.insert({
            "title": req.body.title,
            "author": req.body.author,
            "genre": genre
        });

        res.redirect("/" + genre);
    } else {
        res.redirect("/" + genre + "?badLogin=true");
    }
});




app.listen(3000, function () {
    console.log('Serwer działa na porcie 3000');
});

process.on('SIGINT', function () {

    var beginning = "/* jshint node: true */ \n var TAFFY = require('taffy'); \n var books = TAFFY(";
    var tafText = baza().stringify();
    var ending = "); \n module.exports = books;";
    var fileText = [beginning,tafText,ending].join("");
    fs.writeFileSync("db/books.js",fileText);
    console.log('\nshutting down');
    process.exit();
});