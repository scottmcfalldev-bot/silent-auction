// LSH Silent Auction — Google Apps Script backend
// Version 3.0 (2026)
//
// Setup steps are in apps-script/SETUP.md. Each year: update CONFIG and ITEMS
// below, paste this whole file into the script editor, and deploy.

// ============================================
// CONFIGURATION — update these each year
// ============================================
const CONFIG = {
  // The ID from this year's Sheet URL (docs.google.com/spreadsheets/d/<ID>/edit).
  // Leave '' only if this script was opened from the Sheet's Extensions menu.
  SPREADSHEET_ID: '15gr04ZUgxbXddl-oWQydj6K8_SHFIHDVpmMfCl94wwg',

  // Must match endTime in config.js. Keep the timezone offset on the end
  // (-05:00 = Eastern Standard Time, -04:00 = Eastern Daylight Time).
  AUCTION_END_TIME: new Date('2026-12-06T21:00:00-05:00'),

  ADMIN_EMAIL: 'scottmcfalldev@gmail.com',     // gets high-bid alerts + the winner summary
  ORG_NAME: 'Lucy S. Herring Parent Team',     // used in emails
  CONTACT_NAME: 'Mindy Smith',                 // who winners hear from about payment/pickup
  CONTACT_EMAIL: 'herringparentteam@gmail.com',
  TIMEZONE: 'America/New_York',                // for times shown in emails

  MAX_RAISE: 100,              // a bid can't be more than this above the current bid
  MAX_BID_AMOUNT: 1000000,
  HIGH_BID_ALERT: 1000,        // email the admin when a bid reaches this amount
  ENABLE_EMAIL: true,          // set false while testing
  RATE_LIMIT_WINDOW: 5,        // minutes
  RATE_LIMIT_MAX_BIDS: 5,      // max bids per email per window
  ENABLE_LOGGING: true
};

// Every item that can be bid on. Bids for anything not listed here are rejected.
// Don't edit by hand — `node tools/sync-script-items.js` fills this in from config.js.
// ITEMS:START
const ITEMS = {
  "AI Consultation": { startingBid: 30, quantity: 1 },
  "1 Hour Dietitian Consultation": { startingBid: 60, quantity: 1 },
  "Orange Peel Concert Package": { startingBid: 40, quantity: 1 },
  "rEvolve Gift Card - $100 value": { startingBid: 10, quantity: 2 },
  "Kids Yoga & Art Session": { startingBid: 20, quantity: 1 },
  "Homemade Cookies - 3 Months": { startingBid: 20, quantity: 1 },
  "Sommelier Wine Tasting": { startingBid: 300, quantity: 1 },
  "Wagner Family Wines": { startingBid: 45, quantity: 1 },
  "Jeeper Champagne": { startingBid: 75, quantity: 1 },
  "French Wine Collection": { startingBid: 45, quantity: 1 },
  "Italian Wine Duo": { startingBid: 20, quantity: 1 },
  "California Chardonnay Collection": { startingBid: 25, quantity: 1 },
  "Private Tutoring Sessions": { startingBid: 25, quantity: 1 },
  "187 Killer Pads Set": { startingBid: 10, quantity: 1 },
  "Fresh Cinnamon Rolls": { startingBid: 10, quantity: 1 },
  "Kendra Scott Necklace": { startingBid: 40, quantity: 1 },
  "Handmade Large Bag": { startingBid: 50, quantity: 1 },
  "Cameras Note Cards": { startingBid: 10, quantity: 1 },
  "Skates Note Cards": { startingBid: 10, quantity: 1 },
  "Lace Note Cards": { startingBid: 10, quantity: 1 },
  "Jalapeno Jelly Jar": { startingBid: 5, quantity: 12 },
  "Blue Beaded Earrings": { startingBid: 12, quantity: 1 },
  "Purple Dangle Earrings": { startingBid: 10, quantity: 1 },
  "LSH-Themed Bracelet": { startingBid: 10, quantity: 1 },
  "Blue-Black Metallic Bracelet": { startingBid: 12, quantity: 1 },
  "Packaged Turquoise Bracelet": { startingBid: 12, quantity: 1 },
  "Big Brown Stone Bracelet": { startingBid: 12, quantity: 1 },
  "Turquoise Bracelet with Feather": { startingBid: 10, quantity: 1 },
  "Brown Stone Vibes Bracelet": { startingBid: 10, quantity: 1 },
  "Green Nature Vibes Bracelet": { startingBid: 12, quantity: 1 },
  "Blue Bracelet with Hand Wings": { startingBid: 12, quantity: 1 },
  "Holiday Pinecone Wreath": { startingBid: 20, quantity: 1 },
  "Crocheted Yarn Pumpkins": { startingBid: 10, quantity: 1 },
  "rEvolve Gift Basket": { startingBid: 10, quantity: 1 },
  "LSH Tote Bag": { startingBid: 10, quantity: 4 },
  "Tabletop Roleplaying Game Session": { startingBid: 40, quantity: 3 },
  "Stained Glass Axolotl": { startingBid: 15, quantity: 1 },
  "Coffee Lovers Bundle": { startingBid: 80, quantity: 2 },
  "Hand Crafted Gift Basket": { startingBid: 20, quantity: 1 },
  "Three Christmas Ornaments": { startingBid: 30, quantity: 1 },
  "Xmas Flamingo Ornament": { startingBid: 10, quantity: 1 },
  "Soccer Ball Ornament": { startingBid: 8, quantity: 1 },
  "Professor Bunny Ornament": { startingBid: 10, quantity: 1 },
  "Avocado Ornament": { startingBid: 10, quantity: 1 },
  "Bad Bunny Ornament": { startingBid: 8, quantity: 1 },
  "Mini Christmas Photo Session": { startingBid: 75, quantity: 1 },
  "Cabo Card Game Deck": { startingBid: 2, quantity: 6 },
};
// ITEMS:END

const BIDS_SHEET = 'Bids';
const BID_COLUMNS = ['Timestamp', 'Full Name', 'Email Address', 'Phone Number', 'Bid Amount', 'Item Name', 'Bid ID', 'User Agent'];
const CACHE_KEY = 'publicBids';

// ============================================
// WEB APP ENTRY POINTS
// ============================================

function doGet(e) {
  const params = (e && e.parameter) || {};
  try {
    if (params.action === 'getBids') return createJsonResponse(getPublicBids());
    if (params.action === 'getStatus') return createJsonResponse(getAuctionStatus());
    return createJsonResponse({ error: 'Invalid action' });
  } catch (error) {
    logError(error, 'doGet', params);
    return createJsonResponse({ error: 'Server error occurred' });
  }
}

function doPost(e) {
  const params = (e && e.parameter) || {};
  try {
    if (params.action === 'submitBid') return createJsonResponse(submitBid(params));
    return createJsonResponse({ success: false, error: 'Invalid action' });
  } catch (error) {
    logError(error, 'doPost', { action: params.action, email: params.email });
    return createJsonResponse({ success: false, error: 'Server error occurred' });
  }
}

// ============================================
// BIDDING RULES (keep in step with index.html)
// ============================================

function getMinimumBidIncrement(currentBid) {
  if (currentBid < 100) return 5;
  if (currentBid < 500) return 10;
  if (currentBid < 1000) return 25;
  if (currentBid < 5000) return 50;
  return 100;
}

// Bids currently winning an item, best first. One entry for a normal item,
// up to `quantity` for a multi-winner item (each person counted once).
function getWinningBids(itemName, rows) {
  const quantity = ITEMS[itemName] ? ITEMS[itemName].quantity : 1;
  const sorted = rows
    .filter(function (row) { return row.itemName === itemName; })
    .sort(function (a, b) { return b.amount - a.amount || a.timestamp - b.timestamp; });

  const seen = {};
  const winners = [];
  for (let i = 0; i < sorted.length && winners.length < quantity; i++) {
    if (seen[sorted[i].email]) continue;
    seen[sorted[i].email] = true;
    winners.push(sorted[i]);
  }
  return winners;
}

// Lowest and highest amount the next bid on this item may be.
function getBidRange(itemName, rows) {
  const item = ITEMS[itemName];
  const winners = getWinningBids(itemName, rows);
  if (winners.length < item.quantity) {
    // An open spot: the starting bid is enough.
    return { min: item.startingBid, max: item.startingBid + CONFIG.MAX_RAISE };
  }
  const toBeat = winners[winners.length - 1].amount;
  return { min: toBeat + getMinimumBidIncrement(toBeat), max: toBeat + CONFIG.MAX_RAISE };
}

// ============================================
// CORE FUNCTIONS
// ============================================

// What the public page sees. Deliberately contains no names, emails or full
// phone numbers — only amounts and the last 4 digits of the bidder's phone.
function getPublicBids() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const rows = readBids();
  const bids = {};
  Object.keys(ITEMS).forEach(function (itemName) {
    const winners = getWinningBids(itemName, rows).map(function (row) {
      return { bidAmount: row.amount, last4: phoneLast4(row.phone) };
    });
    if (winners.length === 0) return;
    bids[itemName] = ITEMS[itemName].quantity > 1 ? winners : winners[0];
  });

  cache.put(CACHE_KEY, JSON.stringify(bids), 10);
  return bids;
}

function submitBid(params) {
  if (!isAuctionOpen()) {
    return { success: false, code: 'CLOSED', error: 'The auction has ended. No more bids can be accepted.' };
  }

  const bid = {
    bidId: sanitizeInput(params.bidId),
    fullName: sanitizeInput(params.fullName),
    email: sanitizeInput(params.email).toLowerCase(),
    phone: sanitizeInput(params.phone),
    bidAmount: Number(params.bidAmount),
    itemName: sanitizeInput(params.itemName),
    userAgent: sanitizeInput(params.userAgent || ''),
    timestamp: new Date()
  };

  const validationErrors = validateBidData(bid);
  if (validationErrors.length > 0) {
    logActivity('Validation Failed', { email: bid.email, errors: validationErrors });
    return { success: false, code: 'INVALID', error: validationErrors.join('. ') };
  }

  // One bid at a time, so two people can't both be accepted at the same price.
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (error) {
    return { success: false, code: 'BUSY', error: 'Lots of bids are coming in right now. Please try again in a moment.' };
  }

  try {
    const rows = readBids();

    if (rows.some(function (row) { return row.bidId === bid.bidId; })) {
      return { success: false, code: 'DUPLICATE', error: 'This bid has already been submitted.' };
    }

    if (!checkRateLimit(bid.email, rows)) {
      logActivity('Rate Limit Exceeded', { email: bid.email });
      return { success: false, code: 'RATE_LIMIT', error: 'Too many bids submitted. Please wait a few minutes before trying again.' };
    }

    const range = getBidRange(bid.itemName, rows);
    if (bid.bidAmount < range.min) {
      return {
        success: false, code: 'TOO_LOW', minBid: range.min,
        error: 'The minimum bid on this item is now $' + range.min + '.'
      };
    }
    if (bid.bidAmount > range.max) {
      return {
        success: false, code: 'TOO_HIGH', maxBid: range.max,
        error: 'The most you can bid right now is $' + range.max + ' ($' + CONFIG.MAX_RAISE + ' over the current bid).'
      };
    }

    getBidsSheet().appendRow([
      bid.timestamp, bid.fullName, bid.email, bid.phone,
      bid.bidAmount, bid.itemName, bid.bidId, bid.userAgent
    ]);
    SpreadsheetApp.flush();
    CacheService.getScriptCache().remove(CACHE_KEY);
  } finally {
    lock.releaseLock();
  }

  if (CONFIG.ENABLE_EMAIL) {
    try {
      sendConfirmationEmail(bid);
    } catch (emailError) {
      // The bid is saved; a failed email shouldn't fail the bid.
      logError(emailError, 'sendConfirmationEmail', { email: bid.email });
    }
  }

  logActivity('Bid Submitted', { email: bid.email, item: bid.itemName, amount: bid.bidAmount });
  return { success: true };
}

// ============================================
// VALIDATION
// ============================================

function validateBidData(data) {
  const errors = [];

  if (!data.bidId || data.bidId.length < 10) errors.push('Invalid bid identifier');

  // Letters from any alphabet, plus spaces, periods, hyphens and apostrophes.
  if (!data.fullName || data.fullName.length < 2 || data.fullName.length > 50 ||
      !/^[\p{L}\p{M}\s.'’\-]+$/u.test(data.fullName)) {
    errors.push('Please enter your name (2-50 characters)');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length > 100) {
    errors.push('Invalid email address');
  }

  const phoneDigits = String(data.phone).replace(/\D/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    errors.push('Phone number must be 10-15 digits');
  }

  if (!isFinite(data.bidAmount) || data.bidAmount <= 0 || data.bidAmount > CONFIG.MAX_BID_AMOUNT ||
      Math.floor(data.bidAmount) !== data.bidAmount) {
    errors.push('Bids must be in whole dollars');
  }

  if (!ITEMS.hasOwnProperty(data.itemName)) errors.push('Unknown item');

  return errors;
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return input === undefined || input === null ? '' : String(input);
  // Strip anything that could start a spreadsheet formula, and angle brackets.
  return input.replace(/^[=+\-@\s]+/, '').replace(/[<>]/g, '').trim().substring(0, 1000);
}

// ============================================
// HELPERS
// ============================================

function getSpreadsheet() {
  return CONFIG.SPREADSHEET_ID
    ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
}

function getBidsSheet() {
  const ss = getSpreadsheet();
  return ss.getSheetByName(BIDS_SHEET) || initializeSheets();
}

function readBids() {
  const values = getBidsSheet().getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const v = values[i];
    if (!v[5]) continue;
    rows.push({
      timestamp: new Date(v[0]).getTime(),
      fullName: String(v[1]),
      email: String(v[2]).toLowerCase(),
      phone: String(v[3]),
      amount: Number(v[4]),
      itemName: String(v[5]),
      bidId: String(v[6])
    });
  }
  return rows;
}

function phoneLast4(phone) {
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 4 ? digits.slice(-4) : '';
}

function checkRateLimit(email, rows) {
  const windowStart = Date.now() - CONFIG.RATE_LIMIT_WINDOW * 60 * 1000;
  const recent = rows.filter(function (row) { return row.email === email && row.timestamp >= windowStart; });
  return recent.length < CONFIG.RATE_LIMIT_MAX_BIDS;
}

function isAuctionOpen() {
  return new Date() < CONFIG.AUCTION_END_TIME;
}

function getAuctionStatus() {
  return { isOpen: isAuctionOpen(), endTime: CONFIG.AUCTION_END_TIME.toISOString() };
}

function formatTime(date) {
  return Utilities.formatDate(date, CONFIG.TIMEZONE, "MMM d, yyyy 'at' h:mm a");
}

function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// EMAILS
// ============================================

function emailShell(heading, subheading, bodyHtml) {
  return '' +
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2f3a3d;">' +
      '<div style="background: #6E8348; padding: 24px; text-align: center;">' +
        '<h1 style="color: white; margin: 0; font-size: 24px;">' + heading + '</h1>' +
        (subheading ? '<p style="color: #ecefd0; margin: 8px 0 0; font-size: 16px;">' + subheading + '</p>' : '') +
      '</div>' +
      '<div style="padding: 28px; background: #f7f8ef;">' + bodyHtml +
        '<hr style="margin: 28px 0; border: none; border-top: 1px solid #dfe3c8;">' +
        '<p style="font-size: 14px; color: #697D83; margin: 0;">' + escapeHtml(CONFIG.ORG_NAME) + ' Silent Auction Team</p>' +
      '</div>' +
    '</div>';
}

function sendConfirmationEmail(bid) {
  const quantity = ITEMS[bid.itemName].quantity;
  const multiNote = quantity > 1
    ? 'This item has ' + quantity + ' available — the top ' + quantity + ' bidders each win one.'
    : '';

  const htmlBody = emailShell('Bid received', null,
    '<p style="font-size: 16px;">Hi ' + escapeHtml(bid.fullName) + ',</p>' +
    '<p style="font-size: 16px;">Thanks for your bid! Here are the details:</p>' +
    '<div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">' +
      '<table style="width: 100%; font-size: 16px;">' +
        '<tr><td style="padding: 8px 0;"><strong>Item</strong></td><td>' + escapeHtml(bid.itemName) + '</td></tr>' +
        '<tr><td style="padding: 8px 0;"><strong>Your bid</strong></td><td style="color: #6E8348; font-size: 20px; font-weight: bold;">$' + bid.bidAmount + '</td></tr>' +
        '<tr><td style="padding: 8px 0;"><strong>Time</strong></td><td>' + formatTime(bid.timestamp) + '</td></tr>' +
        '<tr><td style="padding: 8px 0;"><strong>Bid ID</strong></td><td style="font-family: monospace; font-size: 12px;">' + escapeHtml(bid.bidId) + '</td></tr>' +
      '</table>' +
    '</div>' +
    (multiNote ? '<p style="font-size: 15px; background: #fdf3df; padding: 14px; border-radius: 8px; border-left: 4px solid #E59F2B;">' + multiNote + '</p>' : '') +
    '<p style="font-size: 16px;">Bidding closes ' + formatTime(CONFIG.AUCTION_END_TIME) + '. Check back before then — if someone outbids you, you can bid again. Winners will be emailed when the auction ends.</p>' +
    '<p style="font-size: 16px;">Good luck!</p>'
  );

  const textBody =
    'Hi ' + bid.fullName + ',\n\nThanks for your bid!\n\n' +
    'Item: ' + bid.itemName + '\nYour bid: $' + bid.bidAmount + '\nTime: ' + formatTime(bid.timestamp) + '\nBid ID: ' + bid.bidId + '\n\n' +
    (multiNote ? multiNote + '\n\n' : '') +
    'Bidding closes ' + formatTime(CONFIG.AUCTION_END_TIME) + '. Check back before then - if someone outbids you, you can bid again. Winners will be emailed when the auction ends.\n\n' +
    'Good luck!\n\n' + CONFIG.ORG_NAME + ' Silent Auction Team';

  MailApp.sendEmail({
    to: bid.email,
    subject: 'Bid received - ' + CONFIG.ORG_NAME + ' Silent Auction',
    body: textBody,
    htmlBody: htmlBody
  });

  if (bid.bidAmount >= CONFIG.HIGH_BID_ALERT) {
    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      subject: 'High-Value Bid Alert: $' + bid.bidAmount,
      body: 'A high-value bid has been placed:\n\nItem: ' + bid.itemName + '\nAmount: $' + bid.bidAmount + '\nBidder: ' + bid.fullName + '\nEmail: ' + bid.email
    });
  }
}

// Everyone currently winning something: email -> { name, items: [{itemName, bidAmount, position}] }
function collectWinners() {
  const rows = readBids();
  const winners = {};
  Object.keys(ITEMS).forEach(function (itemName) {
    const quantity = ITEMS[itemName].quantity;
    getWinningBids(itemName, rows).forEach(function (row, index) {
      if (!winners[row.email]) winners[row.email] = { name: row.fullName, phone: row.phone, items: [] };
      winners[row.email].items.push({
        itemName: itemName,
        bidAmount: row.amount,
        position: quantity > 1 ? (index + 1) + ' of ' + quantity : null
      });
    });
  });
  return winners;
}

function sendWinnerNotifications() {
  const winners = collectWinners();
  let emailsSent = 0;
  const errors = [];

  Object.keys(winners).forEach(function (email) {
    try {
      sendWinnerEmail(email, winners[email].name, winners[email].items);
      emailsSent++;
      logActivity('Winner Email Sent', { email: email, itemCount: winners[email].items.length });
    } catch (error) {
      errors.push({ email: email, error: error.toString() });
      logError(error, 'sendWinnerEmail', { email: email });
    }
  });

  sendAdminWinnerSummary(winners, emailsSent, errors);
  return { sent: emailsSent, errors: errors.length, totalWinners: Object.keys(winners).length };
}

function sendWinnerEmail(email, fullName, items) {
  const total = items.reduce(function (sum, item) { return sum + item.bidAmount; }, 0);
  const plural = items.length > 1;
  const nextSteps = 'Be on the lookout for an email from ' + CONFIG.CONTACT_NAME + ' (' + CONFIG.CONTACT_EMAIL + ') to coordinate payment and item pickup.';

  const itemsHtml = items.map(function (item) {
    return '<div style="background: white; padding: 18px; border-radius: 10px; margin: 12px 0; border-left: 4px solid #6E8348;">' +
      '<h3 style="margin: 0 0 6px;">' + escapeHtml(item.itemName) + '</h3>' +
      (item.position ? '<p style="margin: 0 0 6px; color: #697D83; font-size: 14px;">Winner ' + item.position + '</p>' : '') +
      '<p style="margin: 0; font-size: 18px; color: #6E8348; font-weight: bold;">Winning bid: $' + item.bidAmount + '</p>' +
    '</div>';
  }).join('');

  const htmlBody = emailShell('Congratulations!', 'You won at the silent auction',
    '<p style="font-size: 16px;">Dear ' + escapeHtml(fullName) + ',</p>' +
    '<p style="font-size: 16px;">Great news — you won ' + (plural ? items.length + ' items' : 'an item') + ' at the ' + escapeHtml(CONFIG.ORG_NAME) + ' Silent Auction!</p>' +
    itemsHtml +
    '<div style="background: #6E8348; color: white; padding: 14px 20px; border-radius: 10px; margin: 24px 0; text-align: center;">' +
      '<p style="margin: 0; font-size: 13px; letter-spacing: 1px;">TOTAL AMOUNT DUE</p>' +
      '<p style="margin: 4px 0 0; font-size: 28px; font-weight: bold;">$' + total + '</p>' +
    '</div>' +
    '<div style="background: #fdf3df; padding: 18px; border-radius: 10px; border-left: 4px solid #E59F2B; margin: 24px 0;">' +
      '<h3 style="margin: 0 0 8px;">Next steps: payment &amp; pickup</h3>' +
      '<p style="margin: 0; font-size: 16px;">' + escapeHtml(nextSteps) + '</p>' +
    '</div>' +
    '<p style="font-size: 16px;">Thank you for supporting ' + escapeHtml(CONFIG.ORG_NAME) + '. Your generosity makes a real difference.</p>'
  );

  const itemsText = items.map(function (item) {
    return item.itemName + (item.position ? ' (winner ' + item.position + ')' : '') + '\nWinning bid: $' + item.bidAmount;
  }).join('\n---\n');

  const textBody =
    'Congratulations, ' + fullName + '!\n\n' +
    'You won ' + (plural ? items.length + ' items' : 'an item') + ' at the ' + CONFIG.ORG_NAME + ' Silent Auction.\n\n' +
    itemsText + '\n\nTOTAL AMOUNT DUE: $' + total + '\n\n' + nextSteps + '\n\n' +
    'Thank you for supporting ' + CONFIG.ORG_NAME + '!\n\n' + CONFIG.ORG_NAME + ' Silent Auction Team';

  MailApp.sendEmail({
    to: email,
    subject: 'Congratulations! You won at the ' + CONFIG.ORG_NAME + ' Silent Auction',
    body: textBody,
    htmlBody: htmlBody
  });
}

function sendAdminWinnerSummary(winners, emailsSent, errors) {
  let totalRevenue = 0;
  let summary = 'WINNER NOTIFICATION SUMMARY\n===========================\n' +
    'Date: ' + formatTime(new Date()) + '\n\nEmails sent: ' + emailsSent + '\nErrors: ' + errors.length +
    '\nUnique winners: ' + Object.keys(winners).length + '\n\nWINNER DETAILS:\n';

  Object.keys(winners).forEach(function (email) {
    const data = winners[email];
    let total = 0;
    summary += '\n' + data.name + ' (' + email + ', ' + data.phone + ')\n';
    data.items.forEach(function (item) {
      summary += '  - ' + item.itemName + ': $' + item.bidAmount + '\n';
      total += item.bidAmount;
    });
    summary += '  Total: $' + total + '\n';
    totalRevenue += total;
  });

  if (errors.length > 0) {
    summary += '\nERRORS:\n';
    errors.forEach(function (err) { summary += '  - ' + err.email + ': ' + err.error + '\n'; });
  }
  summary += '\nTOTAL AUCTION REVENUE: $' + totalRevenue + '\n';

  MailApp.sendEmail({
    to: CONFIG.ADMIN_EMAIL,
    subject: 'Auction complete - winner notifications sent (' + emailsSent + ' emails)',
    body: summary
  });
}

// ============================================
// LOGGING
// ============================================

function logActivity(action, details) {
  if (!CONFIG.ENABLE_LOGGING) return;
  try {
    const ss = getSpreadsheet();
    let logSheet = ss.getSheetByName('Activity Log');
    if (!logSheet) {
      logSheet = ss.insertSheet('Activity Log');
      logSheet.appendRow(['Timestamp', 'Action', 'Details']);
    }
    logSheet.appendRow([new Date(), action, JSON.stringify(details)]);
  } catch (error) {
    console.error('Logging failed:', error);
  }
}

function logError(error, context, additionalInfo) {
  try {
    const ss = getSpreadsheet();
    let errorSheet = ss.getSheetByName('Error Log');
    if (!errorSheet) {
      errorSheet = ss.insertSheet('Error Log');
      errorSheet.appendRow(['Timestamp', 'Context', 'Error', 'Stack', 'Additional Info']);
    }
    errorSheet.appendRow([new Date(), context, error.toString(), error.stack || '', JSON.stringify(additionalInfo || {})]);
  } catch (loggingError) {
    console.error('Error logging failed:', loggingError);
  }
}

// ============================================
// ADMIN (Auction Admin menu in the spreadsheet)
// ============================================

function initializeSheets() {
  const ss = getSpreadsheet();

  let bidsSheet = ss.getSheetByName(BIDS_SHEET);
  if (!bidsSheet) {
    bidsSheet = ss.insertSheet(BIDS_SHEET, 0);
    bidsSheet.appendRow(BID_COLUMNS);
    bidsSheet.setFrozenRows(1);
    bidsSheet.getRange('D:D').setNumberFormat('@');   // keep phone numbers as text
  }

  // A read-only overview for humans; the script itself only reads the Bids tab.
  if (!ss.getSheetByName('Current Bids')) {
    const overview = ss.insertSheet('Current Bids', 1);
    overview.getRange('A1').setFormula(
      '=QUERY(' + BIDS_SHEET + '!A:H, "select F, max(E), count(E) where F is not null group by F order by F ' +
      'label F \'Item\', max(E) \'Highest Bid\', count(E) \'Bids\'", 1)');
  }

  return bidsSheet;
}

function exportWinners() {
  const ss = getSpreadsheet();
  const name = 'Winners ' + Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH.mm.ss');
  const sheet = ss.insertSheet(name);
  sheet.appendRow(['Item Name', 'Winning Bid', 'Winner Name', 'Email', 'Phone', 'Position']);

  const rows = readBids();
  Object.keys(ITEMS).forEach(function (itemName) {
    const quantity = ITEMS[itemName].quantity;
    const winners = getWinningBids(itemName, rows);
    if (winners.length === 0) {
      sheet.appendRow([itemName, '', 'NO BIDS', '', '', '']);
      return;
    }
    winners.forEach(function (row, index) {
      sheet.appendRow([itemName, row.amount, row.fullName, row.email, row.phone, (index + 1) + ' of ' + quantity]);
    });
  });
  return name;
}

function getDailyReport() {
  const rows = readBids();
  const today = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const todays = rows.filter(function (row) {
    return Utilities.formatDate(new Date(row.timestamp), CONFIG.TIMEZONE, 'yyyy-MM-dd') === today;
  });

  const bidders = {};
  const perItem = {};
  todays.forEach(function (row) {
    bidders[row.email] = true;
    perItem[row.itemName] = (perItem[row.itemName] || 0) + 1;
  });

  let projected = 0;
  let itemsWithBids = 0;
  Object.keys(ITEMS).forEach(function (itemName) {
    const winners = getWinningBids(itemName, rows);
    if (winners.length) itemsWithBids++;
    winners.forEach(function (row) { projected += row.amount; });
  });

  const topItems = Object.keys(perItem)
    .sort(function (a, b) { return perItem[b] - perItem[a]; })
    .slice(0, 5)
    .map(function (itemName) { return '- ' + itemName + ': ' + perItem[itemName] + ' bids'; })
    .join('\n');

  const report = 'Daily Auction Report - ' + today + '\n\n' +
    "Today's activity:\n- Bids: " + todays.length + '\n- Unique bidders: ' + Object.keys(bidders).length + '\n\n' +
    'Overall:\n- Projected revenue (all winning bids): $' + projected + '\n- Items with bids: ' + itemsWithBids + ' of ' + Object.keys(ITEMS).length + '\n\n' +
    'Busiest items today:\n' + (topItems || '- none yet');

  MailApp.sendEmail({ to: CONFIG.ADMIN_EMAIL, subject: 'Daily Auction Report - ' + today, body: report });
  return report;
}

function onOpen() {
  initializeSheets();
  SpreadsheetApp.getUi().createMenu('Auction Admin')
    .addItem('Export Winners', 'exportWinners')
    .addItem('Get Daily Report', 'getDailyReport')
    .addItem('Send Winner Emails', 'sendWinnerNotifications')
    .addSeparator()
    .addItem('Setup Auto-Send at Auction End', 'setupAuctionEndTrigger')
    .addItem('Remove Auto-Send Trigger', 'removeAuctionEndTrigger')
    .addSeparator()
    .addItem('Initialize Sheets', 'initializeSheets')
    .addToUi();
}

function setupAuctionEndTrigger() {
  removeAuctionEndTrigger();
  ScriptApp.newTrigger('sendWinnerNotifications').timeBased().at(CONFIG.AUCTION_END_TIME).create();
  return 'Trigger created for ' + formatTime(CONFIG.AUCTION_END_TIME);
}

function removeAuctionEndTrigger() {
  let removed = 0;
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'sendWinnerNotifications') {
      ScriptApp.deleteTrigger(trigger);
      removed++;
    }
  });
  return 'Removed ' + removed + ' trigger(s)';
}
