import React, { useEffect, useMemo, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useSelector } from 'react-redux'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const companyArray = [];

const PostJob = () => {
    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experience: "",
        position: 0,
        companyId: ""
    });
    const [loading, setLoading]= useState(false);
    const [prefillLoading, setPrefillLoading] = useState(false);
    const navigate = useNavigate();
    const { id: jobId } = useParams();
    const isEditMode = Boolean(jobId);

    const { companies } = useSelector(store => store.company);
    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const selectChangeHandler = (value) => {
        const selectedCompany = companies.find((company)=> company.name.toLowerCase() === value);
        setInput({...input, companyId:selectedCompany._id});
    };

    useEffect(() => {
        if (!isEditMode) return;
        const fetchJobDetails = async () => {
            try {
                setPrefillLoading(true);
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, {
                    withCredentials: true
                });
                if (res.data.success) {
                    const job = res.data.job;
                    setInput({
                        title: job.title || "",
                        description: job.description || "",
                        requirements: Array.isArray(job.requirements) ? job.requirements.join(", ") : "",
                        salary: job.salary?.toString() || "",
                        location: job.location || "",
                        jobType: job.jobType || "",
                        experience: (job.experienceLevel ?? job.experience ?? "").toString(),
                        position: job.position ?? 0,
                        companyId: job.company?._id || job.company || ""
                    });
                }
            } catch (error) {
                console.log(error);
                toast.error(error?.response?.data?.message || "Failed to load job details");
            } finally {
                setPrefillLoading(false);
            }
        };
        fetchJobDetails();
    }, [isEditMode, jobId]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = {
                ...input
            };
            const endpoint = isEditMode ? `${JOB_API_END_POINT}/update/${jobId}` : `${JOB_API_END_POINT}/post`;
            const request = isEditMode ? axios.put : axios.post;
            const res = await request(endpoint, payload,{
                headers:{
                    'Content-Type':'application/json'
                },
                withCredentials:true
            });
            if(res.data.success){
                toast.success(res.data.message);
                navigate("/admin/jobs");
            }
        } catch (error) {
            toast.error(error.response.data.message);
        } finally{
            setLoading(false);
        }
    }
    const selectedCompanyValue = useMemo(() => {
        const company = companies.find((companyItem) => companyItem._id === input.companyId);
        return company ? company.name.toLowerCase() : "";
    }, [companies, input.companyId]);

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center w-screen my-5'>
                <form onSubmit = {submitHandler} className='p-8 max-w-4xl border border-gray-200 shadow-lg rounded-md'>
                    <div className='grid grid-cols-2 gap-2'>
                        <div>
                            <Label>Title</Label>
                            <Input
                                type="text"
                                name="title"
                                value={input.title}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input
                                type="text"
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Requirements</Label>
                            <Input
                                type="text"
                                name="requirements"
                                value={input.requirements}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Salary</Label>
                            <Input
                                type="text"
                                name="salary"
                                value={input.salary}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Location</Label>
                            <Input
                                type="text"
                                name="location"
                                value={input.location}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Job Type</Label>
                            <Input
                                type="text"
                                name="jobType"
                                value={input.jobType}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Experience Level</Label>
                            <Input
                                type="text"
                                name="experience"
                                value={input.experience}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>No of Position</Label>
                            <Input
                                type="number"
                                name="position"
                                value={input.position}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        {
                            companies.length > 0 && (
                                <Select value={selectedCompanyValue || undefined} onValueChange={selectChangeHandler} disabled={prefillLoading}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select a Company" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {
                                                companies.map((company) => {
                                                    return (
                                                        <SelectItem key={company?._id} value={company?.name?.toLowerCase()}>{company.name}</SelectItem>
                                                    )
                                                })
                                            }

                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            )
                        }
                    </div> 
                    {
                        loading ? <Button className="w-full my-4" disabled> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type="submit" className="w-full my-4" disabled={prefillLoading}>{isEditMode ? "Update Job" : "Post New Job"}</Button>
                    }
                    {
                        companies.length === 0 && <p className='text-xs text-red-600 font-bold text-center my-3'>*Please register a company first, before posting a jobs</p>
                    }
                    {
                        isEditMode && prefillLoading && <p className='text-xs text-gray-500 font-medium text-center my-3'>Loading job details...</p>
                    }
                </form>
            </div>
        </div>
    )
}

export default PostJob
