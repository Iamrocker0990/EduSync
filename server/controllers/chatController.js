const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Enrollment = require('../models/Enrollment');

// GET /api/chat/teachers
// Fetch eligible teachers for a student based on active enrollments
exports.getEligibleTeachers = async (req, res) => {
    try {
        const studentId = req.user._id;

        // Find all courses the student is enrolled in
        const enrollments = await Enrollment.find({ student: studentId })
            .populate({
                path: 'course',
                select: 'title instructor',
                populate: { path: 'instructor', select: 'name avatar' }
            });

        // Filter out any enrollments without a course or instructor
        const validEnrollments = enrollments.filter(enrol => enrol.course && enrol.course.instructor);

        // Map to a clean array of teacher + course tag objects
        const teacherCoursePairs = validEnrollments.map(enrol => ({
            teacherId: enrol.course.instructor._id,
            teacherName: enrol.course.instructor.name,
            teacherAvatar: enrol.course.instructor.avatar,
            courseId: enrol.course._id,
            courseTitle: enrol.course.title
        }));

        res.json(teacherCoursePairs);
    } catch (error) {
        console.error("Error fetching teachers:", error);
        res.status(500).json({ message: 'Server error fetching teachers' });
    }
};

// POST /api/chat/messages
// Send a new message
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, courseId, text } = req.body;
        const senderId = req.user._id;

        // Determine who is student and who is teacher depending on sender's role
        // This is important because the conversation schema links student and teacher explicitly
        const studentId = req.user.role === 'student' ? senderId : receiverId;
        const teacherId = req.user.role === 'teacher' ? senderId : receiverId;

        // Verify Enrollment Restriction (if student is sending)
        if (req.user.role === 'student') {
            const isEnrolled = await Enrollment.findOne({ student: studentId, course: courseId });
            if (!isEnrolled) {
                return res.status(403).json({ message: 'Not enrolled in this course.' });
            }
        }

        // Find or Create Conversation
        let conversation = await Conversation.findOne({ student: studentId, teacher: teacherId, course: courseId });

        if (!conversation) {
            conversation = await Conversation.create({ student: studentId, teacher: teacherId, course: courseId });
        }

        const newMessage = await Message.create({
            conversationId: conversation._id,
            sender: senderId,
            text
        });

        // Update last message reference
        conversation.lastMessage = newMessage._id;
        await conversation.save();

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: 'Failed to send message' });
    }
};

// GET /api/chat/conversations
// Fetch all conversations for the sidebar
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        const conversations = await Conversation.find({
            $or: [{ student: userId }, { teacher: userId }]
        })
            .populate('student', 'name avatar')
            .populate('teacher', 'name avatar')
            .populate('course', 'title category')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        res.json(conversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ message: 'Failed to fetch conversations' });
    }
};

// GET /api/chat/messages/:conversationId
// Fetch all messages for a specific conversation
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;

        // Verify the user is part of the conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        if (conversation.student.toString() !== userId.toString() && conversation.teacher.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

        // Optionally mark messages as read here
        // await Message.updateMany({ conversationId, sender: { $ne: userId }, read: false }, { read: true });

        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
};
