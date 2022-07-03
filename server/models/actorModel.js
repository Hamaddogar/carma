let mongoose = require("mongoose");

let userSchema = mongoose.Schema({
    actorLoginId: { type: String, required: true, unique: true, },
    actorLoginPassword: { type: String, required: true },
    actorFirstName: { type: String, required: true },
    actorDP: { type: String, required: true },
    actorLastName: { type: String, required: true },
    actorBio: { type: String, required: true },
    actorRole: { type: String, required: true },
    actorLocation: { type: String, required: true },
    actorImage: { type: String, required: true },
    actorSkills: { type: [String], required: true },
    actorKYCStatus: { type: String, required: true },
    actorKYCData: { type: Object, required: true },
    jobsPosted: { type: [Object], required: true },
    jobsWorkedOn: { type: [Object], required: true },
    likedByFreelancers: { type: [Object], required: true },
    likedByBuyers: { type: [Object], required: true },
});


let actorSkelton = mongoose.model("actorModel", userSchema);
module.exports = actorSkelton;
