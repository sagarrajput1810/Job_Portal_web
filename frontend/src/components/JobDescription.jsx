import React, { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

const JobDescription = () => {
    const {singleJob} = useSelector(store => store.job);
    const {user} = useSelector(store=>store.auth);
    const isIntiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        fullName: user?.fullname || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        coverLetter: '',
        resume: null,
    });

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const onFileChange = (e) => {
        const file = e.target.files?.[0];
        setForm(prev => ({ ...prev, resume: file || null }));
    };

    const submitApplication = async (e) => {
        e.preventDefault();
        try {
            const fd = new FormData();
            fd.append('fullName', form.fullName);
            fd.append('email', form.email);
            fd.append('phoneNumber', form.phoneNumber);
            fd.append('coverLetter', form.coverLetter);
            if (form.resume) fd.append('resume', form.resume);

            const res = await axios.post(`${APPLICATION_API_END_POINT}/apply/${jobId}` , fd, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if(res.data.success){
                setIsApplied(true);
                const existing = singleJob?.applications || [];
                const updatedSingleJob = { ...singleJob, applications: [...existing, { applicant: user?._id }] };
                dispatch(setSingleJob(updatedSingleJob));
                toast.success(res.data.message);
                setOpen(false);
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || 'Failed to apply');
        }
    };

    useEffect(()=>{
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`,{withCredentials:true});
                if(res.data.success){
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application=>application.applicant === user?._id)) // Ensure the state is in sync with fetched data
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSingleJob(); 
    },[jobId,dispatch, user?._id]);

    return (
        <div className='max-w-7xl mx-auto my-10'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='font-bold text-xl'>{singleJob?.title}</h1>
                    <div className='flex items-center gap-2 mt-4'>
                        <Badge className={'text-blue-700 font-bold'} variant="ghost">{singleJob?.position} Positions</Badge>
                        <Badge className={'text-[#F83002] font-bold'} variant="ghost">{singleJob?.jobType}</Badge>
                        <Badge className={'text-[#7209b7] font-bold'} variant="ghost">{singleJob?.salary}LPA</Badge>
                    </div>
                </div>
                <Button
                    onClick={isApplied ? null : () => setOpen(true)}
                    disabled={isApplied}
                    className={`rounded-lg ${isApplied ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#7209b7] hover:bg-[#5f32ad]'}`}>
                    {isApplied ? 'Already Applied' : 'Apply Now'}
                </Button>
            </div>
            <h1 className='border-b-2 border-b-gray-300 font-medium py-4'>Job Description</h1>
            <div className='my-4'>
                <h1 className='font-bold my-1'>Role: <span className='pl-4 font-normal text-gray-800'>{singleJob?.title}</span></h1>
                <h1 className='font-bold my-1'>Location: <span className='pl-4 font-normal text-gray-800'>{singleJob?.location}</span></h1>
                <h1 className='font-bold my-1'>Description: <span className='pl-4 font-normal text-gray-800'>{singleJob?.description}</span></h1>
                <h1 className='font-bold my-1'>Experience: <span className='pl-4 font-normal text-gray-800'>{singleJob?.experience} yrs</span></h1>
                <h1 className='font-bold my-1'>Salary: <span className='pl-4 font-normal text-gray-800'>{singleJob?.salary}LPA</span></h1>
                <h1 className='font-bold my-1'>Total Applicants: <span className='pl-4 font-normal text-gray-800'>{singleJob?.applications?.length}</span></h1>
                <h1 className='font-bold my-1'>Posted Date: <span className='pl-4 font-normal text-gray-800'>{singleJob?.createdAt?.split("T")[0]}</span></h1>
            </div>

            {/* Apply form dialog */}
            <Dialog open={open}>
                <DialogContent className="sm:max-w-[540px]" onInteractOutside={() => setOpen(false)}>
                    <DialogHeader>
                        <DialogTitle>Apply For This Job</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitApplication}>
                        <div className='grid gap-4 py-2'>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="fullName" className="text-right">Full Name</Label>
                                <Input id="fullName" name="fullName" value={form.fullName} onChange={onChange} className="col-span-3" />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input id="email" name="email" type="email" value={form.email} onChange={onChange} className="col-span-3" />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="phoneNumber" className="text-right">Phone</Label>
                                <Input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={onChange} className="col-span-3" />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="coverLetter" className="text-right">Cover Letter</Label>
                                <Input id="coverLetter" name="coverLetter" value={form.coverLetter} onChange={onChange} className="col-span-3" />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="resume" className="text-right">Resume (PDF)</Label>
                                <Input id="resume" name="resume" type="file" accept="application/pdf" onChange={onFileChange} className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full my-2">Submit Application</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default JobDescription
