# Backend setup (about 10 minutes, once per year)

The auction page talks to a Google Sheet through the Apps Script in `Code.gs`.
Use a **new Sheet each year** so last year's bids stay archived and can't leak
into this year's auction.

## 1. Get Code.gs ready

In this repo, edit `config.js` (items, `endTime`), then run:

```bash
node tools/sync-script-items.js
```

That copies the item list, end time and max raise into `apps-script/Code.gs`.
Check the other values at the top of `Code.gs` by hand: `SPREADSHEET_ID`
(the long ID in this year's Sheet URL), `ADMIN_EMAIL`, `CONTACT_NAME`, `CONTACT_EMAIL`.

To copy the file to the clipboard without mangling the — and ’ characters:

```bash
LANG=en_US.UTF-8 pbcopy < apps-script/Code.gs
```

## 2. Create the Sheet and script

1. Go to [sheets.new](https://sheets.new) and name it e.g. "LSH Silent Auction 2026".
2. **Extensions → Apps Script**.
3. Delete whatever is in the editor, paste in all of `apps-script/Code.gs`, and save.
4. In the function dropdown pick **initializeSheets** (check the toolbar really shows
   it, not `doGet`) and press **Run**. Approve the
   permissions prompt (it needs the Sheet, and to send email as you). This creates the
   `Bids` and `Current Bids` tabs.

## 3. Deploy

1. **Deploy → New deployment → Web app**.
2. Execute as: **Me**. Who has access: **Anyone**.
3. Deploy, and copy the **Web app URL** (it ends in `/exec`).
4. Paste it into `scriptUrl` in `config.js`, commit, and push.

## 4. Test before announcing

Set `ENABLE_EMAIL: true` and place a real bid from your phone, then check:

- [ ] the bid appears in the `Bids` tab
- [ ] the page shows "You're the high bidder" and your last 4 digits
- [ ] the confirmation email arrives
- [ ] bidding the same amount from a second browser is refused with "minimum is now $…"
- [ ] a bid below an item's starting bid is refused

Then delete the test rows from the `Bids` tab (keep the header row).

## Changing things after launch

Any edit to `Code.gs` (new item, new end time) only goes live after
**Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**.
Editing the existing deployment keeps the same URL. Don't rename an item once it has bids.

## When the auction ends

Use the **Auction Admin** menu in the Sheet (reload the Sheet if you don't see it).
The menu only appears when the script was created from the Sheet's Extensions menu.
The 2026 script is a standalone project ("LSH Auction 2026" at script.google.com) that
finds the Sheet by `SPREADSHEET_ID`, so instead open the script editor, pick the
function by name in the dropdown and press Run:

- **Setup Auto-Send at Auction End** (`setupAuctionEndTrigger`) — run this any time before closing to have winner
  emails go out automatically at the end time.
- **Send Winner Emails** (`sendWinnerNotifications`) — or send them by hand once bidding has closed.
- **Export Winners** (`exportWinners`) — writes a Winners tab with names, emails, phones and amounts.

## Emails and Gmail's daily limit

Gmail accounts can send roughly 100 emails a day from Apps Script. Every bid sends a
confirmation, and a bidder who loses their winning spot gets a "You've been outbid" email
with a link straight back to the item. To keep room for confirmations and the winner
emails, outbid emails pause for the day once fewer than `OUTBID_EMAIL_RESERVE` (40) sends
remain — the `Activity Log` tab shows "Outbid Email Skipped" when that happens. Set
`SEND_OUTBID_EMAILS: false` to turn them off. Bids are always recorded even when an
email can't be sent (see the `Error Log` tab).
