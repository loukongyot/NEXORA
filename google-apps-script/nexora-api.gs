const SHEET_ID = 'PASTE_GOOGLE_SHEET_ID_HERE';
const SHEET_NAME = 'Daily Report';
const OUTPUT_FOLDER_ID = 'PASTE_OUTPUT_FOLDER_ID_HERE';

function doGet() {
  const data = {
    status: 'ok',
    updatedAt: new Date().toISOString(),
    formResponsesToday: getFormResponsesToday(),
    latestReportTotal: getLatestReportTotal(),
    outputFileCount: getOutputFileCount(),
    latestUpdates: getLatestUpdates(),
  };

  return jsonResponse(data);
}

function getFormResponsesToday() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) return 0;

    const values = sheet.getDataRange().getValues();
    const today = new Date();

    return values.slice(1).filter(function (row) {
      const timestamp = row[0];
      return timestamp instanceof Date &&
        timestamp.getFullYear() === today.getFullYear() &&
        timestamp.getMonth() === today.getMonth() &&
        timestamp.getDate() === today.getDate();
    }).length;
  } catch (error) {
    return 0;
  }
}

function getLatestReportTotal() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) return 0;

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return 0;

    return Math.max(0, lastRow - 1);
  } catch (error) {
    return 0;
  }
}

function getOutputFileCount() {
  try {
    const folder = DriveApp.getFolderById(OUTPUT_FOLDER_ID);
    const files = folder.getFiles();
    let count = 0;

    while (files.hasNext()) {
      files.next();
      count += 1;
    }

    return count;
  } catch (error) {
    return 0;
  }
}

function getLatestUpdates() {
  const updates = [];

  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (sheet && sheet.getLastRow() > 1) {
      updates.push('Daily Report: ' + (sheet.getLastRow() - 1) + ' records');
    }
  } catch (error) {
    updates.push('Daily Report: not configured');
  }

  try {
    updates.push('Output files: ' + getOutputFileCount());
  } catch (error) {
    updates.push('Output folder: not configured');
  }

  return updates;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
