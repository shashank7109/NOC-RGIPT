const Application = require('../models/Application');
const ApplicationLog = require('../models/ApplicationLog');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');
const { sendNOCStatusEmail } = require('../utils/emailService');

const getOfficerApplications = async (req, res) => {
  try {
    // If user is TNP Head, fetch applications scoped to their actions or pending ones
    if (req.user.role === 'TNPHead') {
      const applications = await Application.find({
        $or: [
          { status: 'UNDER_REVIEW_HEAD' }, // Pending for Head
          { approvedBy: req.user._id },    // Approved by this specific Head
          { rejectedBy: req.user._id }     // Rejected by this specific Head
        ]
      })
        .populate('studentId', 'name email rollNumber')
        .populate('departmentId', 'name')
        .sort({ updatedAt: -1 });
      return res.json(applications);
    }

    // If user is Dept Officer, fetch applications for their department, scoped to their actions or pending
    const applications = await Application.find({
      departmentId: req.user.departmentId,
      $or: [
        { status: { $in: ['SUBMITTED', 'UNDER_REVIEW_DEPT'] } }, // Pending for Dept
        { recommendedBy: req.user._id },                         // Recommended by this specific Officer
        { rejectedBy: req.user._id }                            // Rejected by this specific Officer
      ]
    })
      .populate('studentId', 'name email rollNumber')
      .populate('departmentId', 'name')
      .sort({ updatedAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, remarks } = req.body; 
    
    const application = await Application.findById(id).populate('studentId', 'name email');
    if (!application) return res.status(404).json({ message: 'Not found' });

    let newStatus = application.status;
    const isHead = req.user.role === 'TNPHead';

    if (action === 'REJECT') {
      newStatus = isHead ? 'REJECTED_HEAD' : 'REJECTED_DEPT';
      application.rejectedAt = new Date();
      application.rejectedBy = req.user._id;
    } else if (action === 'APPROVE') {
      newStatus = isHead ? 'APPROVED_FINAL' : 'UNDER_REVIEW_HEAD';
      if (isHead) {
        application.currentStage = 'DONE';
        application.approvedAt = new Date();
        application.approvedBy = req.user._id;
      } else {
        application.recommendedAt = new Date();
        application.recommendedBy = req.user._id;
      }
    } else if (action === 'COLLECTED') {
      newStatus = 'COLLECTED';
    }

    application.status = newStatus;
    application.remarks = remarks || application.remarks;
    
    if (!application.rollNumber) application.rollNumber = 'N/A';
    
    if (newStatus === 'APPROVED_FINAL') {
      application.status = 'READY_FOR_COLLECTION';
    }

    await application.save();

    await ApplicationLog.create({
      applicationId: id,
      actionBy: req.user._id,
      role: req.user.role,
      action,
      remarks
    });

    // Notify student (fire-and-forget)
    (async () => {
      try {
        const actor = isHead ? 'TNP Head' : 'Department Officer';
        const effectiveStatus = application.status;
        await sendNOCStatusEmail({
          studentEmail: application.studentId.email,
          studentName: application.studentId.name,
          companyName: application.companyName,
          newStatus: effectiveStatus,
          remarks,
          actionByRole: actor
        });
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError.message);
      }
    })();

    res.json(application);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

module.exports = { getOfficerApplications, updateApplicationStatus };
