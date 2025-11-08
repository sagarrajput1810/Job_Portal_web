import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { Readable } from "stream";
import { generateAtsInsights } from "../utils/atsScorer.js";

export const applyJob = async (req,res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;
        if(!jobId){
            return res.status(400).json({
                message:"Job id is required",
                success:false
            })
        };
        // check user is applied or not
        const existingApplication = await Application.findOne({job:jobId, applicant:userId});
        if(existingApplication){
            return res.status(400).json({
                message: "Yoy have already applied for this jobs",
                success:false
            })
        }
        // check if the job exists
        const job = await Job.findById(jobId);
        if(!job){
            return res.status(404).json({
                message:"Job not found",
                success:false
            })
        }
        const applicantProfile = await User.findById(userId);
        // Expect multipart/form-data with fields and a single file 'resume'
        const { fullName, email, phoneNumber, coverLetter } = req.body || {};
        const file = req.file;

        if(!file){
            return res.status(400).json({
                message:"Resume file is required",
                success:false
            })
        }

        // Upload resume buffer to GridFS
        const db = mongoose.connection.db;
        if(!db){
            return res.status(500).json({ message: "Database not initialized", success:false });
        }
        const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "resumes" });

        const uploadStream = bucket.openUploadStream(file.originalname, {
            contentType: file.mimetype,
            metadata: {
                jobId,
                applicantId: userId,
                email,
            }
        });

        const readable = Readable.from(file.buffer);
        await new Promise((resolve, reject) => {
            readable.pipe(uploadStream)
                .on("error", reject)
                .on("finish", resolve);
        });

        // create a new application
        const newApplication = await Application.create({
            job: jobId,
            applicant: userId,
            fullName,
            email,
            phoneNumber,
            coverLetter,
            resumeFileId: uploadStream.id,
            resumeOriginalName: file.originalname,
            resumeContentType: file.mimetype,
        })
        if (applicantProfile) {
            const atsResult = await generateAtsInsights({
                job,
                applicant: applicantProfile,
                applicationInput: { fullName, email, phoneNumber, coverLetter }
            });
            if (atsResult?.score !== undefined) {
                newApplication.atsScore = atsResult.score;
                newApplication.atsExplanation = atsResult.explanation;
                await newApplication.save();
            }
        }
        job.application.push(newApplication._id);
        await job.save();
        return res.status(201).json({
            message:"Job applied successful",
            success:true,
            applicationId: newApplication._id,
            resumeFileId: uploadStream.id
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success:false });
    }
} 

export const getAppliedJobs = async (req,res) => {
    try {
        const userId = req.id;
        const application = await Application.find({applicant:userId}).sort({createdAt:-1}).populate({
            path:'job',
            options:{sort:{createdAt:-1}},
            populate:{
                path:'company',
                options:{sort:{createdAt:-1}}
            }
        });
        if(!application){
            return res.status(404).json({
                message:"No application",
                success:false
            })
        }
        return res.status(200).json({
            application,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}

// adimin dekhe ga kitne user ne applied kiya
export const getApplicants = async (req,res)=>{
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path:'application',
            options:{sort:{atsScore:-1, createdAt:-1}},
            populate:{
                path:'applicant'
            }
        })
        if(!job){
            return res.status(404).json({
                message:'Job nbot found',
                success:false
            })
        }
        const jobData = job.toObject({ virtuals: true });
        return res.status(200).json({
            job: jobData,
            success:true
        })
    } catch (error) {
        console.log(error)
    }
}

export const updateStatus = async (req,res) => {
    try {
        const {status} = req.body;
        const applicationId = req.params.id;
        if(!status){
            return res.status(400).json({
                message:"status is requird",
                success:false
            })
        }
        // find the application by applicat id
        const application = await Application.findOne({_id:applicationId});
        if(!application){
            return res.status(404).json({
                message:"Application not found",
                success: false
            })
        }
        //update the status
        application.status = status;
        await application.save();

        return res.status(200).json({
            message:"Status updated successfully",
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}

export const downloadResume = async (req, res) => {
    try {
        const { fileId } = req.params;
        if (!fileId) {
            return res.status(400).json({ message: "fileId is required", success: false });
        }
        const db = mongoose.connection.db;
        if(!db){
            return res.status(500).json({ message: "Database not initialized", success:false });
        }
        const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "resumes" });
        const _id = new mongoose.Types.ObjectId(fileId);
        // Try to find the file to set headers
        const files = await bucket.find({ _id }).toArray();
        if (!files || files.length === 0) {
            return res.status(404).json({ message: "File not found", success: false });
        }
        const file = files[0];
        res.setHeader("Content-Type", file.contentType || "application/octet-stream");
        res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(file.filename)}"`);
        const downloadStream = bucket.openDownloadStream(_id);
        downloadStream.on("error", (err) => {
            console.error(err);
            res.status(500).end();
        });
        downloadStream.pipe(res);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success:false });
    }
}
