import React, { forwardRef } from 'react';
import { Award } from 'lucide-react';

// FIXED: Removed 'interface CertificateTemplateProps'

// FIXED: Removed the <HTMLDivElement, CertificateTemplateProps> types
const CertificateTemplate = forwardRef(({ studentName, courseName, instructorName, date }, ref) => {
    return (
        <div
            ref={ref}
            className="w-[800px] h-[600px] bg-white p-10 border-[20px] border-double border-primary/20 relative overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl"
            id="certificate-template"
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />
            </div>

            <div className="mb-8">
                <div className="bg-primary/10 p-4 rounded-full inline-block mb-4">
                    <Award className="w-16 h-16 text-primary" />
                </div>
                <h1 className="text-5xl font-serif font-bold text-slate-900 mb-2">
                    Certificate of Completion
                </h1>
                <p className="text-slate-500 uppercase tracking-widest text-sm font-medium">
                    This is to certify that
                </p>
            </div>

            <div className="mb-8 relative">
                <h2 className="text-4xl font-bold text-primary mb-2 font-serif italic">
                    {studentName}
                </h2>
                <div className="h-1 w-32 bg-primary/20 mx-auto rounded-full" />
            </div>

            <div className="mb-8 max-w-2xl">
                <p className="text-slate-600 text-lg mb-2">
                    has successfully completed the course
                </p>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">
                    {courseName}
                </h3>
                <p className="text-slate-500 text-sm">
                    Demonstrating exceptional dedication and mastery of the subject matter.
                </p>
            </div>

            <div className="flex justify-between w-full max-w-2xl mt-12 px-12">
                <div className="text-center">
                    <div className="border-b-2 border-slate-300 pb-2 mb-2 w-48 mx-auto">
                        <p className="font-script text-2xl text-slate-800">{date}</p>
                    </div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                        Date Issued
                    </p>
                </div>

                <div className="text-center">
                    <div className="border-b-2 border-slate-300 pb-2 mb-2 w-48 mx-auto">
                        <p className="font-script text-2xl text-slate-800">{instructorName}</p>
                    </div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                        Instructor
                    </p>
                </div>
            </div>

            <div className="absolute bottom-4 text-[10px] text-slate-300">
                Certificate ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </div>
        </div>
    );
});

CertificateTemplate.displayName = "CertificateTemplate";

export default CertificateTemplate;