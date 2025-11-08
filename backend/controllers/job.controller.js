import {Job} from "../models/job.model.js";
export const postJob = async (req,res) => {
    try {
        const {title, description, requirements, salary, location, jobType, experience, position, companyId} = req.body;
        const userId = req.id;
        if(!title || !description || !requirements || !salary || !location || !jobType || !experience || !companyId){
            return res.status(400).json({
                message:"Somthing is missing",
                success:false
            })
        }
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel:experience,
            position,
            company:companyId,
            created_by:userId
        })
        return res.status(201).json({
            message: " new job create successfully",
            job,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}

export const getAllJobs = async (req, res) => {
try {
    const keyword = req.query.keyword || "";
    const query = {
        $or : [
            {title : {$regex:keyword, $options:"i"}},
            {description : {$regex:keyword, $options:"i"}},
        ]
    }
    const jobs = await Job.find(query).populate({
        path:"company"
    }).sort({createdAt:-1});
    if(!jobs){
        return res.status(404).json({
            message: "Jobs are not found",
            success: false
        })
    }
    return res.status(200).json({
        jobs,
        success:true
    })
} catch (error) {
    console.log(error);
}
}

export const getJobById = async(req,res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: "application",
            select: "applicant",
            options: { sort: { createdAt: -1 } }
        });
        if(!job){
            return res.status(404).json({
                message:"Job not found",
                success: false
            });
        }
        const jobData = job.toObject({ virtuals: true });
        return res.status(200).json({job: jobData, success:true});

    } catch (error) {
        console.log(error)
    }
}
// For recruiter
export const getAdminJobs = async (req,res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId })
            .populate({ path: "company" })
            .sort({ createdAt: -1 });
        if(!jobs){
            return res.status(200).json({
                message: "Jobs are not found",
                success: false
            })
        }
        return res.status(200).json({
            jobs,
            success:true
        })

    } catch (error) {
        console.log(error)
    }
}

export const updateJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.id;
        const {
            title,
            description,
            requirements,
            salary,
            location,
            jobType,
            experience,
            position,
            companyId
        } = req.body;

        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || position === undefined) {
            return res.status(400).json({
                message: "Somthing is missing",
                success: false
            });
        }

        const job = await Job.findOne({ _id: jobId, created_by: userId });
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        const requirementsArray = Array.isArray(requirements)
            ? requirements
            : requirements.split(",").map((item) => item.trim()).filter(Boolean);

        job.title = title;
        job.description = description;
        job.requirements = requirementsArray;
        job.salary = Number(salary);
        job.location = location;
        job.jobType = jobType;
        job.experienceLevel = Number(experience);
        job.position = Number(position);
        job.company = companyId || job.company;

        await job.save();
        return res.status(200).json({
            message: "Job updated successfully",
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to update job",
            success: false
        });
    }
}
