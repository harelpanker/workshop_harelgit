const express = require("express");
const router  = express.Router();
const Workshop = require("../models/workshop");
const middleware = require("../middleware");

// INDEX - show all workshops
router.get('/workshops', (req, res) => {
    let noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // get search workshop from db
        Workshop.find({name: regex}, (err, allWorkshops) => {
            if(err) {
                console.log(err);
            } else {
                if(allWorkshops.length < 1) {
                    noMatch = 'No Workshops match that query, please try agian.'
                }
                res.render('workshops/index', {workshops: allWorkshops, currentUser: req.user, noMatch: noMatch});
            }
        });
    } else {
        // get all workshops from db
        Workshop.find({}, (err, allWorkshops) => {
            if(err) {
                console.log(err);
            } else {
                res.render('workshops/index', {workshops: allWorkshops, currentUser: req.user, noMatch: noMatch});
            }
        });
    };
});

// CREATE - add new workshop to DB
router.post('/workshops', middleware.isLoggedIn, middleware.isSafe, (req, res) => {
    // get data from form and add to workshops array
    let name = req.body.name;
    let image = req.body.image;
    let desc = req.body.description;
    let author = {
        id: req.user._id,
        username: req.user.username
    }
    let newWorkshop = {name: name, image: image, description: desc, author: author};
    // create new workshop and save to db:
    Workshop.create(newWorkshop, (err, newCreatedWorkshop) => {
        if (err) {
            console.log(err);
        } else {
            // redirect to /workshops page
            req.flash('success', 'Your new workshop is ready!')
            res.redirect('/workshops');
        }
    });
});

// NEW - show form to create new workshop
router.get('/workshops/new', middleware.isLoggedIn, (req, res) => {
    res.render('workshops/new');
});

// SHOW - shows more info about one workshop
router.get('/workshops/:id', (req, res) => {
    // find workshop with id
    Workshop.findById(req.params.id).populate("sessions").exec((err, foundWorkshop) => {
        if(err) {
            console.log(err);
        } else {
            // render a page with thet id
            res.render('workshops/show', { workshop: foundWorkshop });
        }
    });
});

// Edit route
router.get('/workshops/:id/edit', middleware.checkWorkshopOwnership, (req, res) => {
    Workshop.findById(req.params.id).populate("sessions").exec((err, foundWorkshop, foundSession) => {
        if(err) {
            console.log(err);
        } else {
            res.render('workshops/edit', { workshop: foundWorkshop, session: foundSession });
        }
    });
});

// Update route
router.put('/workshops/:id', middleware.checkWorkshopOwnership, (req, res) => {
    // find and update the correct workshop
    req.body.workshop.body = req.sanitize(req.body.workshop.body);
    Workshop.findByIdAndUpdate(req.params.id, req.body.workshop, (err, updatedWorkshop) => {
        if(err) {
            console.log(err);
        } else {
            req.flash('success', 'Your workshop updated successfuly!')
            res.redirect('/workshops/' + req.params.id);
        }
    })
});

// Destroy workshop
router.delete("/workshops/:id", middleware.checkWorkshopOwnership, (req, res) => {
    Workshop.findByIdAndRemove(req.params.id, (err) => {
        if(err){
            console.log(err);
        } else {
            req.flash('error', 'Workshop deleted!');
            res.redirect("/workshops");
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;