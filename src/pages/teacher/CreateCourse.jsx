import React, { useState } from 'react';
import { BookOpen, Users, FileText, Award, BarChart2, MessageCircle, Plus, Upload, Image as ImageIcon, Save, ArrowLeft, Loader, Check, Briefcase, GraduationCap, Link as LinkIcon, AlertCircle, Trash } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import courseService from '../../services/courseService';
import axios from 'axios';

const CreateCourse = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Basic, 2: Structure, 3: Content, 4: Certificate
    const [uploadProgress, setUploadProgress] = useState('');
    const [lastSaved, setLastSaved] = useState(null);

    // Cloudinary Config
    const CLOUD_NAME = "dwyj1vvjx";
    const UPLOAD_PRESET = "edusync_preset";

    // Form Data
    const initialData = {
        // Basic
        title: '',
        category: '',
        level: '',
        shortDescription: '',
        description: '',
        price: '',

        // Structure
        learningOutcomes: [''],
        estimatedDuration: '',
        prerequisites: [''],
        targetAudience: [''],

        // Curriculum (Step 3)
        modules: [
            { title: 'Module 1', lessons: [{ title: '', file: null, duration: '' }] }
        ],

        // Certificate (Step 4)
        certificateSettings: {
            template: 'modern',
            logo: '',
            themeColor: '#3b82f6'
        }
    };

    const [formData, setFormData] = useState(initialData);

    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [certificateLogoFile, setCertificateLogoFile] = useState(null);
    const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);

    // Auto-Save Logic
    const DRAFT_KEY = 'course_creation_draft';

    // Load Draft on Mount
    // Load Draft on Mount or Fetch Course Data for Edit
    React.useEffect(() => {
        if (isEditMode) {
            const fetchCourse = async () => {
                try {
                    setIsLoading(true);
                    const courseData = await courseService.getCourseById(id);

                    // Transform backend data to form format
                    setFormData({
                        title: courseData.title || '',
                        category: courseData.category || '',
                        level: courseData.level || '',
                        shortDescription: courseData.shortDescription || '',
                        description: courseData.description || '',
                        price: courseData.price || '',
                        experienceYears: courseData.experienceYears || '',
                        specialization: courseData.specialization || '',
                        portfolioLink: courseData.portfolioLink || '',
                        certifications: courseData.certifications || '',
                        learningOutcomes: courseData.learningOutcomes || [''],
                        prerequisites: courseData.prerequisites || [''],
                        targetAudience: courseData.targetAudience || [''],
                        modules: courseData.modules || [],
                        certificateSettings: courseData.certificateSettings || { template: 'modern', logo: '', themeColor: '#3b82f6' }
                    });

                    if (courseData.thumbnail) {
                        setPreviewUrl(courseData.thumbnail);
                    }
                    if (courseData.certificateSettings?.logo) {
                        setLogoPreviewUrl(courseData.certificateSettings.logo);
                    }

                } catch (error) {
                    console.error("Failed to fetch course details", error);
                    alert("Failed to load course details");
                    navigate('/teacher/courses');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCourse();
        } else {
            const savedDraft = localStorage.getItem(DRAFT_KEY);
            if (savedDraft) {
                try {
                    const parsed = JSON.parse(savedDraft);
                    setFormData(prev => ({ ...prev, ...parsed.data }));
                    setStep(parsed.step || 1);
                    console.log("Draft loaded from local storage");
                } catch (e) {
                    console.error("Failed to parse draft", e);
                }
            }
        }
    }, [id, isEditMode, navigate]);

    // Save Draft on Change (Debounced simple implementation via effect dependency)
    React.useEffect(() => {
        const timer = setTimeout(() => {
            const dataToSave = {
                data: { ...formData }, // Create shallow copy to avoid mutating state
                step: step
            };
            // Remove file objects before saving to avoid circular json / storage limit
            // We can't save files in local storage easily.
            const cleanModules = formData.modules.map(m => ({
                ...m,
                lessons: m.lessons.map(l => {
                    const { file, ...rest } = l; // Exclude file
                    return rest;
                })
            }));
            dataToSave.data.modules = cleanModules;

            localStorage.setItem(DRAFT_KEY, JSON.stringify(dataToSave));
            setLastSaved(new Date());
        }, 1000);

        return () => clearTimeout(timer);
    }, [formData, step]);


    // Handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (field, index, value) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };

    const addArrayItem = (field) => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    };

    const removeArrayItem = (field, index) => {
        const newArray = formData[field].filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            setThumbnailFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleLogoFileChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            setCertificateLogoFile(file);
            setLogoPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Curriculum Handlers
    const addModule = () => {
        setFormData(prev => ({
            ...prev,
            modules: [...prev.modules, { title: `Module ${prev.modules.length + 1}`, lessons: [{ title: '', file: null, duration: '' }] }]
        }));
    };

    const updateModuleTitle = (mIndex, val) => {
        const newModules = [...formData.modules];
        newModules[mIndex].title = val;
        setFormData(prev => ({ ...prev, modules: newModules }));
    };

    const removeModule = (mIndex) => {
        const newModules = formData.modules.filter((_, i) => i !== mIndex);
        setFormData(prev => ({ ...prev, modules: newModules }));
    };

    const addLesson = (mIndex) => {
        const newModules = [...formData.modules];
        newModules[mIndex].lessons.push({ title: '', file: null, duration: '' });
        setFormData(prev => ({ ...prev, modules: newModules }));
    };

    const removeLesson = (mIndex, lIndex) => {
        const newModules = [...formData.modules];
        newModules[mIndex].lessons = newModules[mIndex].lessons.filter((_, i) => i !== lIndex);
        setFormData(prev => ({ ...prev, modules: newModules }));
    };

    const updateLesson = (mIndex, lIndex, field, value) => {
        const newModules = [...formData.modules];
        newModules[mIndex].lessons[lIndex][field] = value;
        setFormData(prev => ({ ...prev, modules: newModules }));
    };

    // Navigation
    const nextStep = () => {
        if (step === 1) {
            if (!formData.title || !formData.description || !formData.category || !formData.level) return alert("Please fill in all required fields.");
            if (formData.title.length < 5) return alert("Title must be at least 5 characters long.");
            if (formData.description.length < 20) return alert("Description must be at least 20 characters long.");
        }
        if (step === 2) {
            const validOutcomes = formData.learningOutcomes.filter(i => i.trim());
            if (validOutcomes.length === 0) return alert("Please add at least one learning outcome.");
        }
        setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev - 1);

    // Submission
    const handleSave = async () => {
        // Validate Step 4
        const modules = formData.modules;
        if (modules.length === 0) return alert("Please add at least one module.");
        for (let m of modules) {
            if (!m.title.trim()) return alert("All modules must have a title.");
            if (m.lessons.length === 0) return alert(`Module "${m.title}" has no lessons.`);
            for (let l of m.lessons) {
                if (!l.title.trim()) return alert(`A lesson in "${m.title}" is missing a title.`);

                // Only check for video file if type is video (or undefined default)
                if ((!l.type || l.type === 'video') && !l.file && !l.content) {
                    return alert(`Lesson "${l.title}" in "${m.title}" is missing a video file.`);
                }
            }
        }
        if (step === 4) {
            if (!formData.certificateSettings?.themeColor) {
                return alert("Theme color is required for the certificate.");
            }
        }

        setIsLoading(true);
        setUploadProgress('Preparing to upload...');

        try {
            const userInfoString = localStorage.getItem('userInfo');
            const { token } = userInfoString ? JSON.parse(userInfoString) : {};

            // 1. Upload Thumbnail
            let thumbnailUrl = (!thumbnailFile && previewUrl) ? previewUrl : ''; // Use existing if no new file

            if (thumbnailFile) {
                setUploadProgress('Uploading thumbnail...');
                const thumbnailFormData = new FormData();
                thumbnailFormData.append('image', thumbnailFile); // Key matches backend route 'image'
                try {
                    const data = await courseService.uploadImage(thumbnailFormData);
                    thumbnailUrl = data.url;
                    console.log("Thumbnail uploaded:", thumbnailUrl);
                } catch (error) {
                    console.error("Thumbnail upload failed", error);
                    alert("Failed to upload thumbnail. Using default placeholder or skipping.");
                    // Fallback or stop? Let's stop to let user know.
                    // But for robustness, we could just log it.
                    // Let's alert but proceed if it's optional? No, usually required.
                    return;
                }
            }

            // 1.5. Upload Certificate Logo
            let logoUrl = (!certificateLogoFile && logoPreviewUrl) ? logoPreviewUrl : '';
            if (certificateLogoFile) {
                setUploadProgress('Uploading certificate logo...');
                const logoFormData = new FormData();
                logoFormData.append('image', certificateLogoFile);
                try {
                    const data = await courseService.uploadImage(logoFormData);
                    logoUrl = data.url;
                } catch (error) {
                    console.error("Certificate logo upload failed", error);
                    alert("Failed to upload certificate logo. Using default placeholder or skipping.");
                    return;
                }
            }

            // 2. Upload Lesson Videos
            const finalModules = JSON.parse(JSON.stringify(modules)); // Deep copy structure
            let totalLessons = 0;
            modules.forEach(m => totalLessons += m.lessons.length);
            let processedLessons = 0;

            for (let i = 0; i < modules.length; i++) {
                for (let j = 0; j < modules[i].lessons.length; j++) {
                    const lesson = modules[i].lessons[j];
                    const file = lesson.file;

                    if (file) {
                        processedLessons++;
                        setUploadProgress(`Uploading video ${processedLessons}/${totalLessons}: ${lesson.title}...`);

                        // Use our backend upload route
                        const fd = new FormData();
                        fd.append('video', file);
                        const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/courses/upload/video`, fd, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'multipart/form-data',
                            },
                        });

                        // Update final structure with URL
                        finalModules[i].lessons[j].content = uploadRes.data.url;
                        finalModules[i].lessons[j].type = 'video';
                        finalModules[i].lessons[j].duration = ''; // Optional: could get from metadata
                        delete finalModules[i].lessons[j].file; // Remove File object
                    }
                }
            }

            // Calculate Total Estimated Duration in Hours
            let totalSeconds = 0;
            finalModules.forEach(m => {
                m.lessons.forEach(l => {
                    if (l.duration && typeof l.duration === 'string' && l.duration.includes(':')) {
                        const [mins, secs] = l.duration.split(':');
                        totalSeconds += (Number(mins) * 60) + Number(secs);
                    } else if (l.duration) {
                        // fallback if duration is a number (e.g. from quiz)
                        totalSeconds += Number(l.duration) * 60;
                    }
                });
            });
            const autoCalculatedHours = totalSeconds > 0 ? (totalSeconds / 3600).toFixed(1) : 0;

            // 3. Create Course
            setUploadProgress('Finalizing course...');
            const courseData = {
                ...formData,
                thumbnail: thumbnailUrl,
                estimatedDuration: Number(autoCalculatedHours),
                price: Number(formData.price || 0),
                learningOutcomes: formData.learningOutcomes.filter(i => i.trim()),
                prerequisites: formData.prerequisites.filter(i => i.trim()),
                targetAudience: formData.targetAudience.filter(i => i.trim()),
                duration: `${autoCalculatedHours} Hours`,
                modules: finalModules, // Send the structure with URLs
                certificateSettings: {
                    ...formData.certificateSettings,
                    logo: logoUrl
                }
            };

            console.log("Submitting course data:", courseData);

            if (isEditMode) {
                setUploadProgress('Updating course...');
                await courseService.updateCourse(id, courseData);
                localStorage.removeItem(DRAFT_KEY); // Clear draft
                console.log("Course updated successfully");
                alert('Course Updated Successfully!');
            } else {
                await courseService.createCourse(courseData);
                localStorage.removeItem(DRAFT_KEY); // Clear draft
                console.log("Course created successfully");
                alert('Course Submitted for Review!');
            }
            console.log("Navigating to courses list...");
            navigate('/teacher/courses');

        } catch (error) {
            console.error("Error creating course:", error);
            alert(`Error: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoading(false);
            setUploadProgress('');
        }
    };

    return (
        <DashboardLayout userType="teacher" title={isEditMode ? "Edit Course" : "Create New Course"}>
            <div className="max-w-4xl mx-auto">
                <Link to="/teacher/courses" className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to My Courses
                </Link>

                <div className="flex justify-between mb-8 max-w-xl mx-auto relative">
                    {/* Progress Bar Background */}
                    <div className="absolute top-4 md:top-5 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 z-0 rounded-full"></div>

                    {/* Progress Bar Fill */}
                    <div
                        className="absolute top-4 md:top-5 left-0 h-1 bg-blue-600 z-0 rounded-full transition-all duration-300"
                        style={{ width: `${((step - 1) / 3) * 100}%` }}
                    ></div>

                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex flex-col items-center relative z-10">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-900'}`}>
                                {step > s ? <Check className="h-5 w-5" /> : s}
                            </div>
                            <span className={`hidden md:block text-xs font-medium mt-2 ${step >= s ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                {s === 1 ? 'Basic' : s === 2 ? 'Structure' : s === 3 ? 'Content' : 'Certificate'}
                            </span>

                        </div>
                    ))}
                </div>

                <Card className="p-8">
                    {/* STEP 1: BASIC INFO */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 border-b dark:border-slate-800 pb-2">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <Input label="Course Title *" name="title" value={formData.title} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category *</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm focus:border-primary focus:ring-4 outline-none bg-white dark:bg-slate-800 dark:text-white text-slate-900">

                                        <option value="">Select Category</option>
                                        <option value="Programming">Programming</option>
                                        <option value="Design">Design</option>
                                        <option value="Business">Business</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Level *</label>
                                    <select name="level" value={formData.level} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm focus:border-primary focus:ring-4 outline-none bg-white dark:bg-slate-800 dark:text-white text-slate-900">

                                        <option value="">Select Level</option>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <Input label="Short Description" name="shortDescription" value={formData.shortDescription} onChange={handleChange} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Detailed Description *</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm focus:border-primary focus:ring-4 h-32 outline-none dark:bg-slate-800 dark:text-white bg-white text-slate-900" required></textarea>
                                </div>

                                <div>
                                    <Input label="Price (Rs)" type="number" name="price" value={formData.price} onChange={handleChange} min="0" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Thumbnail</label>
                                    <input type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handleFileChange} className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 dark:file:bg-blue-900/40 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/60" />

                                    {previewUrl && <img src={previewUrl} alt="Preview" className="h-32 mt-4 rounded-lg object-cover" />}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: STRUCTURE */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 border-b dark:border-slate-800 pb-2">Course Structure</h2>


                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Learning Outcomes *</label>
                                {formData.learningOutcomes.map((item, i) => (
                                    <div key={i} className="flex gap-2 mb-2">
                                        <div className="flex-1"><Input value={item} onChange={(e) => handleArrayChange('learningOutcomes', i, e.target.value)} /></div>
                                        <Button variant="outline" onClick={() => removeArrayItem('learningOutcomes', i)}>X</Button>
                                    </div>
                                ))}
                                <Button variant="ghost" size="sm" onClick={() => addArrayItem('learningOutcomes')} className="text-blue-600 dark:text-blue-400"><Plus className="h-4 w-4 mr-1" /> Add Outcome</Button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Prerequisites</label>
                                {formData.prerequisites.map((item, i) => (
                                    <div key={i} className="flex gap-2 mb-2">
                                        <div className="flex-1"><Input value={item} onChange={(e) => handleArrayChange('prerequisites', i, e.target.value)} /></div>
                                        <Button variant="outline" onClick={() => removeArrayItem('prerequisites', i)}>X</Button>
                                    </div>
                                ))}
                                <Button variant="ghost" size="sm" onClick={() => addArrayItem('prerequisites')} className="text-blue-600 dark:text-blue-400"><Plus className="h-4 w-4 mr-1" /> Add Prerequisite</Button>
                            </div>

                        </div>
                    )}

                    {/* STEP 3: CONTENT */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                            <div className="flex justify-between items-center mb-4 border-b dark:border-slate-800 pb-2">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Course Content</h2>
                                <Button size="sm" onClick={addModule}><Plus className="h-4 w-4 mr-1" /> Add Module</Button>
                            </div>


                            {formData.modules.map((module, mIndex) => (
                                <div key={mIndex} className="border dark:border-slate-800 rounded-lg p-4 bg-slate-50 dark:bg-slate-900 mb-4">

                                    <div className="flex gap-4 mb-4">
                                        <div className="flex-1">
                                            <Input
                                                label={`Module ${mIndex + 1} Title`}
                                                value={module.title}
                                                onChange={(e) => updateModuleTitle(mIndex, e.target.value)}
                                                placeholder="e.g. Introduction"
                                            />
                                        </div>
                                        <Button variant="outline" className="text-red-500 mt-7" onClick={() => removeModule(mIndex)}><Trash className="h-4 w-4" /></Button>
                                    </div>

                                    <div className="space-y-3 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                                        {module.lessons.map((lesson, lIndex) => (
                                            <div key={lIndex} className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 relative">

                                                <div className="absolute right-2 top-2">
                                                    <Button variant="ghost" size="sm" className="text-red-400 h-6 w-6 p-0" onClick={() => removeLesson(mIndex, lIndex)}><Trash className="h-3 w-3" /></Button>
                                                </div>

                                                <div className="space-y-3 pr-8">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <Input
                                                            label={`Item ${lIndex + 1} Title`}
                                                            value={lesson.title}
                                                            onChange={(e) => updateLesson(mIndex, lIndex, 'title', e.target.value)}
                                                            placeholder="Title"
                                                        />
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
                                                            <select
                                                                value={lesson.type || 'video'}
                                                                onChange={(e) => updateLesson(mIndex, lIndex, 'type', e.target.value)}
                                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                                            >

                                                                <option value="video">Video Lesson</option>
                                                                <option value="quiz">Quiz</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* VIDEO INPUTS */}
                                                    {(lesson.type === 'video' || !lesson.type) && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Video File *</label>
                                                                <input
                                                                    type="file"
                                                                    accept="video/*"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files[0];
                                                                        if (file) {
                                                                            updateLesson(mIndex, lIndex, 'file', file);

                                                                            // Auto-extract duration
                                                                            const video = document.createElement('video');
                                                                            video.preload = 'metadata';

                                                                            video.onloadedmetadata = function () {
                                                                                window.URL.revokeObjectURL(video.src);
                                                                                const minutes = Math.floor(video.duration / 60);
                                                                                const seconds = Math.floor(video.duration % 60);
                                                                                const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                                                                                updateLesson(mIndex, lIndex, 'duration', formattedDuration);
                                                                            }

                                                                            video.src = URL.createObjectURL(file);
                                                                        }
                                                                    }}
                                                                    className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700"
                                                                />
                                                                {lesson.file && <span className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center"><Check className="h-3 w-3 mr-1" /> {lesson.file.name} selected</span>}
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Duration (Auto-calculated)</label>
                                                                <div className="flex items-center h-[38px] px-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                                                                    {lesson.duration ? lesson.duration : 'Auto'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* ASSIGNMENT INPUTS */}
                                                    {lesson.type === 'assignment' && (
                                                        <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded text-sm">

                                                            <Input
                                                                label="Description"
                                                                value={lesson.description || ''}
                                                                onChange={(e) => updateLesson(mIndex, lIndex, 'description', e.target.value)}
                                                                placeholder="Assignment details..."
                                                            />
                                                            <div className="flex gap-4">
                                                                <Input
                                                                    label="Max Marks"
                                                                    type="number"
                                                                    value={lesson.maxMarks || ''}
                                                                    onChange={(e) => updateLesson(mIndex, lIndex, 'maxMarks', e.target.value)}
                                                                    className="w-24"
                                                                />
                                                                <div className="flex-1">
                                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Due Date</label>
                                                                    <input
                                                                        type="date"
                                                                        className="w-full px-3 py-2 border dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                                                                        value={lesson.dueDate || ''}
                                                                        onChange={(e) => updateLesson(mIndex, lIndex, 'dueDate', e.target.value)}
                                                                    />
                                                                </div>

                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* QUIZ INPUTS */}
                                                    {lesson.type === 'quiz' && (
                                                        <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded text-sm">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                                <Input
                                                                    label="Quiz Duration (minutes) *"
                                                                    type="number"
                                                                    value={lesson.duration || ''}
                                                                    onChange={(e) => updateLesson(mIndex, lIndex, 'duration', e.target.value)}
                                                                    placeholder="e.g. 20"
                                                                    min="0"
                                                                />
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <label className="font-semibold text-slate-700 dark:text-slate-300">Questions</label>

                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        const questions = lesson.questions || [];
                                                                        questions.push({ question: '', option1: '', option2: '', option3: '', option4: '', ans: 1 });
                                                                        updateLesson(mIndex, lIndex, 'questions', questions);
                                                                    }}
                                                                >
                                                                    + Add Question
                                                                </Button>
                                                            </div>
                                                            {(lesson.questions || []).map((q, qIndex) => (
                                                                <div key={qIndex} className="border dark:border-slate-700 p-2 rounded bg-white dark:bg-slate-800">

                                                                    <div className="flex justify-between mb-2">
                                                                        <span className="text-xs font-bold">Q{qIndex + 1}</span>
                                                                        <button
                                                                            onClick={() => {
                                                                                const newQs = lesson.questions.filter((_, i) => i !== qIndex);
                                                                                updateLesson(mIndex, lIndex, 'questions', newQs);
                                                                            }}
                                                                            className="text-red-500 text-xs hover:underline"
                                                                        >Remove</button>
                                                                    </div>
                                                                    <Input
                                                                        placeholder="Question Text"
                                                                        value={q.question}
                                                                        onChange={(e) => {
                                                                            const newQs = [...lesson.questions];
                                                                            newQs[qIndex].question = e.target.value;
                                                                            updateLesson(mIndex, lIndex, 'questions', newQs);
                                                                        }}
                                                                        className="mb-2"
                                                                    />
                                                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                                                        {['option1', 'option2', 'option3', 'option4'].map((opt, i) => (
                                                                            <input
                                                                                key={opt}
                                                                                placeholder={`Option ${i + 1}`}
                                                                                value={q[opt]}
                                                                                onChange={(e) => {
                                                                                    const newQs = [...lesson.questions];
                                                                                    newQs[qIndex][opt] = e.target.value;
                                                                                    updateLesson(mIndex, lIndex, 'questions', newQs);
                                                                                }}
                                                                                className="px-2 py-1 border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded text-xs w-full"
                                                                            />

                                                                        ))}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs">Correct Option:</span>
                                                                        <select
                                                                            value={q.ans}
                                                                            onChange={(e) => {
                                                                                const newQs = [...lesson.questions];
                                                                                newQs[qIndex].ans = Number(e.target.value);
                                                                                updateLesson(mIndex, lIndex, 'questions', newQs);
                                                                            }}
                                                                            className="text-xs border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded p-1 w-20"
                                                                        >

                                                                            <option value={1}>Option 1</option>
                                                                            <option value={2}>Option 2</option>
                                                                            <option value={3}>Option 3</option>
                                                                            <option value={4}>Option 4</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <Button variant="ghost" size="sm" onClick={() => addLesson(mIndex)} className="text-blue-600 pl-0">
                                            <Plus className="h-4 w-4 mr-1" /> Add Content Item
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {formData.modules.length === 0 && (
                                <div className="text-center py-8 text-slate-500 dark:text-slate-400 italic">No modules added. Click "Add Module" to start.</div>
                            )}

                        </div>
                    )}

                    {/* STEP 4: CERTIFICATE */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">Certificate Customization</h2>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-3">Template Style *</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {['modern', 'classic', 'minimalistic'].map(t => (
                                            <div
                                                key={t}
                                                onClick={() => setFormData(prev => ({ ...prev, certificateSettings: { ...prev.certificateSettings, template: t } }))}
                                                className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all ${formData.certificateSettings.template === t ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/20' : 'border-slate-200 hover:border-blue-300 bg-white'}`}
                                            >
                                                <div className="h-24 bg-slate-100 rounded mb-3 flex items-center justify-center border border-slate-200 shadow-sm relative overflow-hidden">
                                                    {t === 'modern' && (
                                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white">
                                                            <div className="absolute top-2 left-2 right-2 flex flex-col items-center">
                                                                <div className="w-8 h-8 rounded-full bg-blue-100 mb-1"></div>
                                                                <div className="h-2 w-16 bg-slate-300 rounded mb-2"></div>
                                                                <div className="h-3 w-24 bg-blue-200 rounded"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {t === 'classic' && (
                                                        <div className="absolute inset-2 border-2 text-center flex flex-col items-center justify-center border-amber-200">
                                                            <div className="w-6 h-6 border rounded-sm border-amber-300 mb-1"></div>
                                                            <div className="h-2 w-16 bg-slate-300 rounded mb-1"></div>
                                                            <div className="h-4 w-24 border border-slate-200 italic flex items-center justify-center text-[8px] bg-slate-50">name</div>
                                                        </div>
                                                    )}
                                                    {t === 'minimalistic' && (
                                                        <div className="absolute inset-0 bg-white text-left p-3 flex flex-col justify-end">
                                                            <div className="h-3 w-16 bg-slate-800 rounded mb-1"></div>
                                                            <div className="h-2 w-24 bg-slate-300 rounded mb-1"></div>
                                                            <div className="h-2 w-10 bg-blue-500 rounded"></div>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-semibold text-slate-800 capitalize">{t}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Custom Logo (Optional)</label>
                                        <input type="file" accept=".png,.jpg,.jpeg,.svg" onChange={handleLogoFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-3" />
                                        {logoPreviewUrl && (
                                            <div className="mt-2 text-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                                <img src={logoPreviewUrl} alt="Logo Preview" className="h-20 max-w-full mx-auto object-contain" />
                                                <button onClick={() => { setCertificateLogoFile(null); setLogoPreviewUrl(null); setFormData(prev => ({ ...prev, certificateSettings: { ...prev.certificateSettings, logo: '' } })); }} className="text-red-500 text-xs mt-2 hover:underline">Remove Logo</button>
                                            </div>
                                        )}
                                        <p className="text-xs text-slate-500 mt-2">Recommended size: 200x200px. Transparant PNG or SVG.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Theme Color *</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="color"
                                                name="themeColor"
                                                value={formData.certificateSettings?.themeColor || '#3b82f6'}
                                                onChange={(e) => setFormData(prev => ({ ...prev, certificateSettings: { ...prev.certificateSettings, themeColor: e.target.value } }))}
                                                className="w-16 h-16 p-1 rounded-lg cursor-pointer border-slate-200"
                                            />
                                            <div className="flex-1">
                                                <Input
                                                    value={formData.certificateSettings?.themeColor || '#3b82f6'}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, certificateSettings: { ...prev.certificateSettings, themeColor: e.target.value } }))}
                                                    placeholder="#HEX"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0f172a'].map(color => (
                                                <div
                                                    key={color}
                                                    onClick={() => setFormData(prev => ({ ...prev, certificateSettings: { ...prev.certificateSettings, themeColor: color } }))}
                                                    className={`w-8 h-8 rounded-full cursor-pointer shadow-sm border-2 ${formData.certificateSettings.themeColor === color ? 'border-slate-900 scale-110' : 'border-white hover:scale-110'} transition-transform`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex justify-between pt-8 mt-4 border-t border-slate-100">
                        {step > 1 ? (
                            <Button variant="outline" onClick={prevStep} disabled={isLoading}>Back</Button>
                        ) : <div></div>}

                        {step < 4 ? (
                            <Button onClick={nextStep}>Next: {step === 1 ? 'Structure' : step === 2 ? 'Content' : 'Certificate'}</Button>
                        ) : (
                            <Button onClick={handleSave} disabled={isLoading || uploadProgress} className="bg-green-600 hover:bg-green-700 min-w-[140px]">
                                {isLoading ? (
                                    <><Loader className="h-4 w-4 mr-2 animate-spin" /> {uploadProgress || 'Processing...'}</>
                                ) : (
                                    <><Save className="h-4 w-4 mr-2" /> {isEditMode ? 'Update Course' : 'Publish Course'}</>
                                )}
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default CreateCourse;