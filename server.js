const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); //MUST DO THIS FOR EXPRESS 4 UPDATE

//...............................Required to use Flash Messages
const session = require("express-session");
const flash = require("express-flash");

const app = express();
app.listen(1337, () => console.log("suhhh dude 1337"));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + "/static"));

app.use(bodyParser.urlencoded({extended: false}));

//...............................Required to use Flash Messages
app.use(session({
    secret: "groot",
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 5000},
}));
app.use(flash());

const Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/QuoteDB', {useNewUrlParser: true, useUnifiedTopology: true}); //!!localhost/... is name of DataBase

const QuoteSchema = new Schema({ //!!Schema in Mongoose is a structure for each Document
    name: {type: String, required: true, minlength: 1, maxlength: 20},
    quote: {type: String, required: true, minlength: 1, maxlength: 20},
}, {timestamps: true }); //.....................adds "createdAt" and "updatedAt" properties to QuoteDocument(s)

// create an object to that contains methods for mongoose to interface with MongoDB
const QuoteModel = mongoose.model('QuoteDocument', QuoteSchema); //!!Model in Mongoose is a structure for each Collection

app.get('/', (req, res) => {
    res.render("index");
});

app.post('/submit', (req, res) => {
    const quote = new QuoteModel();
    quote.name = req.body.name;
    quote.quote = req.body.quote;
    quote.save()
        .then(newQuote => {
            console.log('Quote Created: ', newQuote);
            res.redirect('/quotes');
        })
        .catch(err => {
            console.log(err);
            for(let key in err.errors) {
                req.flash("registration", err.errors[key].message);
            }
            res.redirect('/');
        });
});

app.get('/quotes', (req, res) => {
    // QuoteDocument.remove({}, ()=> console.log('empty')); //remove all quotes from QuoteCollection
    QuoteModel.find()
        .then(quote => res.render("quotes", {quotes: quote}))
});