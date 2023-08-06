const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');
//MapBox Stuff goes here
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken:mapBoxToken});


module.exports.index = async(req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}

module.exports.renderNewForm = (req,res)=>{
    res.render('campgrounds/new');
}

module.exports.showCampground = async(req,res)=>{
    const {id} = req.params;
    const camp =await Campground.findById(id).populate('reviews').populate('author').populate({ path: 'reviews', populate: { path: 'author' } });   
    if(!camp){
        req.flash('error','Campground Not Found');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{camp});
}

module.exports.renderEditForm = async(req,res)=>{
    
    const {id} = req.params;
    const camp =await Campground.findById(id);
    if(!camp){
        req.flash('error','Campground Not Found');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{camp});
}

module.exports.createCampground = async(req,res)=>{
    const {campground} = req.body;

    if(req.files){
        campground.image = req.files.map(f=>({url:f.path,filename:f.filename}));
    }
    const location = await geocoder.forwardGeocode({
        query:campground.location,
        limit:1
    }).send();
    campground.geometry = location.body.features[0].geometry;
    const newCampground = new Campground(campground);
    newCampground.author = req.user._id;
    await newCampground.save();
    req.flash('success','Campground Added Successfully');
    res.redirect(`campgrounds/${newCampground.id}`);
}

module.exports.updateCampground =async(req,res)=>{
    if(!req.body.campground) {throw new ExpressError('Invalid Campground Data',400)}
    const {id} = req.params;
    const camp =await Campground.findById(id);
    if(!camp){
        req.flash('error','Campground Not Found');
        return res.redirect('/campgrounds');
    }
    if(req.files){
        camp.image.push(...req.files.map(f=>({url:f.path,filename:f.filename})));
    }
    if(req.body.deleteImages){
        await camp.updateOne({$pull:{image:{filename:{$in:req.body.deleteImages}}}});
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
    }
    const location = await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send();
    camp.geometry = location.body.features[0].geometry;
    camp.title = req.body.campground.title;
    camp.price = req.body.campground.price;
    camp.description = req.body.campground.description;    
    camp.location = req.body.campground.location;
    await camp.save();
    req.flash('success','Campground Updated Successfully');
    res.redirect(`/campgrounds/${id}`);

}
module.exports.deleteCampground = async(req,res)=>{
    const {id} = req.params;

    const camp =await Campground.findById(id);
    if(!camp){
        req.flash('error','Campground Not Found');
        return res.redirect('/campgrounds');
    }

    for(let image of camp.image){
        await cloudinary.uploader.destroy(image.filename);
    }
    
    await Campground.findByIdAndDelete(id);
    req.flash('success','Campground Deleted Successfully');
    res.redirect(`/campgrounds`);
}