// ============================================================
// LSH Silent Auction — everything you change year to year lives
// in this file. After editing it, run:
//     node tools/sync-script-items.js
// which copies the items + end time into apps-script/Code.gs. Then paste
// Code.gs into the Apps Script editor and redeploy (see apps-script/SETUP.md).
// ============================================================

const AUCTION = {
    year: 2026,
    title: 'LSH Silent Auction',
    tagline: 'Bid on something great and support Lucy S. Herring Elementary.',

    // Closing time WITH a timezone offset (-05:00 = Eastern Standard Time,
    // -04:00 = Eastern Daylight Time). Must match AUCTION_END_TIME in Code.gs.
    endTime: '2026-12-06T21:00:00-05:00',

    // The /exec URL of this year's Apps Script deployment.
    // Leave empty to run the page in demo mode (bids stay in the browser).
    // 2026 deployment (paste into scriptUrl to go live):
    // https://script.google.com/macros/s/AKfycbx0lXWFH5Q7ox1j50Xh6QtczQ9dwxpgRWBdKFYX5cE-iZQjmyM7oqzt19K6pt_neG8H/exec
    scriptUrl: '',

    orgName: 'Lucy S. Herring Parent Team',
    contactName: 'Mindy Smith',
    contactEmail: 'herringparentteam@gmail.com',

    // Nobody can bid more than this much above the current bid at once.
    maxRaise: 100,
};

// Items. `name` is what bids are stored under, so don't rename an item once
// bidding has started. `quantity` (optional) = how many winners the item has.
// `image` comes from tools/optimize-images.sh.
const ITEMS = [
    {
        name: 'AI Consultation',
        category: 'Experiences',
        startingBid: 30,
        image: 'img/scott1.jpg',
        description: '1 hour consultation to see how AI can help you and your business GROW! Email scott@scottmcfall.com to schedule.',
    },
    {
        name: 'Sample Experience',
        category: 'Experiences',
        startingBid: 50,
        image: 'img/placeholder.svg',
        description: 'Placeholder listing — the 2026 items are being gathered now and will appear here before bidding opens.',
    },
    {
        name: 'Sample Food & Drink Basket',
        category: 'Food & Drink',
        startingBid: 25,
        image: 'img/placeholder.svg',
        description: 'Placeholder listing — the 2026 items are being gathered now and will appear here before bidding opens.',
    },
    {
        name: 'Sample Handmade Item',
        category: 'Art & Handmade',
        startingBid: 20,
        image: 'img/placeholder.svg',
        description: 'Placeholder listing — the 2026 items are being gathered now and will appear here before bidding opens.',
    },
    {
        name: 'Sample Jewelry Piece',
        category: 'Jewelry',
        startingBid: 15,
        image: 'img/placeholder.svg',
        description: 'Placeholder listing — the 2026 items are being gathered now and will appear here before bidding opens.',
    },
    {
        name: 'Sample Holiday Item',
        category: 'Holiday',
        startingBid: 10,
        image: 'img/placeholder.svg',
        description: 'Placeholder listing — the 2026 items are being gathered now and will appear here before bidding opens.',
    },
    {
        name: 'Sample Multi-Winner Item',
        category: 'Gifts & Gear',
        startingBid: 10,
        quantity: 4,
        image: 'img/placeholder.svg',
        description: 'Placeholder listing — shows how an item with several available works: the top 4 bidders each win one.',
    },
];

if (typeof module !== "undefined") module.exports = { AUCTION, ITEMS };
