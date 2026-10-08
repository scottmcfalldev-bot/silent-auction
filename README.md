# LSH Silent Auction

A static auction page (`index.html`) backed by a Google Sheet via Apps Script.

| File | What it is |
| --- | --- |
| `config.js` | **The file you edit each year**: year, closing time, backend URL, items |
| `index.html` | The page. No build step |
| `apps-script/Code.gs` | Backend. Paste into the Sheet's Apps Script editor — see `apps-script/SETUP.md` |
| `Images/` → `img/` | Full-size originals → phone-sized copies made by `tools/optimize-images.sh` |
| `tools/sync-script-items.js` | Copies items + end time from `config.js` into `Code.gs` |

## 2026 schedule

| Date | What happens |
| --- | --- |
| Now – Sun 11/22 | Promotions for donations |
| Fri 11/27 (Black Friday) | Bidding goes live (paste the `/exec` URL into `scriptUrl` and push) |
| Thu 12/10, 11:59:59 PM ET | Bidding closes (`endTime`) |
| Fri 12/11 | Winners notified, payment instructions (PayPal link) sent |
| Fri 12/18 | Everything wrapped: winners paid, items picked up |

## Yearly checklist

1. Put new item photos in `Images/` and run `./tools/optimize-images.sh`.
2. Update `config.js`: `year`, `endTime` (keep the timezone offset), and the `ITEMS` list.
3. Run `node tools/sync-script-items.js`.
4. Follow `apps-script/SETUP.md` to create this year's Sheet and deploy the script.
5. Paste the new `/exec` URL into `scriptUrl` in `config.js`, push, and place a test bid.

## Trying it locally

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000/?demo>. In demo mode (also used whenever `scriptUrl` is empty)
bids live only in the browser tab, so you can click through the whole flow safely.
