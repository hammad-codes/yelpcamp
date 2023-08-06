const cities = require('./cities');
var images = require('./images');
const {places,descriptors} = require('./seedhelpers');

const mongoose = require('mongoose');
const Campground = require('../models/campground');
//MapBox Stuff goes here
// const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
// const mapBoxToken = process.env.MAPBOX_TOKEN;
// const geocoder = mbxGeocoding({accessToken:mapBoxToken});

const getGeometry = async(location)=>{
    const geoData = await geocoder.forwardGeocode({
        query:location,
        limit:1
    }).send();
    return geoData.body.features[0].geometry;
}

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp")
.then(()=>{
    console.log('Mongoose Connection Open');
})
.catch(()=>{
    console.log('Mongoose Connection Error');
});

const sample = array => array[Math.floor(Math.random()*array.length)];
const random50 = ()=>{
    return Math.floor(Math.random()*50);
};
const seedDB = async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<500;i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            author:'64c4cb240ca8090382eb3834',
            location:`${cities[random1000].city},${cities[random1000].state}`,
            
            // image is a array of objects so we need to push an object in it, randomly select 3 images from images array and push it in image array
            image:[
                {
                    url:`${images[random50()]}`,
                    filename:`${images[random50()]}`
                },
                {
                    url:`${images[random50()]}`,
                    filename:`${images[random50()]}`
                },
                {
                    url:`${images[random50()]}`,
                    filename:`${images[random50()]}`
                },
            ],
            // image:`${images[random50]}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            price:price,
            description:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages",
            geometry:{
                type:'Point',
                coordinates:[
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            }
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})