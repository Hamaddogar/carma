// require('dotenv').config()
const actorSkelton = require("./models/actorModel");
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const express = require('express');
const multer = require("multer");
const path = require("path");
const cors = require('cors');
const app = express();
// useage
app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.static("./build"));
app.use(express.static("./uploads"));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// ------------------------.ENV CONFIG ------------------//
const PORT = process.env.PORT || 8080;

// const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://admin:admin@codehouse.qo5qv.mongodb.net/dappFYP?retryWrites=true&w=majority';
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.omnjc.mongodb.net/fypdb?retryWrites=true&w=majority';



// -------------DB Connection----------------- //
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err, connection) => {
    console.log(err || connection);
});


// -------------Multer----------------- //
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "/build/images/"));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: storage });




// -------------Server ----------------- //

app.post("/imageuploader", upload.single('upload_file'), async (req, res) => {
    res.send(req.file.filename);
});





// default data
app.get('/defaultData', async (req, res) => {
    try {
        let allData = await actorSkelton.find({}, { actorLoginPassword: 0, actorKYCData: 0 });
        res.send({ success: true, message: allData });
    } catch (error) {
        res.send({ success: true, message: error.message });
    }
})

// default data admin
app.get('/defaultadmindata', async (req, res) => {
    try {
        let allData = await actorSkelton.find({});
        res.send({ success: true, message: allData });
    } catch (error) {
        res.send({ success: true, message: error.message });
    }
})




// registration
app.post("/registration", async (req, res) => {
    const { actorLoginId, actorLoginPassword, actorFirstName, actorLastName, actorDP, actorBio, actorRole, } = req.body;
    try {
        const user = await actorSkelton.findOne({ actorLoginId });
        if (user) {
            res.send({ success: false, message: 'User already exists' });
        } else {
            const newUser = new actorSkelton({
                actorLoginId,
                actorLoginPassword,
                actorFirstName,
                actorLastName,
                actorDP,
                actorBio,
                actorRole,
                // default data
                actorLocation: 'New York',
                actorKYCStatus: 'pending',
                actorKYCData: {},
                actorImage: 'https://source.unsplash.com/random',
                actorSkills: ['HTML', 'CSS', 'JS', 'React', 'Angular', 'Vue', 'Node', 'MongoDB'],
                jobsPosted: [],
                jobsWorkedOn: [],
            });
            await newUser.save();
            res.send({ success: true, message: 'User created' });
        }
    } catch (error) {
        res.send({ success: false, message: error.message });
    }

});

// loginRoute 
app.post('/login', async (req, res) => {
    try {
        let user = await actorSkelton.findOne({ actorLoginId: req.body.email });
        if (user) {
            if (user.actorRole === 'admin') {
                if (user.adminPassword === req.body.password) {
                    delete user.actorLoginPassword;
                    res.send({ success: true, message: 'Login Successful', user });
                } else {
                    res.send({ success: false, message: 'Password is incorrect' });
                }
            } else if (user.actorRole === 'freelancer') {
                if (user.actorLoginPassword === req.body.password) {
                    delete user.actorLoginPassword;
                    res.send({ success: true, message: 'Login Successful', user });
                } else {
                    res.send({ success: false, message: 'Password is incorrect' });
                }
            } else if (user.actorRole === 'buyer') {
                if (user.actorLoginPassword === req.body.password) {
                    delete user.actorLoginPassword;
                    res.send({ success: true, message: 'Login Successful', user });
                } else {
                    res.send({ success: false, message: 'Password is incorrect' });
                }
            } else {
                res.send({ success: false, message: 'User not found' });
            }
        } else {
            res.send({ success: false, message: 'Invalid Email!' });
        }
    } catch (error) {
        res.send({ success: false, message: 'Error cATCH' });
    }
})

// kucuk resimleri upload etmek icin
// KYC
app.post("/actorkycapply", async (req, res) => {
    const { idFront, proofOfResidence, selfieWithID, firstName, LastName, dob, email, city, StateProvince, StreetAddressLine1, StreetAddressLine2, passportNumber, zipCode, sign, userMongoId } = req.body;
    try {
        const user = await actorSkelton.findOne({ _id: userMongoId });
        if (user) {
            const kyc = actorSkelton.updateOne({
                _id: userMongoId,
                actorKYCData: {
                    idFront,
                    proofOfResidence,
                    selfieWithID,
                    firstName,
                    LastName,
                    dob,
                    email,
                    city,
                    StateProvince,
                    StreetAddressLine1,
                    StreetAddressLine2,
                    passportNumber,
                    zipCode,
                    sign
                },
                actorKYCStatus: 'applied',
            }).exec();
            res.send({ success: true, message: 'KYC applied' });
        } else {
            res.send({ success: false, message: 'Try Again! Later' });
        }

    } catch (error) {
        res.send({ success: false, message: error.message });
    }

});

// bidonjob
app.post("/bidonjob", async (req, res) => {
    const { targetedJob, bidAmount, bidDescription, bidDuration, freelancerWhoApplied } = req.body;
    const { actorMongoId, jobId, jobTitle, jobPostedBy, jobDescription, jobSkills, } = targetedJob;
    const { _id, actorDP, actorFirstName, actorLastName } = freelancerWhoApplied;
    try {
        await actorSkelton.updateOne({ "jobsPosted.jobId": mongoose.Types.ObjectId(jobId) }, {
            $push: {
                "jobsPosted.$.appliedByFreelancers": {
                    freelancerBidAmount: bidAmount, freelancerBidDescription: bidDescription, freelancerBidDuration: bidDuration, freelancerID: mongoose.Types.ObjectId(_id),
                    freelancerFullName: actorFirstName + " " + actorLastName, freelancerDP: actorDP,
                    buyerMonogoId: actorMongoId,
                    buyerJobId: jobId,
                    buyerActorMongoId: mongoose.Types.ObjectId(actorMongoId),
                    buyerJobTitle: jobTitle,
                    buyerFullName: jobPostedBy,
                    buyerJobDescription: jobDescription,
                    buyerJobSkills: jobSkills,
                }
            }
        }).exec();
        // freelancer Applied Jobs Updating
        await actorSkelton.updateOne({ _id: mongoose.Types.ObjectId(_id) }, {
            $push: {
                "jobsWorkedOn": {
                    freelancerBidAmount: bidAmount, freelancerBidDescription: bidDescription, freelancerBidDuration: bidDuration, freelancerID: mongoose.Types.ObjectId(_id),
                    freelancerFullName: actorFirstName + " " + actorLastName, freelancerDP: actorDP,
                    buyerMonogoId: actorMongoId,
                    buyerJobId: jobId,
                    buyerActorMongoId: mongoose.Types.ObjectId(actorMongoId),
                    buyerJobTitle: jobTitle,
                    buyerFullName: jobPostedBy,
                    buyerJobDescription: jobDescription,
                    buyerJobSkills: jobSkills,
                    freelancerDP: actorDP,
                    isHired: false,
                }
            }
        }).exec();
        res.send({ success: true, message: 'Bid Placed On Job' });
    } catch (error) {
        res.send({ success: false, message: error.message });
    }
});




// joblist
app.post("/postnewjob", async (req, res) => {
    const { actorMongoId, jobPostedBy, jobTitle, jobPostedTime, jobDescription, jobBudget, jobDuration, jobSkills, } = req.body;
    try {
        await actorSkelton.updateOne({ _id: actorMongoId },
            {
                $push: {
                    jobsPosted: {
                        jobId: new mongoose.Types.ObjectId(),
                        actorMongoId,
                        jobTitle,
                        jobPostedTime,
                        jobPostedBy,
                        jobDescription,
                        jobBudget,
                        ratingByFreelacer: 0,
                        jobDuration,
                        jobSkills,
                        jobStatus: 'new',
                        awardedToFreelacerStatus: false,
                        awardedToFreelacer: {},
                        doneByFreelacer: {},
                        jobComment: '',
                        appliedByFreelancers: [],
                    }
                }
            }).exec();
        res.send({ success: true, message: 'Job Posted' });
    }
    catch (error) {
        res.send({ success: false, message: error.message });
    }
});



// actor data update
app.post("/updateactordata", async (req, res) => {
    const { actorMongoId } = req.body;
    try {
        const user = await actorSkelton.findOne(
            { _id: mongoose.Types.ObjectId(actorMongoId) },
            { actorLoginPassword: 0 },
        ).exec();
        res.send({ success: true, message: 'Actor Data Updated', user });
    } catch (error) {
        res.send({ success: false, message: error.message });
    }
});




// jobAssigner
app.post("/jobAssigner", async (req, res) => {
    const { job, freelancer, buyerId } = req.body;
    const {
        freelancerId,
        freelancerFullName,
        freelancerBidAmount,
        freelancerBidDuration,
    } = freelancer;
    const { jobId, jobTitle, jobPostedBy, jobDescription, jobBudget, jobDuration, jobSkills,
        jobStatus, awardedToFreelacerStatus, awardedToFreelacer, doneByFreelacer, jobComment,
        appliedByFreelancers } = job;
    try {
        await actorSkelton.updateOne(
            { "jobsWorkedOn.jobId": mongoose.Types.ObjectId(jobId) },
            { "jobsWorkedOn.$.isHired": true, }
        ).exec();

        await actorSkelton.updateOne(
            {
                "jobsPosted.jobId": mongoose.Types.ObjectId(jobId),
                "jobsPosted.appliedByFreelancers.freelancerID": mongoose.Types.ObjectId(freelancerId)
            },
            {
                "jobsWorkedOn.$.awardedToFreelacerStatus": true,
                "jobsWorkedOn.$.awardedToFreelacer": { freelancerId, freelancerFullName, freelancerBidAmount, freelancerBidDuration, },
                "jobsWorkedOn.$.doneByFreelacer": { freelancerId, freelancerFullName, freelancerBidAmount, freelancerBidDuration, },
            }
        ).exec();






        res.send({ success: true, message: 'Successfuly Assigned Job' });
    } catch (error) {
        res.send({ success: false, message: error.message });
    }
});






















































if (process.env.NODE_ENV === "production") {
    app.use(express.static("build"));
    const path = require("path");
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
    })
}
// app.listen(8080 || process.env.PORT)
app.listen(PORT, () => { console.log('server is running'); })