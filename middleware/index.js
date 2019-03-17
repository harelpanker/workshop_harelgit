var Workshop = require("../models/workshop");

// all the middleare goes here
var middlewareObj = {};

// Authenticate function we can add as middleware
// accssess only with registre
middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error', 'You need to be logged in to do that!');
    res.redirect("/login");
};

middlewareObj.checkWorkshopOwnership = (req, res, next) => {
    if(req.isAuthenticated()){
        Workshop.findById(req.params.id, (err, foundWorkshop) => {
            if(err || !foundWorkshop) {
                req.flash('error', 'Sorry, what you looking for does not exist!');
                res.redirect("back");
            } else {
                // does user own the workshop?
                if (foundWorkshop.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash('error', 'You don\'t have permission to do that!');
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash('error', 'You don\'t have permission to do that!');
        res.redirect("back");
    }
};

middlewareObj.isAdmin = (req, res, next) => {
    if(req.user.isAdmin) {
      next();
    } else {
      req.flash('error', 'This site is now read only thanks to spam and trolls.');
      res.redirect('back');
    }
}

middlewareObj.isSafe = (req, res, next) => {
    if(req.body.image.match(/^https:\/\/images\.unsplash\.com\/.*/)) {
      next();
    } else {
      req.flash('error', 'Only images from images.unsplash.com allowed.\nSee https://youtu.be/Bn3weNRQRDE for how to copy image urls from unsplash.');
      res.redirect('back');
    }
}


module.exports = middlewareObj;