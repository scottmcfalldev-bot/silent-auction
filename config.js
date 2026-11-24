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
    endTime: '2026-12-10T23:59:59-05:00',

    // The /exec URL of this year's Apps Script deployment.
    // Leave empty to run the page in demo mode (bids stay in the browser).
    // 2026 deployment (paste into scriptUrl to go live):
    // https://script.google.com/macros/s/AKfycbx0lXWFH5Q7ox1j50Xh6QtczQ9dwxpgRWBdKFYX5cE-iZQjmyM7oqzt19K6pt_neG8H/exec
    scriptUrl: '',

    // Public address of this page (used for the "Bid again" link in outbid emails).
    siteUrl: 'https://scottmcfalldev-bot.github.io/silent-auction/',

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
        name: 'Small Business Workflow Consultation',
        category: 'Services',
        startingBid: 30,
        image: 'img/scott-workflow.jpg',
        description: 'Buried in busywork? In one hour we\'ll walk through how your business really runs, spot the tasks eating your week, and leave you with a clear plan to get that time back. Made for local small and mid-size businesses. Donated by Scott McFall. Email scott@scottmcfall.com to schedule.',
    },
    {
        name: 'Biltmore Daytime Admission for Two',
        category: 'Experiences',
        startingBid: 240,
        image: 'img/biltmore-2.jpg',
        description: 'Two daytime admission tickets to Biltmore, sold as a pair. Donated by Biltmore (biltmore.com).',
    },
    {
        name: 'The Orange Peel or Hellbender: 2 Show Tickets',
        category: 'Experiences',
        startingBid: 25,
        image: 'img/orange-peel-1.jpg',
        description: 'Two tickets good for any show at The Orange Peel or Hellbender. Donated by The Orange Peel (theorangepeel.net) and Hellbender (hellbenderavl.com).',
    },
    {
        name: 'Tabletop Role-Playing Game Session',
        category: 'Kids & Family',
        startingBid: 40,
        quantity: 4,
        image: 'img/ttrpg.jpg',
        description: 'An intro to tabletop role-playing games plus a one-shot adventure for 2 to 8 players, ages 10+ (plan on 3+ hours). Every player takes home the Cairn 2nd Edition Player\'s Guide and Warden\'s Guide, everything you need to run your own adventures. Donated by Ryan Nuckolls. Winners are connected with Ryan to schedule.',
    },
    {
        name: 'Free Week of Ultimate Frisbee Summer Camp',
        category: 'Kids & Family',
        startingBid: 50,
        image: 'img/ultimate-frisbee-4-mark-strazzer.jpg',
        description: 'One free week of Ultimate Frisbee Summer Camp. Donated by Mark Strazzer, Ultimate Frisbee Summer Camp. The winner is connected with Mark to register.',
    },
    {
        name: 'Asheville Kids Yoga + Art 1:1 Session',
        category: 'Kids & Family',
        startingBid: 10,
        image: 'img/kids-yoga-art.jpg',
        description: 'A one-on-one session with Asheville Kids Yoga + Art. Donated by Emma Berger-Singer. The certificate is emailed to the winner.',
    },
    {
        name: 'Two Hours of Private Tutoring',
        category: 'Kids & Family',
        startingBid: 40,
        image: 'img/tutoring.jpg',
        description: 'Two hours of private tutoring. All ages, most subjects. Donated by Blue Ridge Tutoring (blueridgetutoring.com). The winner is connected with Lea to schedule.',
    },
    {
        name: 'LSH Spirit Wear Hoodie, Youth Large (12-14)',
        category: 'Kids & Family',
        startingBid: 10,
        quantity: 4,
        image: 'img/lsh-hoodie-2.jpg',
        description: 'Lucy S. Herring youth spirit wear hoodie in charcoal, size Youth Large (12-14). Donated by Amanda Wilde.',
    },
    {
        name: 'LSH Spirit Wear Hoodie, Youth Small (6-8)',
        category: 'Kids & Family',
        startingBid: 10,
        quantity: 4,
        image: 'img/lsh-hoodie-2.jpg',
        description: 'Lucy S. Herring youth spirit wear hoodie in charcoal, size Youth Small (6-8). Donated by Amanda Wilde.',
    },
    {
        name: 'InStep Two-Seat Bike Trailer',
        category: 'Kids & Family',
        startingBid: 10,
        image: 'img/bike-trailer-1.jpg',
        description: 'Orange InStep two-seat bike trailer, used and in good condition. Donated by Leigh Horsley, who can deliver it or arrange pickup with the winner.',
    },
    {
        name: 'Asheville Racquet Club: 3-Month Silver Family Membership',
        category: 'Health & Fitness',
        startingBid: 50,
        image: 'img/racquet-club-2.jpg',
        description: 'Three consecutive months of Silver family membership (a $237 value): the fitness facility and fitness classes at the south location and the temporary location at the Four Points by Sheraton, plus ARC club events. The winner picks up the membership card at ARC. Donated by Asheville Racquet Club (ashevilleracquetclub.com).',
    },
    {
        name: 'One Month Unlimited at Blue Ghost Strength + Yoga',
        category: 'Health & Fitness',
        startingBid: 30,
        image: 'img/blue-ghost.jpg',
        description: 'One month of unlimited membership at Blue Ghost Strength + Yoga. Donated by Sara Toohey, Blue Ghost Strength + Yoga (blueghostavl.com).',
    },
    {
        name: 'Virtual Nutrition Consultation with Dr. Kate Dwyer',
        category: 'Health & Fitness',
        startingBid: 50,
        image: 'img/kate-dwyer.jpg',
        description: 'A 60-minute virtual initial consultation (a $250 value) with Dr. Kate Dwyer, Registered Dietitian and Doctor of Clinical Nutrition, who focuses on women\'s health, hormone balance, gut health and metabolic wellness. It covers your health history, habits, labs and goals, with personalized nutrition and lifestyle recommendations. Donated by Kate Dwyer Nutrition (katedwyernutrition.com).',
    },
    {
        name: '1-Hour Registered Dietitian Consult',
        category: 'Health & Fitness',
        startingBid: 50,
        image: 'img/dietitian-consult.jpg',
        description: 'A one-hour consultation with a registered dietitian. Donated by Jen Cannon. The winner gets Jen\'s contact info to schedule.',
    },
    {
        name: 'Small Engine Service Call',
        category: 'Services',
        startingBid: 100,
        quantity: 2,
        image: 'img/small-engine.jpg',
        description: 'A one-time service call on your small engine appliance (generator, lawn mower, power washer and the like): oil change, fuel flush, carburetor cleaning and a test run. Donated by Ben Gerhardt.',
    },
    {
        name: 'Hand Screen Printing: Up to 20 Pieces',
        category: 'Services',
        startingBid: 50,
        image: 'img/screen-printing.jpg',
        description: 'One-color hand screen printing on up to 20 garments or posters. Donated by Marcos Harkness, Harkness Design. The winner arranges the job with Marcos.',
    },
    {
        name: 'Lasagna Dinner for Six',
        category: 'Food & Drink',
        startingBid: 60,
        image: 'img/lasagna.jpg',
        description: 'A homemade lasagna dinner for six, meat or vegetarian, your pick. Delivered to your home by the donor, Cassie Howe.',
    },
    {
        name: 'NC Cookbook with Homemade Blueberry Jam',
        category: 'Food & Drink',
        startingBid: 20,
        image: 'img/cookbook-jam.jpg',
        description: 'A North Carolina cookbook with three small jars of homemade blueberry jam. Donated by Ellie Weyer.',
    },
    {
        name: 'Four California Wines',
        category: 'Food & Drink',
        startingBid: 60,
        image: 'img/california-wines.jpg',
        description: 'Four California wines: two whites and two reds. Donated by Cara Fuseler. Winner must be 21+.',
    },
    {
        name: 'Six Wines: Three Red, Three White',
        category: 'Food & Drink',
        startingBid: 60,
        image: 'img/red-white-wines.jpg',
        description: 'Six bottles of wine: three reds and three whites. Donated by Cara Fuseler. Winner must be 21+.',
    },
    {
        name: 'Two Bottles of Sparkling Wine',
        category: 'Food & Drink',
        startingBid: 40,
        image: 'img/sparkling-wine.jpg',
        description: 'Two bottles of sparkling wine, ready for the holidays. Donated by Cara Fuseler. Winner must be 21+.',
    },
    {
        name: 'Goat Milk Soap from Woodland Hills Farm',
        category: 'Gifts & Gear',
        startingBid: 10,
        image: 'img/goat-milk-soap-1.jpg',
        description: 'Two bars of hand-crafted goat milk soap from our neighborhood Woodland Hills Farm, made with all-natural ingredients: infused oils, goat milk and botanicals. Donated by Jaya Gamble (Instagram @woodlandhillsfarm).',
    },
    {
        name: 'Handmade Pinecone Wreath',
        category: 'Holiday',
        startingBid: 30,
        image: 'img/pinecone-wreath.jpg',
        description: 'A homemade 20" pinecone wreath, left free of extra decor so it works as a base for your own touches or across several seasons. The pinecones are wired in sturdily and hold up indoors or out for decades. Donated by Amy Murray, who will drop it at the winner\'s home.',
    },
    {
        name: 'Holiday Cards, Set 1',
        category: 'Holiday',
        startingBid: 10,
        image: 'img/holiday-cards-a.jpg',
        description: 'Five folded holiday cards (6 x 4.5 in, blank inside, with envelopes): digital design, inkjet print, watercolor and paint pen on heavy watercolor paper. Donated by Paige Taylor, Rhododendron Press (Instagram @rhododendron.press).',
    },
    {
        name: 'Holiday Cards, Set 2',
        category: 'Holiday',
        startingBid: 10,
        image: 'img/holiday-cards-b.jpg',
        description: 'Five folded holiday cards (6 x 4.5 in, blank inside, with envelopes): digital design, inkjet print, watercolor and paint pen on heavy watercolor paper. Donated by Paige Taylor, Rhododendron Press (Instagram @rhododendron.press).',
    },
    {
        name: 'Desert Lounge Lizard: Original Watercolor & Ink',
        category: 'Art & Handmade',
        startingBid: 20,
        image: 'img/lounge-lizard-1.jpg',
        description: 'Original watercolor and ink artwork by Josh Finley and Tery Maxwell. Donated by Amanda Wilde.',
    },
    {
        name: 'Stained Glass Mosaic Snake Plant',
        category: 'Art & Handmade',
        startingBid: 10,
        image: 'img/stained-glass-plant.jpg',
        description: 'A stained glass mosaic snake plant: the houseplant that lives forever! Donated by Britney Shackelton, Resin8Light.',
    },
    {
        name: 'Handmade Bracelet Set by Mo Talbert',
        category: 'Art & Handmade',
        startingBid: 10,
        quantity: 4,
        image: 'img/fiddle-thread.jpg',
        description: 'A handmade bracelet set by teen artist Mo Talbert. Donated by Fiddle and Thread.',
    },
    {
        name: 'Original Painting on Canvas by Mo Talbert',
        category: 'Art & Handmade',
        startingBid: 12,
        quantity: 5,
        image: 'img/fiddle-thread.jpg',
        description: 'A one-of-a-kind painting on canvas by teen artist Mo Talbert. Donated by Fiddle and Thread.',
    },
];

if (typeof module !== "undefined") module.exports = { AUCTION, ITEMS };
