let mongoose = require("mongoose");


let userSchema = mongoose.Schema({
    actorLoginId: { type: String, required: true, unique: true, },
    actorLoginPassword: { type: String, required: true },
    postedJobs: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "postedJobsSchema"
    }
});


let actorSkelton = mongoose.model("createUser", userSchema);
module.exports = actorSkelton;
