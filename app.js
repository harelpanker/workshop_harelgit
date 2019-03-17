const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressSanitizer = require('express-sanitizer');
const methodOverride = require('method-override');
const flash = require('connect-flash');

// User autantication
const passport = require('passport');
const LocalStrategy = require('passport-local');
require('dotenv').config();

// Connect to DB
mongoose.connect('mongodb://harel:Work123Shop@ds163054.mlab.com:63054/workshop');
// mongoose.connect('mongodb://localhost/work_shop', {useNewUrlParser: true});
const port = process.env.PORT || 3000;


// App config
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(expressSanitizer());
app.use(methodOverride('_method'));
app.use(flash());


// Mongoose - model config
const Workshop = require('./models/workshop');
const Session = require('./models/session');
const User = require('./models/user');


// Passport configuration
app.use(require("express-session")({
    secret: "Workshop Web-App is coll",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Pass req.user to all templates
// req.user = to currently logged user
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


// Requring routes
const authRoutes = require("./routes/auth");
const sessionRoutes = require("./routes/sessions");
const workshopRoutes = require("./routes/workshops");

// Use routs
app.use(authRoutes);
app.use(sessionRoutes);
app.use(workshopRoutes);


app.listen(port, () => console.log(`We're alive on port ${port}!`));

