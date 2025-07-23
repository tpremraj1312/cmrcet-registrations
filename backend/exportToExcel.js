import ExcelJS from 'exceljs';

export async function exportToExcel(registrations, baseUrl = `${import.meta.env.VITE_BACKEND_URL}`) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Registrations');

  worksheet.columns = [
    { header: 'Name', key: 'name', width: 20 },
    { header: "Father's Name", key: 'fatherName', width: 20 },
    { header: 'Address', key: 'address', width: 30 },
    { header: 'Mobile', key: 'mobile', width: 15 },
    { header: 'JEE Rank', key: 'jeeRank', width: 10 },
    { header: 'EAPCET Rank', key: 'eapcetRank', width: 10 },
    { header: 'Resident', key: 'resident', width: 15 },
    { header: '10th Board', key: 'board10th', width: 20 },
    { header: '10th Max Marks', key: 'maxMarks10th', width: 15 },
    { header: '10th Marks Obtained', key: 'marksObtained10th', width: 15 },
    { header: '10th GPA', key: 'gpa10th', width: 10 },
    { header: '12th Board', key: 'board12th', width: 20 },
    { header: '12th Max Marks', key: 'maxMarks12th', width: 15 },
    { header: '12th Marks Obtained', key: 'marksObtained12th', width: 15 },
    { header: '12th Percentage', key: 'percentage12th', width: 15 },
    { header: 'Priority 1', key: 'priority1', width: 25 },
    { header: 'Priority 2', key: 'priority2', width: 25 },
    { header: 'Priority 3', key: 'priority3', width: 25 },
    { header: 'Priority 4', key: 'priority4', width: 25 },
    { header: 'Priority 5', key: 'priority5', width: 25 },
    { header: 'Priority 6', key: 'priority6', width: 25 },
    { header: 'Priority 7', key: 'priority7', width: 25 },
    { header: 'Photo', key: 'photo', width: 20 },
    { header: '10th Memo', key: 'memo10th', width: 20 },
    { header: '12th Memo', key: 'memo12th', width: 20 },
    { header: 'EAPCET Hall Ticket', key: 'eapcetHallTicket', width: 20 },
    { header: 'EAPCET Rank Card', key: 'eapcetRankCard', width: 20 },
    { header: 'JEE Hall Ticket', key: 'jeeHallTicket', width: 20 },
    { header: 'JEE Rank Card', key: 'jeeRankCard', width: 20 },
    { header: 'Submitted At', key: 'submittedAt', width: 20 },
  ];

  registrations.forEach((registration, index) => {
    const row = worksheet.addRow({
      name: registration.name,
      fatherName: registration.fatherName,
      address: registration.address,
      mobile: registration.mobile,
      jeeRank: registration.jeeRank,
      eapcetRank: registration.eapcetRank,
      resident: registration.resident,
      board10th: registration.board10th,
      maxMarks10th: registration.maxMarks10th,
      marksObtained10th: registration.marksObtained10th,
      gpa10th: registration.gpa10th,
      board12th: registration.board12th,
      maxMarks12th: registration.maxMarks12th,
      marksObtained12th: registration.marksObtained12th,
      percentage12th: registration.percentage12th,
      priority1: registration.priorities?.[0] || '',
      priority2: registration.priorities?.[1] || '',
      priority3: registration.priorities?.[2] || '',
      priority4: registration.priorities?.[3] || '',
      priority5: registration.priorities?.[4] || '',
      priority6: registration.priorities?.[5] || '',
      priority7: registration.priorities?.[6] || '',
      submittedAt: registration.submittedAt?.toISOString() || '',
    });

    const imageFields = [
      { field: 'photo', mime: 'image/jpeg' },
      { field: 'memo10th', mime: getMimeType(registration.memo10th) },
      { field: 'memo12th', mime: getMimeType(registration.memo12th) },
      { field: 'eapcetHallTicket', mime: getMimeType(registration.eapcetHallTicket) },
      { field: 'eapcetRankCard', mime: getMimeType(registration.eapcetRankCard) },
      { field: 'jeeHallTicket', mime: getMimeType(registration.jeeHallTicket) },
      { field: 'jeeRankCard', mime: getMimeType(registration.jeeRankCard) },
    ];

    imageFields.forEach(({ field, mime }) => {
      const value = registration[field];
      if (value) {
        if (mime && mime !== 'application/pdf') {
          const imageId = workbook.addImage({
            buffer: Buffer.isBuffer(value) ? value : Buffer.from(value.data),
            extension: mime === 'image/png' ? 'png' : 'jpeg',
          });

          worksheet.addImage(imageId, {
            tl: { col: worksheet.columns.findIndex(col => col.key === field) + 0.1, row: index + 1.1 },
            ext: { width: 100, height: 100 },
            editAs: 'absolute',
          });

          row.getCell(field).value = {
            text: 'View/Download Image',
            hyperlink: `${baseUrl}/api/image/${registration._id}/${field}`,
            tooltip: `Download ${field}`,
          };
        } else if (mime === 'application/pdf') {
          row.getCell(field).value = {
            text: 'View/Download PDF',
            hyperlink: `${baseUrl}/api/image/${registration._id}/${field}`,
            tooltip: `Download ${field}`,
          };
        }

        row.getCell(field).font = { color: { argb: 'FF0000FF' }, underline: true };
        row.height = 100;
      }
    });
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) row.height = 100;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

// Helper function to determine MIME type
function getMimeType(buffer) {
  if (!buffer) return null;
  const hex = buffer.toString('hex');
  if (hex.startsWith('25504446')) return 'application/pdf';
  return 'image/jpeg';
}
