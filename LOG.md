# Log

## 2026-11-26 · LSH auction 2026: Mindy's answers
- **Done:** Lasagna starting bid $60 to $20, Biltmore $240 to $75, added Oowee Leather Gift Pack ($30, photo from Drive). Winner email now has an optional PayPal button (`PAYPAL_URL` in `Code.gs`) and says Mindy follows up after payment to arrange pickup, a donor intro or an emailed certificate. The winner summary now also goes to herringparentteam@gmail.com so Mindy has every winner's contact info. Closes the Oowee, Biltmore and frisbee-photo items from the 11/24 entry. Second round: TTRPG now offers Mausritter (new description and photo); Jen Cannon's description rewritten from the sheet; Blue Ghost lists a $150 value (starting bid stays $30, Scott's call on Mindy's "cap" request); holiday cards moved to Art & Handmade; PayPal donate link set in `PAYPAL_URL`, and the winner email tells winners to enter their total on PayPal's page. Pushed (`0e47f25`). Backend redeployed as Version 4 on the same web app URL (closes 12/10 11:59:59 PM ET, no bids yet). Added `startTime` so the page flips from preview to live at 12:00 AM ET Fri 11/27 with no push needed. Share link: https://bit.ly/LSH2026 (redirects to the GitHub Pages site).
- **Waiting on:** Talberts (via Mindy, since 11/24): Mo's paintings plan and Alissa's bracelet sets. Mindy is offline until Fri 11/27.
- **Next:** Bidding opens by itself Fri 11/27 12:00 AM ET (`startTime` in `config.js`, `scriptUrl` set); check the live page that morning. Update the two Talbert listings when Mindy hears back.

## 2026-11-24 · LSH auction 2026: real items from donation form
- **Done:** Replaced the sample listings in `config.js` with 28 donations from the donation-form sheet plus the AI consultation (29 items), photos pulled from Drive into `Images/` and `img/`, `Code.gs` re-synced. Card photos now fit whole inside a fixed 4:3 frame (logos no longer cropped). Scott's item renamed "Small Business Workflow Consultation" and moved to first, with a new "Workflow Fix" listing image (`img/scott-workflow.jpg`, background removed with rembg) and a rewritten description. Drafted an update email to Mindy with the open questions below. Donor personal emails kept off the page. Pushed to `2026` (`9852753`, `22409e2`); live in preview mode at https://scottmcfalldev-bot.github.io/silent-auction/. Ultimate Frisbee camp now has the group photo Scott supplied.
- **Waiting on:** Mindy: Oowee Products item (still "pending" in the sheet); confirm Biltmore start at $240 (donor's number, likely full value); how the 5 one-of-a-kind Mo Talbert paintings get assigned to the 5 winners.
- **Next:** Scott: send Mindy the update email and page link; re-paste `Code.gs` and redeploy before bidding opens Fri 11/27, then set `scriptUrl`.

## 2026-10-08 · LSH auction 2026: pushed schedule, Asana task
- **Done:** Schedule change committed and pushed to `2026` (`73882f1`), closing time Thu 12/10 at 11:59:59 PM ET. Drafted a note for Mindy covering the plan and what we need from her. Asana task for the Apps Script redeploy created, due Fri 2026-10-09: https://app.asana.com/1/1211366034618669/project/1211500018600590/task/1219340631379903
- **Waiting on:** Mindy: item list, PayPal details, pickup plan (once Scott sends the note).
- **Next:** Scott: send the note to Mindy; redeploy `Code.gs` (Asana task).

## 2026-10-08 · LSH auction 2026 schedule update
- **Done:** Bidding close moved from 12/6 to Thu 12/10, 11:59:59 PM ET in `config.js` and synced into `apps-script/Code.gs`. Full 2026 schedule added to `README.md` (donation promos through 11/22, bidding live Fri 11/27, close 12/10, winners + PayPal link 12/11, wrapped 12/18).
- **Next:** Re-paste `Code.gs` into the Apps Script editor and redeploy so the backend closes on 12/10 (it still has 12/6). On 11/27, paste the `/exec` URL into `scriptUrl` and push to go live.
- **Ideas:** Add a `startTime` so the page flips from preview to live on 11/27 by itself; put the 12/11 payment and 12/18 pickup dates in the page copy and winner email.
