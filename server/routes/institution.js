const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/auth');
const {
    getInstitutionTeachers,
    updateTeacherStatus,
    getInstitutionCourses,
    updateCourseStatus
} = require('../controllers/institutionController');

// All routes here are protected and require 'institution' role
router.use(protect, authorizeRoles('institution'));

router.get('/teachers', getInstitutionTeachers);
router.patch('/teacher/:id/:status', updateTeacherStatus);

router.get('/courses', getInstitutionCourses);
router.patch('/course/:id/:status', updateCourseStatus);

module.exports = router;
