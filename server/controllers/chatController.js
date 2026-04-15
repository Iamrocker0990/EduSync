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

        let fileUrl = null;
        let fileName = null;
        let fileType = null;

        if (req.file) {
            fileUrl = req.file.path;
            fileName = req.file.originalname;
            fileType = req.file.mimetype;
        }

        const newMessage = await Message.create({
            conversationId: conversation._id,
            sender: senderId,
            text: text || "",
            fileUrl,
            fileName,
            fileType
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

// DELETE /api/chat/messages/:messageId
// Delete a specific message
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Verify sender is deleting their own message
        if (message.sender.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }

        // Check if there is a cloudinary file attached to the message
        if (message.fileUrl && message.fileUrl.includes('res.cloudinary.com')) {
            try {
                // Extract public ID from Cloudinary URL
                // Example: https://res.cloudinary.com/cloudname/image/upload/v1234/edusync/general/filename.png
                // Public ID is "edusync/general/filename"
                const parts = message.fileUrl.split('/upload/');
                if (parts.length === 2) {
                    const idWithExtension = parts[1].split('/').slice(1).join('/'); // remove the v1234 version part
                    const publicId = idWithExtension.substring(0, idWithExtension.lastIndexOf('.')) || idWithExtension;
                    
                    const cloudinary = require('../config/cloudinary');
                    await cloudinary.uploader.destroy(publicId);
                }
            } catch (cloudError) {
                console.error("Error deleting file from Cloudinary:", cloudError);
                // We'll still delete the database record even if Cloudinary fails
            }
        }

        await Message.findByIdAndDelete(messageId);

        res.json({ message: 'Message deleted successfully', messageId });
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({ message: 'Failed to delete message' });
    }
};
