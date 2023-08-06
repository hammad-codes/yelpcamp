const mongoose = require('mongoose');
const Review = require('./reviews');
const Schema = mongoose.Schema;


const imageSchema = new Schema({
    url:String,
    filename:String
})

const geometrySchema = new Schema({
    type:{
        type:String,
        enum:['Point'],
        required:true
    },
    coordinates:{
        type:[Number],
        required:true
    }
});

imageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200');
});

const opts = {toJSON:{virtuals:true}};
const campgroundSchema = new Schema({
    title:String,
    image:[imageSchema],
    price:{
        type:Number,
        min:0
    },
    description:String,
    geometry:geometrySchema,
    location:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
},opts );

campgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>`;
});

campgroundSchema.post('findOneAndDelete',async function(camp){
    if(camp.reviews.length){
        await Review.deleteMany({_id:{$in:camp.reviews}})
    }
});

const Campground = mongoose.model('Campground',campgroundSchema);
module.exports = Campground;