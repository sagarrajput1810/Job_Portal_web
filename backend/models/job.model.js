import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: [{
    type: String,
  }],
  salary: {
    type: Number,
    required: true
  },
  experienceLevel: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  jobType: {
    type: String,
    required: true
  },
  position: {
    type: Number,
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'company',
    required: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  application: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
  }]
}, { timestamps: true });

// expose `applications` virtual to keep frontend naming consistent
jobSchema.virtual('applications').get(function () {
  return this.application;
});

jobSchema.set('toObject', { virtuals: true });
jobSchema.set('toJSON', { virtuals: true });

export const Job = mongoose.model("Job", jobSchema);
