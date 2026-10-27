/**
 * WPG early-access sign-ups → Google Sheet
 * ------------------------------------------------------------
 * Paste this whole file into Extensions › Apps Script of an empty
 * Google Sheet, then deploy it as a Web app (see README.md, step 2).
 *
 * Every sign-up becomes one row: Date · Email · Shop · Page.
 * You also get an email for each new sign-up (turn it off below).
 */

var SHEET_NAME = 'Sign-ups';
var NOTIFY_EMAIL = 'inegvin@gmail.com'; // set to '' to stop the emails

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var p = (e && e.parameter) || {};

    // Spam trap: real people never fill the hidden "website" field.
    if (p.website) return reply_({ result: 'ok' });

    var email = clean_(p.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return reply_({ result: 'error', error: 'invalid email' });
    }
    var shop = clean_(p.shop);
    var source = clean_(p.source);

    var sheet = getSheet_();
    sheet.appendRow([new Date(), email, shop, source]);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(NOTIFY_EMAIL, 'WPG early access: new sign-up',
        'Email: ' + email + '\nShop: ' + (shop || '—') + '\nFrom: ' + (source || '—'));
    }
    return reply_({ result: 'ok' });
  } catch (err) {
    return reply_({ result: 'error' });
  } finally {
    lock.releaseLock();
  }
}

/* Opening the web-app link in a browser shows this short text. */
function doGet() {
  return ContentService.createTextOutput('WPG sign-up endpoint is running.');
}

function getSheet_() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
    sheet.appendRow(['Date', 'Email', 'Shop', 'Page']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/* Trim, shorten, and stop text from being read as a spreadsheet formula. */
function clean_(value) {
  var v = String(value || '').trim().slice(0, 200);
  if (/^[=+\-@]/.test(v)) v = "'" + v;
  return v;
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
