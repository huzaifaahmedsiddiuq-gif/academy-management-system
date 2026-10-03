/**
 * WhatsApp Message Formatter
 * Generates visually striking, beautifully formatted WhatsApp messages with emojis,
 * bold headings, clean box styling, and dynamic academy branding.
 */

export const formatFeeReceiptWhatsApp = ({ academy, student, fee, payment }) => {
  const name = academy.academy_name || 'Apex Horizon Academy';
  const currency = academy.currency_symbol || 'Rs.';

  return `*╔════════════════════════════╗*
*   🏛️  ${name.toUpperCase()}  *
*╚════════════════════════════╝*
_${academy.tagline || 'Excellence in Education'}_

*━━━━━━━━ 🧾 OFFICIAL FEE RECEIPT ━━━━━━━━*

👤 *Student Name:* ${student.full_name}
🆔 *Roll Number:* ${student.roll_number}
🏫 *Class & Section:* ${student.class_name || student.class} (${student.section || 'A'})
📅 *Fee Month:* ${fee.month_year}

*─── 💳 PAYMENT BREAKDOWN ───*
💵 *Total Fee:* ${currency} ${Number(fee.total_amount).toLocaleString()}
✅ *Amount Paid Now:* ${currency} ${Number(payment?.amount || fee.paid_amount).toLocaleString()}
⚠️ *Remaining Due:* ${currency} ${Number(fee.remaining_amount).toLocaleString()}
📌 *Payment Status:* *[ ${fee.status.toUpperCase()} ]*
🧾 *Receipt Number:* ${payment?.receipt_number || 'N/A'}
📆 *Payment Date:* ${payment?.payment_date ? new Date(payment.payment_date).toLocaleDateString() : new Date().toLocaleDateString()}
💳 *Payment Mode:* ${(payment?.payment_method || 'Cash').toUpperCase()}

${Number(fee.remaining_amount) > 0 ? `⚠️ *Reminder:* Kindly clear the remaining balance before due date to avoid late charges.` : `🎉 *Note:* Thank you! All dues for this session have been cleared.`}

*──────────────────────────────*
📞 *Contact Admin:* ${academy.phone || '+92 300 1234567'}
📍 *Address:* ${academy.address || 'Academy Campus'}
🌐 *Portal:* ${academy.website || 'Visit student portal for online statements'}`;
};

export const formatResultWhatsApp = ({ academy, student, exam, results, summary }) => {
  const name = academy.academy_name || 'Apex Horizon Academy';

  let subjectLines = '';
  if (Array.isArray(results)) {
    subjectLines = results.map(r => {
      const icon = Number(r.obtained_marks) >= 80 ? '🌟' : Number(r.obtained_marks) >= 60 ? '🔹' : '🔸';
      return `${icon} *${r.subject_name}:* ${r.obtained_marks}/${r.total_marks} _(${r.grade})_`;
    }).join('\n');
  }

  return `*╔════════════════════════════╗*
*   🏆  ${name.toUpperCase()}  *
*╚════════════════════════════╝*

*━━━━━━━━ 📊 OFFICIAL RESULT CARD ━━━━━━━━*

👤 *Student:* ${student.full_name}
🆔 *Roll No:* ${student.roll_number}
🏫 *Class:* ${student.class_name || student.class}
📝 *Examination:* *${exam.title}*

*─── 📖 SUBJECT-WISE MARKS ───*
${subjectLines || 'Result details available on portal.'}

*─── 🎯 OVERALL PERFORMANCE ───*
📈 *Total Marks:* ${summary.totalMarks}
✨ *Obtained Marks:* ${summary.obtainedMarks}
📊 *Percentage:* *${summary.percentage}%*
🎖️ *Overall Grade:* *[ ${summary.grade} ]*

${summary.remarks ? `💬 *Remarks:* ${summary.remarks}` : ''}

*──────────────────────────────*
📞 *Inquiries:* ${academy.phone}
🌐 Check full academic progression in the Student Portal.`;
};

export const formatAttendanceWhatsApp = ({ academy, student, stats, month }) => {
  const name = academy.academy_name || 'Apex Horizon Academy';

  return `*╔════════════════════════════╗*
*   📅  ${name.toUpperCase()}  *
*╚════════════════════════════╝*

*━━━━━━━━ 📋 ATTENDANCE REPORT ━━━━━━━━*

👤 *Student:* ${student.full_name}
🆔 *Roll No:* ${student.roll_number}
🏫 *Class:* ${student.class_name || student.class}
📆 *Month / Session:* ${month || 'Current Academic Month'}

*─── 📊 ATTENDANCE SUMMARY ───*
📈 *Attendance Rate:* *${stats.percentage}%*
🟢 *Present Days:* ${stats.present}
🔴 *Absent Days:* ${stats.absent}
🟡 *Approved Leave:* ${stats.leave}
📚 *Total Working Days:* ${stats.total}

${stats.percentage < 75 ? `⚠️ *Caution:* Student attendance is below the mandatory 75% threshold. Please ensure regular attendance.` : `🌟 *Appreciation:* Excellent punctuality and dedication!`}

*──────────────────────────────*
📞 *Inquiries:* ${academy.phone}`;
};

export const formatHomeworkWhatsApp = ({ academy, homework, className, subjectName }) => {
  const name = academy.academy_name || 'Apex Horizon Academy';

  return `*╔════════════════════════════╗*
*   📚  ${name.toUpperCase()}  *
*╚════════════════════════════╝*

*━━━━━━━━ 📝 NEW HOMEWORK ASSIGNMENT ━━━━━━━━*

🏫 *Class:* ${className}
📖 *Subject:* ${subjectName}
📌 *Topic:* *${homework.title}*
📆 *Assigned Date:* ${new Date(homework.assigned_date).toLocaleDateString()}
⏰ *Due Date:* *${new Date(homework.due_date).toLocaleDateString()}*

*─── 📋 DESCRIPTION & INSTRUCTIONS ───*
${homework.description || 'Complete the assignment as guided during class.'}

${homework.file_url ? `📎 *Attachment Link:* ${homework.file_url}` : ''}

*──────────────────────────────*
Kindly submit before the deadline on the Student Portal.`;
};
