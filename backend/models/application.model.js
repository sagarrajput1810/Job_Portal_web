import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Optional applicant-provided info at apply time
  fullName: { type: String },
  email: { type: String },
  phoneNumber: { type: String },
  coverLetter: { type: String },
  // GridFS stored resume reference
  resumeFileId: { type: mongoose.Schema.Types.ObjectId },
  resumeOriginalName: { type: String },
  resumeContentType: { type: String },
  resumeExtract: { type: String },
  atsScore: { type: Number, min: 0, max: 100 },
  atsExplanation: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  }
}, {timestamps: true});

export const Application = mongoose.model("Application", applicationSchema);
