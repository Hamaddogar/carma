let mongoose = require("mongoose");

let jobsSchema = mongoose.Schema({
    jobsId: mongoose.Schema.Types.ObjectId,
    jobTitle: { type: String, required: true },
    appliedByFreelancers: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "appliedByFreelancersSchema"
    }


});

// module.exports = mongoose.model("postedJobsSchema", jobsSchema);

let postedJobsSchema = mongoose.model("postedJobsSchema", jobsSchema);
module.exports = postedJobsSchema;