const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists for videos (referenced from original route logic)
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'videos');
// Note: recursive creation might be needed if moved logic relies on it, 
// but usually this is done at app startup or in the route definition where multer is configured.
// We'll assume the route file handles multer config, this controller handles business logic.

/**
 * Helper to calculate total duration from modules
 * Assumes duration comes in formats like "10", "10 min", "10:30"
 */
const calculateTotalDuration = (modules) => {
    let totalMinutes = 0;

    if (!modules || !Array.isArray(modules)) return "0 min";

    for (const m of modules) {
        if (!m.lessons || !Array.isArray(m.lessons)) continue;

        for (const l of m.lessons) {
            if (l.duration) {
                // Remove whitespace and convert to lower
                const durStr = String(l.duration).trim().toLowerCase();

                if (durStr.includes(':')) {
                    // Handle mm:ss or hh:mm:ss
                    const parts = durStr.split(':').reverse(); // [sec, min, hour]
                    const sec = parseInt(parts[0]) || 0;
                    const min = parseInt(parts[1]) || 0;
                    const hr = parseInt(parts[2]) || 0;
                    totalMinutes += (hr * 60) + min + (sec / 60);
                } else {
                    // Handle "10", "10 min", "10m", "10.5"
                    const parsed = parseFloat(durStr.replace(/[^0-9.]/g, ''));
                    if (!isNaN(parsed)) {
                        totalMinutes += parsed;
                    }
                }
            }
        }
    }

    totalMinutes = Math.round(totalMinutes);
    if (totalMinutes < 60) {
        return `${totalMinutes} min`;
    } else {
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
};

/**
 * @desc    Get all APPROVED courses (Public/Student view)
 * @route   GET /api/courses
 * @access  Public
 */
const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({ status: 'approved' })
            .populate('instructor', 'name email')
            .select('title description thumbnail price instructor createdAt status duration category level');
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Get courses owned by the logged-in teacher
 * @route   GET /api/courses/mine
 * @access  Private/Teacher
 */
const getTeacherCourses = async (req, res) => {
    try {
        const courses = await Course.find({
            $or: [{ instructor: req.user._id }, { createdBy: req.user._id }]
        }).select('title description thumbnail createdAt status price duration category level').lean();

        // Attach student counts for dashboard
        const coursesWithCounts = await Promise.all(courses.map(async (course) => {
            const studentsCount = await Enrollment.countDocuments({ course: course._id });
            return { ...course, studentsCount };
        }));

        res.json(coursesWithCounts);
    } catch (error) {
        console.error('Error fetching teacher courses:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Get single course by ID
 * @route   GET /api/courses/:id
 * @access  Public
 */
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name avatar');

        if (course) {
            // If student, check if approved or enrolled (logic can be expanded)
            // For now, allow viewing if they have the ID, or restrict if strictly needed.
            // Requirement: "Student: Can only GET courses where status: approved."
            // But if they bought it, maybe they can see it? For now enforce approval for public view.
            if (course.status !== 'approved' &&
                (!req.user || (req.user.role !== 'admin' && req.user._id.toString() !== course.instructor.toString()))) {
                return res.status(404).json({ message: 'Course not found or not available' });
            }
            res.json(course);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Create a course
 * @route   POST /api/courses
 * @access  Private/Teacher
 */
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');

const createCourse = async (req, res) => {
    try {
        console.log("Create Course Body:", JSON.stringify(req.body, null, 2));
        const {
            title, description, thumbnail, price, category, level, duration,
            shortDescription, experienceYears, specialization, portfolioLink, certifications,
            learningOutcomes, estimatedDuration, prerequisites, targetAudience,
            modules, // Get modules from body
            certificateSettings // Certificate templates and theme
        } = req.body;

        // 1. Create the Course first
        // Auto-populate teacher fields from profile if not in body
        const teacherExp = experienceYears || req.user.experienceYears || 0;
        const teacherSpec = specialization || req.user.specialization || '';
        const teacherPortfolio = portfolioLink || req.user.portfolioLink || '';
        const teacherCerts = certifications || req.user.certifications || '';

        const course = new Course({
            title,
            description,
            shortDescription,
            thumbnail,
            price,
            category,
            level,
            duration,
            experienceYears: teacherExp,
            specialization: teacherSpec,
            portfolioLink: teacherPortfolio,
            certifications: teacherCerts,
            learningOutcomes,
            estimatedDuration,
            prerequisites,
            targetAudience,
            certificateSettings: certificateSettings || { template: 'modern', logo: '', themeColor: '#3b82f6' },
            instructor: req.user._id,
            createdBy: req.user._id,
            status: 'pending',
            modules: [] // We will populate this next
        });

        const savedCourse = await course.save();

        // 2. Process Modules and Lessons
        if (modules && modules.length > 0) {
            const processedModules = [];

            for (const m of modules) {
                const processedLessons = [];
                for (const l of m.lessons) {
                    let content = l.content; // Default for video (URL)

                    if (l.type === 'quiz') {
                        // Create Quiz Document
                        const newQuiz = new Quiz({
                            title: l.title,
                            course: savedCourse._id,
                            instructor: req.user._id,
                            questions: l.questions || [],
                            timeLimit: l.duration ? Number(l.duration) : 30, // Default or from input
                            totalMarks: l.questions ? l.questions.length * 10 : 100 // Simple logic
                        });
                        const savedQuiz = await newQuiz.save();
                        content = savedQuiz._id.toString();
                    }

                    processedLessons.push({
                        title: l.title,
                        type: l.type,
                        content: content,
                        duration: l.duration || ''
                    });
                }

                processedModules.push({
                    title: m.title,
                    lessons: processedLessons
                });
            }

            // Update course with processed modules
            savedCourse.modules = processedModules;

            // Calculate total duration from the newly processed modules
            savedCourse.duration = calculateTotalDuration(processedModules);

            await savedCourse.save();
        }

        res.status(201).json(savedCourse);
    } catch (error) {
        console.error('Error creating course:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(400).json({ message: error.message || 'Invalid course data' });
    }
};

/**
 * @desc    Add a lesson to a course
 * @route   POST /api/courses/:id/lessons
 * @access  Private/Teacher
 */
const addLesson = async (req, res) => {
    try {
        const { moduleTitle, lessonTitle, type, content, duration } = req.body;
        const course = await Course.findById(req.params.id);

        if (course) {
            // Check ownership
            if (course.instructor.toString() !== req.user._id.toString() &&
                course.createdBy?.toString() !== req.user._id.toString() &&
                req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized to update this course' });
            }

            const newLesson = {
                title: lessonTitle,
                type: type,
                content: content,
                duration: duration
            };

            // Simple module logic: Create new module for every lesson (MVP)
            // Ideally we'd find an existing module or create one
            const newModule = {
                title: moduleTitle || "Chapter 1",
                lessons: [newLesson]
            };

            course.modules.push(newModule);
            await course.save();

            res.status(201).json({ message: 'Lesson added' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        console.error('Error adding lesson:', error);
        res.status(400).json({ message: 'Error adding lesson' });
    }
};

// @desc    Upload a video file (Helper for route)
// Logic remains mostly in route for multer, but if we need a DB record for video, we do it here.
// For now, the existing route handles file upload and returns URL directly. 
// We might not need a controller method if the route just uses multer middleware + simple response.

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Teacher
const updateCourse = async (req, res) => {
    try {
        const {
            title, description, thumbnail, price, category, level, duration,
            shortDescription, experienceYears, specialization, portfolioLink, certifications,
            learningOutcomes, estimatedDuration, prerequisites, targetAudience,
            modules, // Get modules from body
            certificateSettings // certificate setup
        } = req.body;

        const course = await Course.findById(req.params.id);

        if (course) {
            // Check ownership
            if (course.instructor.toString() !== req.user._id.toString() &&
                course.createdBy?.toString() !== req.user._id.toString() &&
                req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized to update this course' });
            }

            // Update fields
            course.title = title || course.title;
            course.description = description || course.description;
            course.thumbnail = thumbnail || course.thumbnail;
            course.price = price || course.price;
            course.category = category || course.category;
            course.level = level || course.level;

            // Note: course.duration might be overwritten below if modules are updated
            if (duration) course.duration = duration;

            course.shortDescription = shortDescription || course.shortDescription;
            course.experienceYears = experienceYears || req.user.experienceYears || course.experienceYears;
            course.specialization = specialization || req.user.specialization || course.specialization;
            course.portfolioLink = portfolioLink || req.user.portfolioLink || course.portfolioLink;
            course.certifications = certifications || req.user.certifications || course.certifications;
            course.learningOutcomes = learningOutcomes || course.learningOutcomes;
            course.estimatedDuration = estimatedDuration || course.estimatedDuration;
            course.prerequisites = prerequisites || course.prerequisites;
            course.targetAudience = targetAudience || course.targetAudience;

            if (certificateSettings) {
                course.certificateSettings = {
                    ...course.certificateSettings,
                    ...certificateSettings
                };
            }

            // Process Modules and Lessons if provided
            if (modules && modules.length > 0) {
                const processedModules = [];
                for (const m of modules) {
                    const processedLessons = [];
                    for (const l of m.lessons) {
                        let content = l.content;
                        if (l.type === 'quiz' && !l.content && l.questions) {
                            const newQuiz = new Quiz({
                                title: l.title,
                                course: course._id,
                                instructor: req.user._id,
                                questions: l.questions || [],
                                timeLimit: l.duration ? Number(l.duration) : 30,
                                totalMarks: l.questions ? l.questions.length * 10 : 100
                            });
                            const savedQuiz = await newQuiz.save();
                            content = savedQuiz._id.toString();
                        }

                        processedLessons.push({
                            title: l.title,
                            type: l.type,
                            content: content,
                            duration: l.duration || ''
                        });
                    }
                    processedModules.push({
                        title: m.title,
                        lessons: processedLessons
                    });
                }
                course.modules = processedModules;

                // Recalculate duration if modules were updated
                course.duration = calculateTotalDuration(processedModules);
            }

            const updatedCourse = await course.save();
            res.json(updatedCourse);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(400).json({ message: 'Error updating course' });
    }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Teacher
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (course) {
            // Check ownership
            if (course.instructor.toString() !== req.user._id.toString() &&
                course.createdBy?.toString() !== req.user._id.toString() &&
                req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized to delete this course' });
            }

            await course.deleteOne(); // or findByIdAndDelete(req.params.id)
            res.json({ message: 'Course removed' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAllCourses,
    getTeacherCourses,
    getCourseById,
    createCourse,
    addLesson,
    updateCourse,
    deleteCourse
};
