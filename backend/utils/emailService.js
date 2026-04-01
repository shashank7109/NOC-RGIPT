const nodemailer = require('nodemailer');

async function sendNOCStatusEmail({ studentEmail, studentName, companyName, newStatus, remarks, actionByRole }) {
  const user = process.env.SMTP_EMAIL || process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
  const secure = port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  const safeName = studentName || 'Student';
  const safeCompany = companyName || 'your organization';
  const safeRemarks = remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : '';

  let subject = 'NOC Status Update';
  let html = `<p>Dear ${safeName},</p><p>Your NOC application status has been updated.</p>${safeRemarks}`;

  const status = String(newStatus || '').toUpperCase();
  if (status === 'UNDER_REVIEW_HEAD') {
    subject = `NOC Update: Department Cleared for ${safeCompany}`;
    html = `
      <p>Dear ${safeName},</p>
      <p>Your NOC requisition for <strong>${safeCompany}</strong> has been verified and cleared by your Department Officer.</p>
      <p>It has now been forwarded to the <strong>TNP Head</strong> for final approval.</p>
      ${safeRemarks}
      <p>Regards,<br/>Training & Placement Cell</p>
    `;
  } else if (status === 'READY_FOR_COLLECTION') {
    subject = `NOC Approved: Ready for Collection — ${safeCompany}`;
    html = `
      <p>Dear ${safeName},</p>
      <p>Congratulations. Your NOC for <strong>${safeCompany}</strong> has been officially approved by the TNP Head.</p>
      <p>Your document is now <strong>ready for collection</strong>. Please visit the TNP cell to collect your hardcopy.</p>
      ${safeRemarks}
      <p>Regards,<br/>Training & Placement Cell</p>
    `;
  } else if (status.includes('REJECTED')) {
    const actor = actionByRole || 'Approver';
    subject = `NOC Requisition Declined — ${safeCompany}`;
    html = `
      <p>Dear ${safeName},</p>
      <p>We regret to inform you that your NOC requisition for <strong>${safeCompany}</strong> has been declined by the <strong>${actor}</strong>.</p>
      ${safeRemarks || '<p><strong>Reason/Remarks:</strong> Not specified.</p>'}
      <p>Regards,<br/>Training & Placement Cell</p>
    `;
  }

  const mail = {
    from: process.env.SMTP_FROM || 'NOC Portal <noreply@rgipt.ac.in>',
    to: studentEmail,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mail);
    console.log(`NOC status email sent to ${studentEmail} for status ${status}`);
  } catch (err) {
    console.error('Failed to send NOC status email:', err.message);
  }
}

module.exports = { sendNOCStatusEmail };
