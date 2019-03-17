const express = require("express");
const router  = express.Router();
const Session = require("../models/session");
const Workshop = require("../models/workshop");
const middleware = require("../middleware");

// Create new session - direct you to a form
router.get('/workshops/:id/sessions/new',middleware.isLoggedIn, middleware.checkWorkshopOwnership, (req, res) => {
    // find workshop with id
    Workshop.findById(req.params.id, (err, workshop) => {
        if(err) {
            console.log(err);
        } else {
            // render a page with thet id
            res.render('sessions/new', {workshop: workshop});
        }
    });
});

// Create new session
router.post("/workshops/:id/sessions", middleware.isLoggedIn, middleware.checkWorkshopOwnership, (req, res) => {
    //lookup workshop using ID
    Workshop.findById(req.params.id, (err, workshop) => {
        if(err){
            console.log(err);
        } else {
            //create new session
            Session.create(req.body.session, (err, session) => {
                if(err){
                    req.flash('error', 'something went wrong!')
                    console.log(err);
                } else {
                    //connect new session to workshop
                    workshop.sessions.push(session);
                    workshop.save();
                    //redirect workshop show page
                    req.flash('success', 'Created a Session!');
                    res.redirect('/workshops/' + workshop._id);
                }
            });
        }
    });
});

// Edit session
router.get("/workshops/:id/sessions/:session_id/edit", middleware.checkWorkshopOwnership, (req, res) => {
    Session.findById(req.params.session_id, (err, foundSession) => {
        if(err){
            console.log(err);
        } else {
            res.render("sessions/edit", {workshop_id: req.params.id, session: foundSession});
        }
    });
});
 
// Session update
router.put("/workshops/:id/sessions/:session_id", middleware.checkWorkshopOwnership, (req, res) => {
    Session.findByIdAndUpdate(req.params.session_id, req.body.session, (err, updatedSession) => {
        if(err) {
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/');
        } else {
            req.flash('success', 'The session updated successfuly!')
            res.redirect("/workshops/" + req.params.id );
        }
    });
});

// Destroy session
router.delete("/workshops/:id/sessions/:session_id", middleware.checkWorkshopOwnership, (req, res) => {
    //findByIdAndRemove
    Session.findByIdAndRemove(req.params.session_id, (err) => {
        if(err) {
            req.flash('error', err.message);
            console.log(err);
            res.redirect('/');
        } else {
            req.flash('error', 'Session deleted!');
            res.redirect("/workshops/" + req.params.id);
        }
    });
});

module.exports = router;