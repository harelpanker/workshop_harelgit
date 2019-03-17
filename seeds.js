const mongoose = require('mongoose');
const Campground = require('./models/campground');
const Comment = require('./models/comment');

let data = [
    {
        name: "Pipilupi",
        image: "https://images.pexels.com/photos/699558/pexels-photo-699558.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
        description: "blah blah blah"
    },
    {
        name: "Chalula",
        image: "https://images.pexels.com/photos/939723/pexels-photo-939723.jpeg?cs=srgb&dl=adventure-camp-clouds-939723.jpg&fm=jpg",
        description: "blah blah blah"
    },
    {
        name: "Desert Storme",
        image: "https://images.pexels.com/photos/965153/pexels-photo-965153.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
        description: "blah blah blah"
    },
];

function seedDB() {
    // Remove all campgrounds.
    Campground.remove({}, (err) => {
        if (err) {
            console.log(err);
        }
        console.log('Campgrounds removed');
        // Add a few campgrounds
        data.forEach((seed) => {
            Campground.create(seed, (err, campground) => {
                if(err) {
                    console.log(err);
                } else {
                    console.log("Added a campground");
                    // Add a few comments
                    Comment.create(
                        {
                            text: "This place is great, but I wish trere was internet...",
                            author: "Hilly Billy"
                        }, (err, comment) => {
                                if(err) {
                                    console.log(err);
                                } else {
                                    campground.comments.push(comment);
                                    campground.save();
                                    console.log("Created new comment");
                                }
                        });
                }
            });
        });
    });
};

module.exports = seedDB;
