import mongoose from 'mongoose'

const jobSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    company: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    salary: {
        type: Number
    },
    status: {
        type: String,
        enum: [
            "Applied",
            "OA",
            "Interview",
            "HR",
            "Selected",
            "Rejected"
        ],
        default: "Applied"
    },
    interviewDate: Date,
    notes: String,
}, {
    timestamps: true
})

export const jobModel = mongoose.model('Job', jobSchema) 