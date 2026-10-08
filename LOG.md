# Log

## 2026-10-08 · LSH auction 2026 schedule update
- **Done:** Bidding close moved from 12/6 to Thu 12/10, 11:59:59 PM ET in `config.js` and synced into `apps-script/Code.gs`. Full 2026 schedule added to `README.md` (donation promos through 11/22, bidding live Fri 11/27, close 12/10, winners + PayPal link 12/11, wrapped 12/18).
- **Next:** Re-paste `Code.gs` into the Apps Script editor and redeploy so the backend closes on 12/10 (it still has 12/6). On 11/27, paste the `/exec` URL into `scriptUrl` and push to go live.
- **Ideas:** Add a `startTime` so the page flips from preview to live on 11/27 by itself; put the 12/11 payment and 12/18 pickup dates in the page copy and winner email.
