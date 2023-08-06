const { session } = require("passport");
const Campground = require("./models/campground");
const {campgroundSchema,reviewSchema} = require('./schemas.js');
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be signed in");    
    return res.redirect(`/login?returnTo=${req.originalUrl}`);
  }
  next();
};

module.exports.isAuthor = async(req,res,next)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!camp.author.equals(req.user._id)){
        req.flash('error','You do not have permission to delete');
        return res.redirect(`/campgrounds/${id}`);
    }
    else{
        next();
    }
};

module.exports.isReviewAuthor = async(req,res,next)=>{
    const {id,reviewId} = req.params;
    const camp = await Campground.findById(id).populate({ path: 'reviews', populate: { path: 'author' } }); 
    const review = camp.reviews.find(r=>r._id.equals(reviewId));
    if(!review.author.equals(req.user._id)){
        req.flash('error','You do not have permission to delete');
        return res.redirect(`/campgrounds/${id}`);
    }else
    {
        next();
    }
}

module.exports.validateCampground = (req,res,next)=>{
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    }else{
        next();
    }
}

module.exports.validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    }else{
        next();
    }
}