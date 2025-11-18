# Phone Identifier Troubleshooting Guide

## ✅ What I Fixed

1. **Moved phone identifier placement** - Now appears ABOVE the bid buttons (between "Next minimum bid" and the buttons)
2. **Added console logging** - To help debug what data is being received
3. **Fixed getBidAmount** - Now properly converts bidAmount to Number

## 🔍 How to Test

### Option 1: Test with Mock Data (Offline)
Open `test-live.html` in your browser to see how phone identifiers should look with simulated data.

- **Expected**: 3 items (Soccer Ball, Basketball, Artwork) should show phone identifiers like "***-4567"
- **Expected**: 3 items (Wine, Golf, Concert) should NOT show any identifier (no bids yet)

### Option 2: Test with Real Data (Your Live Site)
1. Open `index.html` in your browser
2. Open browser console (Press F12)
3. Look for these debug messages:
   ```
   📊 Bid data received: {object}
   📊 Number of items with bids: X
   ```

## 🐛 Debugging Steps

### Step 1: Check if server is returning phone data
In the browser console, you should see:
```javascript
📊 Bid data received: {
  "Soccer Ball": {
    "bidAmount": 75,
    "phone": "555-123-4567",  // <-- THIS IS KEY!
    "fullName": "John Doe"
  }
}
```

**If you DON'T see the `phone` field**, then your Apps Script `getBids()` function needs to be updated.

### Step 2: Check if phone extraction is working
Look for these console messages:
```
getPhoneIdentifier called with: {bidAmount: 75, phone: "555-123-4567", ...}
Phone number: 555-123-4567
Returning phone identifier: {text: "***-4567"}
```

### Step 3: Check if UI is rendering
You should see on each item card (for items WITH bids):
- A small gray rectangle with "***-XXXX"
- Located above the "Details" and "Bid Now" buttons

## 📋 What Your Apps Script MUST Return

Your `getBids()` function in Google Apps Script should return this format:

```javascript
{
  "Item Name Here": {
    "bidAmount": 123,
    "phone": "555-123-4567",      // Required for phone identifier
    "fullName": "Bidder Name",    // Optional
    "timestamp": "2025-10-19..."  // Optional
  },
  "Another Item": {
    "bidAmount": 456,
    "phone": "(555) 987-6543"     // Can be any format - will extract digits
  }
}
```

## ✨ Expected Appearance

```
┌─────────────────────────────┐
│     Soccer Ball Image       │
├─────────────────────────────┤
│ Soccer Ball                 │
│ Current Bid: $75            │
│ Next minimum bid: $80       │
│ ┌─────────────┐            │  <-- PHONE IDENTIFIER HERE
│ │  ***-4567   │            │
│ └─────────────┘            │
│ [Details]  [Bid Now]       │
└─────────────────────────────┘
```

## 🔧 Common Issues

### Issue 1: "No phone field in bidData"
**Cause**: Apps Script is not returning phone numbers
**Fix**: Update your `getBids()` function in Google Apps Script (see the code I provided earlier)

### Issue 2: Phone identifier appears but is empty
**Cause**: Phone number has less than 4 digits
**Fix**: Ensure phone numbers in your Sheet1 have at least 4 digits

### Issue 3: Phone identifier doesn't show at all
**Cause**: Either no bids exist for that item, OR the item name doesn't match
**Fix**: 
- Check that item names in HTML match EXACTLY with names in your Google Sheet
- "Soccer Ball" ≠ "soccer ball" ≠ "Soccer ball" (case sensitive!)

## 📞 Testing Checklist

- [ ] Open test-live.html - Do you see phone identifiers on first 3 items?
- [ ] Open browser console on index.html - What does "📊 Bid data received" show?
- [ ] Do you see `phone` field in the data?
- [ ] Submit a test bid with phone number 555-123-4567
- [ ] Refresh page - Do you see "***-4567" on that item?
- [ ] Check if item names in HTML match Sheet exactly

## 🎯 Next Steps

1. **First**: Open `test-live.html` to verify the feature works with mock data
2. **Second**: Check your live site's console logs
3. **Third**: If no phone data, re-deploy your updated Apps Script
4. **Fourth**: Submit a test bid and verify it appears

---

Need help? Check the console messages - they'll tell you exactly what's happening!
