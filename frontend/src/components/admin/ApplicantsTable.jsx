import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { MoreHorizontal } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import axios from 'axios';

const shortlistingStatus = ["Accepted", "Rejected"];

const ApplicantsTable = () => {
    const { applicants } = useSelector(store => store.application);
    const applicationList = applicants?.applications || [];

    const statusHandler = async (status, id) => {
        console.log('called');
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status });
            console.log(res);
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    return (
        <div>
            <Table>
                <TableCaption>Highest ATS matches appear first</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>FullName</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>ATS Score</TableHead>
                        <TableHead>ATS Notes</TableHead>
                        <TableHead>Resume</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        applicationList.map((item) => (
                            <tr key={item._id}>
                                <TableCell>{item?.fullName || item?.applicant?.fullname}</TableCell>
                                <TableCell>{item?.email || item?.applicant?.email}</TableCell>
                                <TableCell>{item?.phoneNumber || item?.applicant?.phoneNumber}</TableCell>
                                <TableCell>{item?.atsScore ?? 'NA'}</TableCell>
                                <TableCell className="max-w-xs" title={item?.atsExplanation || ''}>
                                    {item?.atsExplanation ? item.atsExplanation : 'Not available'}
                                </TableCell>
                                <TableCell>
                                    {
                                        item?.applicant?.profile?.resume ? (
                                            <a className="text-blue-600 cursor-pointer" href={item?.applicant?.profile?.resume} target="_blank" rel="noopener noreferrer">{item?.applicant?.profile?.resumeOriginalName || 'Resume'}</a>
                                        ) : item?.resumeFileId ? (
                                            <a className="text-blue-600 cursor-pointer" href={`${APPLICATION_API_END_POINT}/resume/${item?.resumeFileId}`} target="_blank" rel="noopener noreferrer">{item?.resumeOriginalName || 'Resume'}</a>
                                        ) : (
                                            <span>NA</span>
                                        )
                                    }
                                </TableCell>
                                <TableCell>{item?.createdAt?.split("T")[0]}</TableCell>
                                <TableCell className="float-right cursor-pointer">
                                    <Popover>
                                        <PopoverTrigger>
                                            <MoreHorizontal />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-32">
                                            {
                                                shortlistingStatus.map((status, index) => {
                                                    return (
                                                        <div onClick={() => statusHandler(status, item?._id)} key={index} className='flex w-fit items-center my-2 cursor-pointer'>
                                                            <span>{status}</span>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </PopoverContent>
                                    </Popover>

                                </TableCell>

                            </tr>
                        ))
                    }

                </TableBody>

            </Table>
        </div>
    )
}

export default ApplicantsTable
