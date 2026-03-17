// Import the models we defined above
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

exports.getStudentDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch all enrollments for this student
        const enrollments = await Enrollment.find({ student: userId })
            .populate({
                path: 'course',
                select: 'title thumbnail description instructor modules duration category level', // Include modules to count lessons
                populate: [
                    {
                        path: 'instructor',
                        select: 'name'
                    },
                    {
                        path: 'modules',
                        populate: {
                            path: 'lessons',
                            select: 'title duration'
                        }
                    }
                ]
            });

        // 2. Filter out enrollments where the course might have been deleted
        const validEnrollments = enrollments.filter(e => e.course);

        // 3. Calculate Global Stats
        const totalCourses = validEnrollments.length;

        const totalCompletedLessons = validEnrollments.reduce((total, enrollment) => {
            return total + (enrollment.completedLessons ? enrollment.completedLessons.length : 0);
        }, 0);

        // 4. Format the "Active Courses" list
        const activeCourses = validEnrollments.map(enrollment => {
            const course = enrollment.course;

            // Calculate total lessons in the course
            let totalLessons = 0;
            if (course.modules && course.modules.length > 0) {
                totalLessons = course.modules.reduce((acc, module) => acc + (module.lessons ? module.lessons.length : 0), 0);
            }

            // Find the "Next Lesson"
            let nextLessonTitle = "Course Completed";
            let foundNext = false;

            if (course.modules) {
                for (const module of course.modules) {
                    if (foundNext) break;
                    if (module.lessons) {
                        for (const lesson of module.lessons) {
                            const isCompleted = enrollment.completedLessons.some(id => id.toString() === lesson._id.toString());
                            if (!isCompleted) {
                                nextLessonTitle = lesson.title;
                                foundNext = true;
                                break;
                            }
                        }
                    }
                }
            }

            // Determine status
            const progress = enrollment.progress || 0;
            const status = progress === 100 ? 'Completed' : 'In Progress';
            const completedCount = enrollment.completedLessons ? enrollment.completedLessons.length : 0;

            return {
                _id: course._id,
                title: course.title,
                thumbnail: course.thumbnail,
                duration: course.duration,
                category: course.category,
                level: course.level,
                instructor: course.instructor ? course.instructor.name : 'Unknown Instructor',
                progress: progress,
                totalLessons: totalLessons,
                completedLessons: completedCount,
                nextLesson: nextLessonTitle,
                status: status
            };
        });

        // 4. Send the final package
        res.json({
            stats: {
                totalCourses,
                totalCompletedLessons,
                // You can add assignments/quizzes here later
            },
            courses: activeCourses
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};