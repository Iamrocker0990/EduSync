const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/auth');
const { getInstitutions, approveInstitution, rejectInstitution } = require('../controllers/superadminController');

// All routes here are protected and require superadmin role
router.use(protect, authorizeRoles('superadmin', 'admin'));

router.get('/institutions', getInstitutions);
router.patch('/institution/:id/approve', approveInstitution);
router.patch('/institution/:id/reject', rejectInstitution);

module.exports = router;
