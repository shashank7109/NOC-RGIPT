const Application = require('../models/Application');
const ApplicationLog = require('../models/ApplicationLog');
const RoutingConfig = require('../models/RoutingConfig');
const sendEmail = require('../utils/sendEmail');

const submitApplication = async (req, res) => {
  try {
    const { 
      departmentId, rollNumber, degreeCourse, branch, currentYear, yearSession, latestCPI, contactNo, 
      internshipType, durationFrom, durationTo, companyName, organizationAddress,
      mentorName, mentorDesignation, mentorContact, mentorEmail,
      addresseeName, addresseeDesignation, addresseeContact, addresseeEmail,
      studentMessage
    } = req.body;
    
    const offerLetter = req.files && req.files['offerLetter'] ? `uploads/${req.files['offerLetter'][0].filename}` : null;
    const statementOfObjective = req.files && req.files['statementOfObjective'] ? `uploads/${req.files['statementOfObjective'][0].filename}` : null;
    const mandatoryDocument = req.files && req.files['mandatoryDocument'] ? `uploads/${req.files['mandatoryDocument'][0].filename}` : null;
    const nocFormat = req.files && req.files['nocFormat'] ? `uploads/${req.files['nocFormat'][0].filename}` : null;

    // Check for duplicates
    const exist = await Application.findOne({
      studentId: req.user._id, companyName,
      status: { $regex: /^(SUBMITTED|UNDER_REVIEW|APPROVED)/, $options: 'i' }
    });
    if (exist) {
      return res.status(400).json({ message: 'Application for this company is already active or approved.' });
    }

    const application = await Application.create({
      studentId: req.user._id,
      departmentId, rollNumber, degreeCourse, branch, currentYear, yearSession, latestCPI, contactNo,
      internshipType, durationFrom, durationTo, companyName, organizationAddress,
      mentorName, mentorDesignation, mentorContact, mentorEmail,
      addresseeName, addresseeDesignation, addresseeContact, addresseeEmail,
      status: 'SUBMITTED',
      offerLetter, statementOfObjective, mandatoryDocument, nocFormat, studentMessage
    });

    await ApplicationLog.create({
      applicationId: application._id,
      actionBy: req.user._id,
      role: 'Student',
      action: 'Submitted Application',
      timestamp: new Date()
    });

    // Notify Officer based on routing config
    const routing = await RoutingConfig.findOne({ departmentId });
    if (routing && routing.primaryApproverEmail) {
      try {
        await sendEmail({
          email: routing.primaryApproverEmail,
          subject: 'New NOC Application Submitted',
          message: `A new NOC application for ${companyName} has been submitted by student ${req.user.name}.`
        });
      } catch (emailError) {
        console.error('Failed to send officer notification email:', emailError.message);
      }
    }

    // Move to next stage instantly
    application.status = 'UNDER_REVIEW_DEPT';
    await application.save();

    res.status(201).json(application);
  } catch (error) {
    console.error('Submit Error:', error);
    res.status(500).json({ message: error.message || 'Server error', error: error.message });
  }
};

const getMyApplications = async (req, res) => {
  const applications = await Application.find({ studentId: req.user._id })
    .populate('departmentId', 'name')
    .sort({ createdAt: -1 });
  res.json(applications);
};

const getApplicationLogs = async (req, res) => {
  const logs = await ApplicationLog.find({ applicationId: req.params.id })
    .populate('actionBy', 'name role')
    .sort({ createdAt: 1 });
  res.json(logs);
};

module.exports = { submitApplication, getMyApplications, getApplicationLogs };
