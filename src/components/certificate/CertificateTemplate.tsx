import React, { forwardRef } from 'react';
import { Award } from 'lucide-react';

// FIXED: Removed 'interface CertificateTemplateProps'

// FIXED: Removed the <HTMLDivElement, CertificateTemplateProps> types
const CertificateTemplate = forwardRef(({ studentName, courseName, instructorName, date, settings }, ref) => {

    // Default settings if none provided
    const template = settings?.template || 'modern';
    const logoUrl = settings?.logo || null;
    const themeColor = settings?.themeColor || '#3b82f6'; // Default primary blue

    // Helpers to adjust styles
    const hexToRgb = (hex) => {
        let r = 0, g = 0, b = 0;
        if (hex) {
            if (hex.length === 4) {
                r = parseInt(hex[1] + hex[1], 16);
                g = parseInt(hex[2] + hex[2], 16);
                b = parseInt(hex[3] + hex[3], 16);
            } else if (hex.length === 7) {
                r = parseInt(hex[1] + hex[2], 16);
                g = parseInt(hex[3] + hex[4], 16);
                b = parseInt(hex[5] + hex[6], 16);
            }
        }
        return `${r}, ${g}, ${b}`;
    };

    const themeRgb = hexToRgb(themeColor);

    if (template === 'classic') {
        return (
            <div
                ref={ref}
                className="w-[800px] h-[600px] bg-[#fffdf5] p-12 relative flex flex-col items-center justify-center text-center font-serif text-slate-800"
                id="certificate-template"
            >
                {/* Classic Borders */}
                <div
                    className="absolute inset-4 border-[6px]"
                    style={{ borderColor: themeColor }}
                />
                <div
                    className="absolute inset-5 border-[1px]"
                    style={{ borderColor: themeColor }}
                />
                <div
                    className="absolute inset-2 border-[1px]"
                    style={{ borderColor: themeColor }}
                />

                <div className="mb-4">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="h-20 max-w-xs mx-auto object-contain mb-4" />
                    ) : (
                        <Award className="w-16 h-16 mx-auto mb-4" style={{ color: themeColor }} />
                    )}
                </div>

                <h1 className="text-4xl uppercase tracking-[0.2em] mb-4" style={{ color: themeColor }}>
                    Certificate of Completion
                </h1>

                <p className="italic text-lg mb-6">This is to proudly certify that</p>

                <h2 className="text-5xl font-bold italic mb-4 pb-2 border-b border-slate-300 w-3/4 mx-auto" style={{ color: themeColor }}>
                    {studentName}
                </h2>

                <p className="italic text-lg mb-4">has successfully completed</p>

                <h3 className="text-2xl font-bold uppercase tracking-wider mb-12">
                    {courseName}
                </h3>

                <div className="flex justify-between w-full max-w-2xl px-12 relative top-4">
                    <div className="text-center w-40">
                        <div className="border-b border-slate-800 pb-2 mb-2 font-script text-2xl">{date}</div>
                        <p className="text-xs uppercase tracking-widest">Date</p>
                    </div>

                    <div className="text-center w-40">
                        <div className="border-b border-slate-800 pb-2 mb-2 font-script text-2xl">{instructorName}</div>
                        <p className="text-xs uppercase tracking-widest">Instructor</p>
                    </div>
                </div>

                <div className="absolute bottom-6 right-8 text-[9px] text-slate-400">
                    ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                </div>
            </div>
        );
    }

    if (template === 'minimalistic') {
        return (
            <div
                ref={ref}
                className="w-[800px] h-[600px] bg-white p-16 relative flex flex-col justify-between text-left shadow-xl"
                id="certificate-template"
            >
                {/* Vertical Accent Line */}
                <div
                    className="absolute left-0 top-0 bottom-0 w-3"
                    style={{ backgroundColor: themeColor }}
                />

                <div className="flex justify-between items-start">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="h-16 max-w-xs object-contain" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <Award className="w-8 h-8" style={{ color: themeColor }} />
                            <span className="font-bold tracking-widest text-slate-800">EDUSYNC</span>
                        </div>
                    )}
                    <span className="text-sm font-medium tracking-[0.2em] text-slate-400 uppercase">Certificate</span>
                </div>

                <div className="my-10 pl-4 border-l-2" style={{ borderColor: `rgba(${themeRgb}, 0.2)` }}>
                    <p className="text-sm uppercase tracking-widest text-slate-500 mb-2 font-medium">Awarded To</p>
                    <h2 className="text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                        {studentName}
                    </h2>

                    <p className="text-slate-600 mb-2">For successful completion of the course:</p>
                    <h3 className="text-3xl font-semibold text-slate-800" style={{ color: themeColor }}>
                        {courseName}
                    </h3>
                </div>

                <div className="flex justify-between items-end border-t border-slate-100 pt-8 mt-auto">
                    <div>
                        <p className="text-slate-900 font-medium mb-1">{instructorName}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Lead Instructor</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-900 font-medium mb-1">{date}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Date Issued</p>
                    </div>
                </div>
                <div className="absolute bottom-4 right-16 text-[9px] text-slate-300">
                    ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                </div>
            </div>
        );
    }

    // Default 'modern' template
    return (
        <div
            ref={ref}
            className="w-[800px] h-[600px] bg-white p-10 relative overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl border-8"
            style={{ borderColor: `rgba(${themeRgb}, 0.1)` }}
            id="certificate-template"
        >
            {/* Background Pattterns */}
            <div
                className="absolute top-0 right-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"
                style={{ backgroundColor: themeColor }}
            />
            <div
                className="absolute bottom-0 left-0 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"
                style={{ backgroundColor: themeColor }}
            />

            <div className="mb-8 relative z-10 w-full flex flex-col items-center">
                {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-16 max-w-xs object-contain mb-6" />
                ) : (
                    <div
                        className="p-4 rounded-full inline-block mb-4 shadow-sm"
                        style={{ backgroundColor: `rgba(${themeRgb}, 0.1)` }}
                    >
                        <Award className="w-12 h-12" style={{ color: themeColor }} />
                    </div>
                )}

                <h1 className="text-4xl font-sans font-bold text-slate-900 tracking-tight mb-2">
                    CERTIFICATE OF COMPLETION
                </h1>
                <p className="text-slate-500 tracking-widest text-xs font-semibold uppercase">
                    This is to certify that
                </p>
            </div>

            <div className="mb-6 relative z-10">
                <h2
                    className="text-5xl font-bold mb-3"
                    style={{ color: themeColor }}
                >
                    {studentName}
                </h2>
                <div
                    className="h-1 w-24 mx-auto rounded-full"
                    style={{ backgroundColor: `rgba(${themeRgb}, 0.3)` }}
                />
            </div>

            <div className="mb-10 max-w-xl relative z-10">
                <p className="text-slate-600 text-sm mb-2 uppercase tracking-wider font-medium">
                    has successfully completed the course
                </p>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    {courseName}
                </h3>
            </div>

            <div className="flex justify-between w-full max-w-xl mt-4 px-8 relative z-10 bg-white/50 p-6 rounded-2xl backdrop-blur-sm">
                <div className="text-center">
                    <p className="font-semibold text-lg text-slate-800 border-b-2 border-slate-200 pb-1 w-32 mx-auto">{date}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-2">
                        Date Issued
                    </p>
                </div>

                <div className="text-center">
                    <p className="font-script text-2xl text-slate-800 border-b-2 border-slate-200 pb-1 w-32 mx-auto" style={{ color: themeColor }}>{instructorName}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-2">
                        Instructor
                    </p>
                </div>
            </div>

            <div className="absolute bottom-4 left-4 text-[10px] text-slate-400 font-mono z-10">
                ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </div>
        </div>
    );
});

CertificateTemplate.displayName = "CertificateTemplate";

export default CertificateTemplate;