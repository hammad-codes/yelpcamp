const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const Review = require("./models/reviews");
const User = require('./models/user');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const {campgroundSchema,reviewSchema} = require('./schemas.js');
const campgroundRoutes = require('./routes/campgroundRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const passport = require('passport');
const localStrategy = require('passport-local');
//MongoDB Store stuff
//Security Stuff
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize'); //To prevent mongo injection
//Cloudinary Stuff
if(process.env.NODE_ENV !== 'production'){ //If we are not in production environment i.e. we are in development environment then ...
    require('dotenv').config();
}

app.engine('ejs',ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname,'public'))); //Serving the static files
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(mongoSanitize()); //To prevent mongo injection, using it will remove special characters like $ from the req.body, req.query, req.params. Preventing mongo injection
app.use(helmet({
    contentSecurityPolicy:false,
}))


//MongoDB Connection
const connectionString = process.env.DB_URL ;
// const connectionString = 'mongodb://127.0.0.1:27017/yelp-camp';
mongoose.connect(connectionString)
.then(()=>{
    console.log('Mongoose Connection Open');
})
.catch(()=>{
    console.log('Mongoose Connection Error');
});


//--------------------

//Setting up the session configuration
const session = require('express-session');
const flash = require('connect-flash');

const MongoDBStore = require('connect-mongo')(session); // This version worked well (npm i connect-mongo@3)

const store = new MongoDBStore({
    url:connectionString,
    secret:'thisshouldbeabettersecret',
    touchAfter:24*60*60 //means the session will be updated only once in 24 hours or if the session is modified
});
store.on('error',function(e){
    console.log('Session Store Error',e);
})

const sessionConfig = {
    store,
    secret:'thisshouldbeabettersecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        name:'session',
        httpOnly:true, //means the cookie is not accessible through client side javascript,
        //secure:true, //means the cookie will only be sent over https
        expires:Date.now()+1000*60*60*24*7, //means the cookie will expire in 7 days
        maxAge:1000*60*60*24*7 //means the cookie will expire in 7 days
    }
}
app.use(session(sessionConfig));
app.use(flash());

//--------------------------------

//Passport Stuff

app.use(passport.initialize()); 
app.use(passport.session()); //For persistent login sessions...
passport.use(new localStrategy(User.authenticate())); //It means We would like you to use the local strategy, and the authentication method is located on the User model.

//Telling the passport the method to use to serialize and deserialize users
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// ------------------------------

app.use((req,res,next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});

app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);



app.get("/", (req, res) => {
  res.render("home");
});

app.get('/fakeUser',async (req,res)=>{
    const user = new User({email:"coltt@gmail.com",username:"colt"});
    const newUser = await User.register(user,'chicken');
    res.send(newUser);
})


app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404));
})

app.use((err,req,res,next)=>{
    const {statusCode = 500} = err;
    if(!err.message || !err.statusCode){err.message = 'Something went Wrong';err.statusCode=500}
    console.log(err);
    res.status(statusCode).render('error',{err});
})

app.listen(9000, () => {
  console.log("Server is running on port 9000");
});
