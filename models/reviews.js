const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    rating:{
        type:Number,
        min:0,
        max:5
    }
});

const Review = mongoose.model('Review',reviewSchema);
module.exports = Review;