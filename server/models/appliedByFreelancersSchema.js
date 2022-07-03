let mongoose = require('mongoose');

let jobsSchema = mongoose.Schema({
    freelancerName: { type: String, required: true },
});

// module.exports = mongoose.model("appliedByFreelancersSchema", jobsSchema);


let appliedByFreelancersSchema = mongoose.model("appliedByFreelancersSchema", jobsSchema);
module.exports = appliedByFreelancersSchema;