/* ==========================================================================
   Steadfast Research Group — static ad pack 01.

   THE source of truth for this pack. index.html renders scaled previews from
   it; export.html renders one creative at true 1080 for PNG export. Copy and
   creative live in the same record, so a caption can never drift away from
   the artwork it was written for.

   Every figure quoted below traces to a published lot report. The table in
   index.html section 02 is the allow-list: if a number is not there, it does
   not belong in an ad.
   ========================================================================== */
(function (root) {

var M = 'assets/mockups/', C = 'assets/coa/';

/* Canvas sizes, in one place. The preview page, the export surface and the PNG
   and PDF writers all read these, so a format change can't half-apply. */
var SIZE = { feed: [1080, 1440], story: [1080, 1920] };

/* The compliance strip. Burned into the artwork, not left to the caption,
   because Meta truncates captions and never crops pixels. The on-canvas line is
   the SHORT form — the exact wording printed on every vial label — so it fits
   one line at 17px like the reference ads. The full long-form disclaimer
   ("not a drug… diagnose, treat, cure, or prevent") stays in every caption. */
var STRIP = 'For laboratory and research use only. Not for human consumption.';

/* Brand mark, top centre — where every reference ad carries it. */
function topmark() {
  return '<div class="topmark"><img src="assets/flag-white.png" alt=""/>'
       + '<span><b>STEADFAST</b><small>RESEARCH GROUP</small></span></div>';
}
/* Foot: URL + one tiny legal line, centred, nothing else. */
function strip(url) {
  return '<div class="strip">'
       + (url ? '<div class="url">' + url + '</div>' : '')
       + '<div class="dl">' + STRIP + '</div>'
       + '</div>';
}

/* -------------------------------------------------------------------------
   Templates. Each takes the ad's `art` record and returns creative markup.
   ------------------------------------------------------------------------- */
var T = {

  /* A real lot report, held as a legible band across the top of the frame.
     The one layout that keeps the document as its design — that IS the cow. */
  doc: function (a) {
    return '<div class="docband"' + (a.docH ? ' style="height:' + a.docH + 'px"' : '') + '>'
      +   '<img src="' + C + a.doc + '" alt=""'
      +   (a.docTop ? ' style="top:' + a.docTop + 'px"' : '') + '/></div>'
      + '<div class="pad">'
      +   (a.kick ? '<div class="kick" style="margin-top:0">' + a.kick + '</div>' : '')
      +   '<div class="cvbody">'
      +     '<h4 class="hl ' + (a.hlSize || 'sm') + '">' + a.hl + '</h4>'
      +     (a.dek ? '<div class="dek">' + a.dek + '</div>' : '')
      +     (a.callout ? '<div class="callout"><span class="cl-k">' + a.callout[0] + '</span>'
      +       '<span class="cl-v ac">' + a.callout[1] + '</span></div>' : '')
      +   '</div>'
      + '</div>' + strip(a.url);
  },

  /* One audited number at poster scale, the product overlapping it from below. */
  metric: function (a) {
    return '<div class="pad">'
      + topmark()
      + (a.kick ? '<div class="kick">' + a.kick + '</div>' : '')
      + '<div class="cvbody">'
      +   (a.pre ? '<div class="bigsub" style="margin:0 0 8px">' + a.pre + '</div>' : '')
      +   '<div class="big ' + (a.bigSize || '') + ' ac">' + a.big + '</div>'
      +   '<div class="bigsub">' + a.bigsub + '</div>'
      +   (a.vial ? '<div class="art lap"><img src="' + M + a.vial + '" alt=""/></div>' : '')
      +   (a.dek ? '<div class="dek" style="margin-top:14px">' + a.dek + '</div>' : '')
      + '</div></div>' + strip(a.url);
  },

  /* Poster hero: headline, then the product crossing its baseline — the
     Enhanced / Brello move, with the dark cap doing the overlapping. */
  hero: function (a) {
    return '<div class="pad">'
      + topmark()
      + (a.kick ? '<div class="kick">' + a.kick + '</div>' : '')
      + '<div class="cvbody">'
      +   '<h4 class="hl ' + (a.hlSize || 'sm') + '">' + a.hl + '</h4>'
      +   (a.vial ? '<div class="art lap"><img src="' + M + a.vial + '" alt=""/></div>' : '')
      +   (a.dek ? '<div class="dek" style="margin-top:12px">' + a.dek + '</div>' : '')
      +   (a.callout ? '<div class="callout"><span class="cl-k">' + a.callout[0] + '</span>'
      +     '<span class="cl-v ac">' + a.callout[1] + '</span></div>' : '')
      + '</div></div>' + strip(a.url);
  },

  /* What actually got tested. A leading * marks the emphasised line. */
  list: function (a) {
    var li = a.items.map(function (t) {
      var hi = t.charAt(0) === '*';
      return '<li' + (hi ? ' class="hi ac"' : '') + '>' + (hi ? t.slice(1) : t) + '</li>';
    }).join('');
    return '<div class="pad">'
      + (a.kick ? '<div class="kick" style="margin-top:0">' + a.kick + '</div>' : '')
      + '<div class="cvbody">'
      +   '<h4 class="hl ' + (a.hlSize || 'sm') + '">' + a.hl + '</h4>'
      +   '<ul class="checks">' + li + '</ul>'
      +   (a.dek ? '<div class="dek">' + a.dek + '</div>' : '')
      + '</div></div>' + strip(a.url);
  },

  /* Type only, poster scale. */
  text: function (a) {
    return '<div class="pad">'
      + topmark()
      + (a.kick ? '<div class="kick">' + a.kick + '</div>' : '')
      + '<div class="cvbody">'
      +   '<h4 class="hl ' + (a.hlSize || 'lg') + '">' + a.hl + '</h4>'
      +   (a.dek ? '<div class="dek">' + a.dek + '</div>' : '')
      +   (a.code ? '<div class="code ac">' + a.code + '</div>' : '')
      + '</div></div>' + strip(a.url);
  },

  /* Canva-sourced art: the export PNG IS the creative. Gabi's template, from
     the parallel session — used when a design was reworked directly in Canva
     and the HTML recreation is retired. This is also how her "Premium
     reagents" reference ad (ref #6) slots into this page once she exports it:
     tpl:'img', art:{ img:'exports/<file>.png' }. */
  img: function (a) {
    return '<img src="' + a.img + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block">';
  },

  /* Two products side by side, Sunday-style, crossing the headline baseline. */
  duo: function (a) {
    var d = a.cells.map(function (c) {
      return '<div class="d"><img src="' + M + c[0] + '" alt=""/>'
           + '<em>' + c[1] + '</em><span>' + c[2] + '</span></div>';
    }).join('');
    return '<div class="pad">'
      + topmark()
      + '<div class="cvbody">'
      +   '<h4 class="hl sm">' + a.hl + '</h4>'
      +   '<div class="duo lap">' + d + '</div>'
      +   (a.code ? '<div class="code ac">' + a.code + '</div>' : '')
      + '</div></div>' + strip(a.url);
  }
};

/* -------------------------------------------------------------------------
   FEED — one post per reference ad Blake approved (Slack, 2026-08-04).
   These mirror ads that are RUNNING and COMPLIANT on Meta, so the verbiage
   stays as close to the source as our RUO framing allows — that is the brief,
   per Blake: "make the verbiage as close as possible to them. So the ads
   dont get shut down."  Ref #6 (Ageless Vitality "Premium reagents") is
   Gabi's, built directly in Canva, and is not generated here.
   ------------------------------------------------------------------------- */
var FEED = [
{
  id:'R01', slug:'real-peptides', name:'Real peptides', palette:'field', tpl:'img', safe:'paid',
  basedOn:'Enhanced — “REAL PEPTIDES / No gray market. No compromise.”',
  art:{ img:'exports/srg-ad01-r01-real-peptides-1080x1440.png', hl:'Real<br>peptides.',
        dek:'No gray market. No compromise.',
        vial:'srg-prod-bb10.jpg', url:'steadfastresearchgroup.com' },
  score:['Stops the scroll','Says it out loud'],
  cow:'Runs on the verbiage of a live, compliant Enhanced ad, restated for a research supplier.',
  pain:'The gray market is the category&rsquo;s reputation problem.',
  process:'Every lot independently tested before it ships.',
  proof:'Batch-specific COA with every order.',
  cta:'steadfastresearchgroup.com',
  caption:"Real peptides. No gray market. No compromise.\n\nEvery Steadfast lot is independently tested and ships with its own certificate of analysis.\n\nsteadfastresearchgroup.com\n\nFor laboratory and research use only. Not for human consumption. Not a drug and not intended to diagnose, treat, cure, or prevent any disease.",
  fields:{ headline:'Real peptides.', desc:'No gray market. No compromise.', cta:'Shop now' },
  spec:'Modeled on the Enhanced ad: cream ground, giant headline, vial crossing the type. BPC blend vial per Blake&rsquo;s note to lead with the BPC label.'
},
{
  id:'R02', slug:'uncompromising-purity', name:'Uncompromising purity', palette:'field', tpl:'img', safe:'paid',
  basedOn:'Sunday — “Uncompromising Purity” two-vial hero',
  art:{ img:'exports/srg-ad01-r02-uncompromising-purity-1080x1440.png', hl:'Uncompromising<br>purity.',
        cells:[['srg-prod-bb10.jpg','BPC-157 / TB-500',''],['srg-prod-cu50.jpg','GHK-CU','']],
        url:'steadfastresearchgroup.com' },
  score:['Stops the scroll','Screenshot-worthy'],
  cow:'Runs on the verbiage of the live Sunday ad — two products, two words.',
  pain:'Purity claims without documentation.',
  process:'Independent lab verification per lot.',
  proof:'COA published for every batch.',
  cta:'steadfastresearchgroup.com',
  caption:"Uncompromising purity.\n\nEvery Steadfast lot is verified by an independent laboratory, and the certificate of analysis ships with it.\n\nsteadfastresearchgroup.com\n\nFor laboratory and research use only. Not for human consumption. Not a drug and not intended to diagnose, treat, cure, or prevent any disease.",
  fields:{ headline:'Uncompromising purity.', desc:'Independently verified, every lot.', cta:'Learn more' },
  spec:'Modeled on the Sunday ad: two vials leaning together under a two-word headline. Names only under the glass, no prices — Sunday keeps it quiet.'
},
{
  id:'R03', slug:'ten-off-sitewide', name:'10% off sitewide', palette:'carbon', tpl:'img', safe:'paid',
  basedOn:'Onyx Research — “20% OFF SITEWIDE / USE ONYX20”',
  art:{ img:'exports/srg-ad01-r03-ten-off-sitewide-1080x1440.png', hl:'10% off<br>sitewide.',
        dek:'High-quality research compounds. Fast, secure shipping across the U.S.',
        code:'USE STEADFAST10', url:'steadfastresearchgroup.com/products' },
  score:['Says it out loud'],
  cow:'Runs on the verbiage of the live Onyx ad, at our discount.',
  pain:'&mdash;',
  process:'&mdash;',
  proof:'Code STEADFAST10, 10% off.',
  cta:'steadfastresearchgroup.com/products',
  caption:"Research, sourced right. Steadfast delivers high-quality research compounds with fast, secure shipping across the U.S. and a certificate of analysis on every lot.\n\n10% off sitewide — use code STEADFAST10.\n\nsteadfastresearchgroup.com/products\n\nFor laboratory and research use only. Not for human consumption. Not a drug and not intended to diagnose, treat, cure, or prevent any disease.",
  fields:{ headline:'10% off sitewide', desc:'Use code STEADFAST10 at checkout.', cta:'Shop now' },
  spec:'Modeled on the Onyx ad: dark ground, offer as the headline, code in a chip. Caption opens on Onyx&rsquo;s own &ldquo;Research, sourced right&rdquo; cadence.'
},
{
  id:'R04', slug:'tirzepatide-price', name:'Tirzepatide, priced', palette:'field', tpl:'img', safe:'paid',
  basedOn:'Brello — compound name huge + “plan starting at $166/month”',
  art:{ img:'exports/srg-ad01-r04-tirzepatide-price-1080x1440.png', hl:'Tirzepatide',
        dek:'Starting at $69.99. Lyophilized, COA included.',
        vial:'srg-prod-tr10.jpg', url:'steadfastresearchgroup.com/products/tirzepatide' },
  score:['Stops the scroll'],
  cow:'Runs on the structure of the live Brello ad: the compound is the headline, the price is the hook.',
  pain:'&mdash;',
  process:'&mdash;',
  proof:'Tirzepatide 10 mg, $69.99. COA per lot.',
  cta:'steadfastresearchgroup.com/products/tirzepatide',
  caption:"Tirzepatide, starting at $69.99.\n\nLyophilized research material with the lot&rsquo;s certificate of analysis included. 10 mg, 20 mg and 30 mg vials.\n\nsteadfastresearchgroup.com/products/tirzepatide\n\nFor laboratory and research use only. Not for human consumption. Not a drug and not intended to diagnose, treat, cure, or prevent any disease.",
  fields:{ headline:'Tirzepatide — from $69.99', desc:'Research use only. COA included.', cta:'Shop now' },
  spec:'Modeled on the Brello ad: compound name as the headline with the vial crossing it, price as the supporting line. RUO framing replaces Brello&rsquo;s telehealth plan language.'
},
{
  id:'R05', slug:'quality-consistency', name:'Quality meets consistency', palette:'field', tpl:'img', safe:'paid',
  basedOn:'Alpha Omega Peptide — “Where Quality Meets Consistency”',
  art:{ img:'exports/srg-ad01-r05-quality-consistency-1080x1440.png', hl:'Where quality<br>meets consistency.', hlSize:'sm',
        dek:'Research peptides with a certificate of analysis on every lot.',
        vial:'srg-prod-hgh10.jpg', url:'steadfastresearchgroup.com' },
  score:['Says it out loud'],
  cow:'Runs on the verbiage of the live Alpha Omega carousel.',
  pain:'&mdash;',
  process:'&mdash;',
  proof:'COA on every lot.',
  cta:'steadfastresearchgroup.com',
  caption:"Where quality meets consistency.\n\nSteadfast delivers research peptides with batch documentation on every order — tested independently, shipped fast.\n\nsteadfastresearchgroup.com\n\nFor laboratory and research use only. Not for human consumption. Not a drug and not intended to diagnose, treat, cure, or prevent any disease.",
  fields:{ headline:'Where quality meets consistency', desc:'COA on every lot.', cta:'Shop now' },
  spec:'Modeled on the Alpha Omega carousel card: clean light ground, one calm claim, vial centred. Slots into a carousel the same way theirs does.'
},
{
  /* Gabi's, built directly in Canva on the photo style of the Ageless
     reference — kept LAST in the feed so it is always easy to find. The
     exported PNG is the creative (tpl:'img'); the Canva design is the source
     of truth and this page never regenerates it. */
  id:'R06', slug:'labs-we-dont-own', name:'Premium reagents — photo build', palette:'field', tpl:'img', safe:'paid',
  basedOn:'Ageless Vitality &mdash; &ldquo;Premium reagents. Compromise-free.&rdquo; &middot; built by Gabi in Canva',
  art:{ img:'exports/srg-ad01-f03-labs-we-dont-own-1080x1440.png' },
  score:['Stops the scroll','Screenshot-worthy'],
  cow:'Canva-authored photo build &mdash; the one card on this page whose source of truth is Canva, not pack.js.',
  pain:'&mdash;',
  process:'&mdash;',
  proof:'Code STEADFAST10, 10% off.',
  cta:'steadfastresearchgroup.com',
  caption:"Premium reagents. Compromise-free.\n\nGet professional-grade research materials shipped directly to your lab. Securely packaged in cold-chain ready vials.\n\n10% off sitewide — use code STEADFAST10.\n\nsteadfastresearchgroup.com\n\nFor laboratory and research use only. Not for human consumption. Not a drug and not intended to diagnose, treat, cure, or prevent any disease.",
  fields:{ headline:'Premium reagents. Compromise-free.', desc:'10% off sitewide — code STEADFAST10.', cta:'Shop now' },
  spec:'EDIT IN CANVA ONLY — changes to pack.js do not touch this one. After editing, ask the desktop session to pull the PNG from Canva (or export it over exports/srg-ad01-f03-labs-we-dont-own-1080x1440.png and commit). Blake&rsquo;s note still open: the vial shows the generic PEPTIDE 5 MG label where he asked for the BPC label — swap srg-label-bb10.png onto the render in Canva.'
}
];

/* -------------------------------------------------------------------------
   STORIES — 1080x1920, 250px clear top and bottom.
   ------------------------------------------------------------------------- */
var STORIES = [
{
  id:'S01', slug:'fill-accuracy-story', name:'Fill accuracy, vertical', palette:'field', tpl:'img', safe:'paid',
  art:{ img:'exports/srg-ad01-s01-fill-accuracy-story-1080x1920.png', kick:'BPC-157 &middot; #151664', pre:'Label says <span class="strike">10 MG</span>', big:'10.23',
        bigsub:'Milligrams measured', dek:'We publish both. Even when the second number is lower.',
        vial:'srg-prod-bb10.jpg', url:'Swipe up &middot; /coa' },
  score:['Stops the scroll','Screenshot-worthy','New in the brain'],
  cow:'The measured milligrams at full height, with the label figure struck through above it.',
  pain:'A label is a claim. Fill weight is a measurement.',
  process:'Independent labs weigh net content per lot; we publish it against the label.',
  proof:'10.23 mg measured on a 10 mg label, 98.767% purity, Janoshik #151664.',
  cta:'Tap for the lot reports.',
  caption:"Label says 10 mg. Lab measured 10.23 mg. We publish both — even when the second number is lower.\n\nAll lot reports → steadfastresearchgroup.com/coa\n\nFor laboratory and research use only. Not for human consumption.",
  fields:{ headline:'—', desc:'Story asset. Sticker link to /coa.', cta:'Swipe up' },
  spec:'Same file as F02, recut vertical. Keep the 250px clear zones; the sticker link sits over the lower one, never over the footer strip.'
},
{
  id:'S02', slug:'calculator-story', name:'Calculator, vertical', palette:'carbon', tpl:'img', safe:'paid',
  art:{ img:'exports/srg-ad01-s02-calculator-story-1080x1920.png', hl:'mg/mL,<br>solved.',
        dek:'Enter the vial’s mg and your solvent volume. Get the concentration for that vial. No signup, no gate.',
        code:'/tools', url:'Tap for the tool' },
  score:['Would share'],
  cow:'A free tool, given away with nothing asked for in return.',
  pain:'Concentration math done in your head, late, is how a good lot gets wasted.',
  process:'Labeled mg plus solvent volume returns mg/mL for the vial.',
  proof:'Live: steadfastresearchgroup.com/tools/peptide-reconstitution-calculator',
  cta:'Tap through and bookmark it.',
  caption:"Free reconstitution calculator. Vial mg + solvent volume → mg/mL for that vial. No email, no account.\n\nsteadfastresearchgroup.com/tools/peptide-reconstitution-calculator\n\nFor laboratory and research use only. Not for human consumption.",
  fields:{ headline:'—', desc:'Story asset. Sticker link to /tools.', cta:'Swipe up' },
  spec:'Carbon, type only, headline centred in the middle third so the sticker clears it.'
},
{
  id:'S03', slug:'lineup-story', name:'Lineup, vertical', palette:'field', tpl:'img', safe:'paid',
  art:{ img:'exports/srg-ad01-s03-lineup-story-1080x1920.png', hl:'The whole shelf.',
        cells:[['srg-prod-bb10.jpg','BPC / TB-500','$49.99'],['srg-prod-cu50.jpg','GHK-CU','$34.99']],
        code:'STEADFAST10', url:'Tap to shop' },
  score:['Says it out loud'],
  cow:'Prices visible in a story, in a category that hides them.',
  pain:'&ldquo;Contact us for pricing.&rdquo;',
  process:'Published prices, certificate per lot.',
  proof:'Free shipping over $200. STEADFAST10 for 10% off a first order.',
  cta:'Tap to shop the lineup.',
  caption:"The whole shelf, with the prices left in. Fifteen SKUs, each shipping with its own certificate of analysis.\n\nSTEADFAST10 — 10% off a first order. Free shipping over $200.\n\nFor laboratory and research use only. Not for human consumption.",
  fields:{ headline:'—', desc:'Story asset. Sticker link to /products.', cta:'Swipe up' },
  spec:'Four vials in a 2×2 bled to the story edges, so each one renders around 520px wide — the biggest the product gets anywhere in the pack. Rotate which four across the flight.'
},
{
  id:'S04', slug:'full-panel-story', name:'The panel, vertical', palette:'carbon', tpl:'img', safe:'organic',
  art:{ img:'exports/srg-ad01-s04-full-panel-story-1080x1920.png', kick:'One lot, ten lines', hl:'Purity is<br>one line.',
        items:['Purity, HPLC','Identity','Net content','Arsenic','Cadmium','Lead','Mercury','Chromium','*Contaminant screen','Sterility, PCR'],
        url:'Tap for the report' },
  score:['Stops the scroll','Screenshot-worthy','New in the brain'],
  cow:'Ten test lines stacked full height, with the one nobody advertises highlighted.',
  pain:'Purity says what fraction is peptide. Nothing about the rest.',
  process:'Full QC panel: purity, identity, content, five metals, contaminant screen, sterility.',
  proof:'Lot HLX-SOP-RT20-2PEP, ILS Laboratories: every line pass or not detected.',
  cta:'Tap for the full report.',
  caption:"Purity is one line on the report. Here are the other nine — identity, net content, five heavy metals, a contaminant screen, and sterility by PCR.\n\nLot HLX-SOP-RT20-2PEP, ILS Laboratories, ISO/IEC 17025. Every line came back pass or not detected.\n\nsteadfastresearchgroup.com/coa\n\nFor laboratory and research use only. Not for human consumption.",
  fields:{ headline:'—', desc:'ORGANIC ONLY. Sticker link to /coa.', cta:'Swipe up' },
  spec:'ORGANIC ONLY. Single column vertical, ten rows, olive tick marks. The highlighted row stays generic on the artwork so the image survives a copy change.'
}
];

/* Build one creative element's markup, sized from SIZE so the preview and the
   exported file can never disagree about the format. */
function creative(a, isStory) {
  var s = isStory ? SIZE.story : SIZE.feed;
  return '<div class="cv cv--' + a.palette + (isStory ? ' cv--story' : '') + '"'
    + ' style="width:' + s[0] + 'px;height:' + s[1] + 'px">' + T[a.tpl](a.art) + '</div>';
}
function sizeOf(isStory) { return isStory ? SIZE.story : SIZE.feed; }

/* ---------------------------------------------------------------------------
   Canva. Each creative was imported into Blake's Canva from its PDF (not its
   PNG) so the text arrives as real text boxes you can retype, rather than one
   flat picture. Folder: Steadfast / Ad Pack 01 — Static.

   The short /d/ links Canva hands back on import rotate, so these are the
   stable /design/<id>/edit URLs instead.

   `nudge: true` marks the two creatives that need a pass after opening: Canva
   re-renders type on import and drops the negative letter-spacing on the very
   large figure, which widens it into the vial and shrinks the mono caption
   under it. The PNG is always the ship-ready file — if you publish out of
   Canva, compare it against the PNG first.
   --------------------------------------------------------------------------- */
var CANVA_FOLDER = 'https://www.canva.com/folder/FAHQyTh0-Ig';
var CANVA = {
  R01: 'DAHRbJrJ76w', R02: 'DAHRbA8WXAg', R03: 'DAHRbZTS5Jo', R04: 'DAHRbbjaAPE',
  R05: 'DAHRbb24dbo',
  /* R06 is Gabi's photo build — this Canva design IS the master; the page only
     mirrors its exported PNG. Never re-import over this id. */
  R06: 'DAHRR-SBtY0',
  S01: 'DAHRR91yj8Y', S02: 'DAHRR1zu87g', S03: 'DAHRR3Ws008', S04: 'DAHRRyAYoEw'
};
var CANVA_NUDGE = { S01: true };

function canvaUrl(id) {
  return CANVA[id] ? 'https://www.canva.com/design/' + CANVA[id] + '/edit' : null;
}

root.SRGPACK = {
  FEED: FEED, STORIES: STORIES, STRIP: STRIP, creative: creative,
  SIZE: SIZE, sizeOf: sizeOf,
  canvaUrl: canvaUrl, canvaFolder: CANVA_FOLDER, canvaNudge: CANVA_NUDGE,
  all: FEED.concat(STORIES),
  find: function (id) {
    var m = this.all.filter(function (a) { return a.id === id; });
    return m.length ? { ad: m[0], isStory: m[0].id.charAt(0) === 'S' } : null;
  }
};

})(window);
