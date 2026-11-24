# Log

## 2026-11-24 · LSH auction 2026: real items from donation form
- **Done:** Replaced the sample listings in `config.js` with 28 donations from the donation-form sheet plus the AI consultation (29 items), photos pulled from Drive into `Images/` and `img/`, `Code.gs` re-synced. Card photos now fit whole inside a fixed 4:3 frame (logos no longer cropped). Scott's item renamed "Small Business Workflow Consultation" and moved to first, with a new "Workflow Fix" listing image (`img/scott-workflow.jpg`, background removed with rembg) and a rewritten description. Drafted an update email to Mindy with the open questions below. Donor personal emails kept off the page. Not committed.
- **Waiting on:** Mindy: Oowee Products item (still "pending" in the sheet); a working photo for Ultimate Frisbee camp (Drive file not found, placeholder shown); confirm Biltmore start at $240 (donor's number, likely full value); how the 5 one-of-a-kind Mo Talbert paintings get assigned to the 5 winners.
- **Next:** Scott: commit/push; re-paste `Code.gs` and redeploy before bidding opens Fri 11/27, then set `scriptUrl`.

## 2026-10-08 · LSH auction 2026: pushed schedule, Asana task
- **Done:** Schedule change committed and pushed to `2026` (`73882f1`), closing time Thu 12/10 at 11:59:59 PM ET. Drafted a note for Mindy covering the plan and what we need from her. Asana task for the Apps Script redeploy created, due Fri 2026-10-09: https://app.asana.com/1/1211366034618669/project/1211500018600590/task/1219340631379903
- **Waiting on:** Mindy: item list, PayPal details, pickup plan (once Scott sends the note).
- **Next:** Scott: send the note to Mindy; redeploy `Code.gs` (Asana task).

## 2026-10-08 · LSH auction 2026 schedule update
- **Done:** Bidding close moved from 12/6 to Thu 12/10, 11:59:59 PM ET in `config.js` and synced into `apps-script/Code.gs`. Full 2026 schedule added to `README.md` (donation promos through 11/22, bidding live Fri 11/27, close 12/10, winners + PayPal link 12/11, wrapped 12/18).
- **Next:** Re-paste `Code.gs` into the Apps Script editor and redeploy so the backend closes on 12/10 (it still has 12/6). On 11/27, paste the `/exec` URL into `scriptUrl` and push to go live.
- **Ideas:** Add a `startTime` so the page flips from preview to live on 11/27 by itself; put the 12/11 payment and 12/18 pickup dates in the page copy and winner email.
