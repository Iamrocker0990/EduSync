const User = require('../models/User');

/**
 * @desc    Get all institutions
 * @route   GET /api/admin/institutions
 * @access  Private/SuperAdmin
 */
const getInstitutions = async (req, res) => {
    try {
        const query = req.query.status ? { role: 'institution', approvalStatus: req.query.status } : { role: 'institution' };
        const institutions = await User.find(query).select('-password');
        res.json(institutions);
    } catch (error) {
        console.error('Error fetching institutions:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Approve/Reject institution implementation
 * @route   PUT /api/admin/institution/:id/status
 * @access  Private/SuperAdmin
 */
const updateInstitutionStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be approved or rejected.' });
        }

        const institution = await User.findById(req.params.id);

        if (!institution || institution.role !== 'institution') {
            return res.status(404).json({ message: 'Institution not found' });
        }

        institution.approvalStatus = status;
        institution.approvedBy = req.user._id;
        institution.approvedAt = Date.now();
        const updatedInstitution = await institution.save();

        // Cascade Protection: If rejected, auto-reject teachers under this institution
        if (status === 'rejected') {
            await User.updateMany(
                { institutionId: institution._id, role: 'teacher' },
                { $set: { approvalStatus: 'rejected', accountStatus: 'BLOCKED' } }
            );
        }

        res.json(updatedInstitution);
    } catch (error) {
        console.error('Error updating institution status:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const approveInstitution = async (req, res) => {
    req.body.status = 'approved';
    await updateInstitutionStatus(req, res);
};

const rejectInstitution = async (req, res) => {
    req.body.status = 'rejected';
    await updateInstitutionStatus(req, res);
};

module.exports = {
    getInstitutions,
    updateInstitutionStatus,
    approveInstitution,
    rejectInstitution,
};
