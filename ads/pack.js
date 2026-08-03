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
   because Meta truncates captions and never crops pixels. */
var STRIP = 'For laboratory and research use only. Not for human consumption. '
          + 'Not a drug and not intended to diagnose, treat, cure, or prevent any disease.';

function mark() {
  return '<div class="mark"><img src="assets/flag-white.png" alt=""/>'
       + '<span>STEADFAST<small>RESEARCH GROUP</small></span></div>';
}
function strip(url) {
  return '<div class="strip">'
       + (url ? '<div class="url">' + url + '</div>' : '')
       + '<div class="stripwrap"><div class="dl">' + STRIP + '</div><div>' + mark() + '</div></div>'
       + '</div>';
}

/* -------------------------------------------------------------------------
   Templates. Each takes the ad's `art` record and returns creative markup.
   ------------------------------------------------------------------------- */
var T = {

  /* A real lot report, held as a legible band across the top of the frame. */
  doc: function (a) {
    return '<div class="docband"' + (a.docH ? ' style="height:' + a.docH + 'px"' : '') + '>'
      +   '<img src="' + C + a.doc + '" alt=""'
      +   (a.docTop ? ' style="top:' + a.docTop + 'px"' : '') + '/></div>'
      + '<div class="pad">'
      +   '<div class="kick">' + a.kick + '</div>'
      +   '<div class="cvbody">'
      +     '<h4 class="hl ' + (a.hlSize || '') + '">' + a.hl + '</h4>'
      +     (a.dek ? '<div class="dek">' + a.dek + '</div>' : '')
      +     (a.callout ? '<div class="callout"><span class="cl-k">' + a.callout[0] + '</span>'
      +       '<span class="cl-v ac">' + a.callout[1] + '</span></div>' : '')
      +   '</div>'
      + '</div>' + strip(a.url);
  },

  /* One audited number, as large as the canvas allows.
     Laid out in normal block flow with the vial absolutely positioned, rather
     than as centred flex siblings: Canva's PDF import re-anchors vertically
     centred flex children, which collapsed the big figure and dropped the vial
     on top of it. Block flow round-trips intact. */
  metric: function (a) {
    return '<div class="pad">'
      + '<div class="kick">' + a.kick + '</div>'
      + '<div class="cvbody"><div class="metricwrap">'
      +   '<div class="metrictext' + (a.vial ? ' has-vial' : '') + '">'
      +     (a.pre ? '<div class="bigsub" style="margin:0 0 6px">' + a.pre + '</div>' : '')
      +     '<div class="big ' + (a.bigSize || '') + ' ac">' + a.big + '</div>'
      +     '<div class="bigsub">' + a.bigsub + '</div>'
      +     (a.dek ? '<div class="dek" style="font-size:24px;margin-top:26px">' + a.dek + '</div>' : '')
      +   '</div>'
      +   (a.vial ? '<div class="vialbox"><img class="vial" src="' + M + a.vial + '" alt=""/></div>' : '')
      + '</div></div></div>' + strip(a.url);
  },

  /* Vial hero — the category's own format, with a fact where the adjective goes. */
  hero: function (a) {
    return '<div class="pad">'
      + '<div class="kick">' + a.kick + '</div>'
      + '<div class="cvbody"><div class="heroflex">'
      +   '<div class="txt">'
      +     '<h4 class="hl ' + (a.hlSize || 'sm') + '">' + a.hl + '</h4>'
      +     (a.dek ? '<div class="dek">' + a.dek + '</div>' : '')
      +     (a.callout ? '<div class="callout"><span class="cl-k">' + a.callout[0] + '</span>'
      +       '<span class="cl-v ac">' + a.callout[1] + '</span></div>' : '')
      +   '</div>'
      +   '<div class="art">' + (a.vial ? '<img class="vial" src="' + M + a.vial + '" alt=""/>' : '') + '</div>'
      + '</div></div></div>' + strip(a.url);
  },

  /* What actually got tested. A leading * marks the emphasised line. */
  list: function (a) {
    var li = a.items.map(function (t) {
      var hi = t.charAt(0) === '*';
      return '<li' + (hi ? ' class="hi ac"' : '') + '>' + (hi ? t.slice(1) : t) + '</li>';
    }).join('');
    return '<div class="pad">'
      + '<div class="kick">' + a.kick + '</div>'
      + '<div class="cvbody">'
      +   '<h4 class="hl ' + (a.hlSize || 'sm') + '">' + a.hl + '</h4>'
      +   '<ul class="checks">' + li + '</ul>'
      +   (a.dek ? '<div class="dek" style="font-size:23px;margin-top:26px">' + a.dek + '</div>' : '')
      + '</div></div>' + strip(a.url);
  },

  /* Type only. Cheapest to make, usually the most forwarded. */
  text: function (a) {
    return '<div class="pad">'
      + '<div class="kick">' + a.kick + '</div>'
      + '<div class="cvbody">'
      +   '<h4 class="hl ' + (a.hlSize || 'lg') + '" style="margin:0">' + a.hl + '</h4>'
      +   (a.dek ? '<div class="dek">' + a.dek + '</div>' : '')
      +   (a.code ? '<div class="code ac">' + a.code + '</div>' : '')
      + '</div></div>' + strip(a.url);
  },

  /* The shelf, with the prices left in. */
  grid: function (a) {
    var cells = a.cells.map(function (c) {
      return '<div class="cell"><img src="' + M + c[0] + '" alt=""/>'
           + '<em>' + c[1] + '</em><span>' + c[2] + '</span></div>';
    }).join('');
    return '<div class="pad">'
      + '<div class="kick">' + a.kick + '</div>'
      + '<div class="cvbody">'
      +   '<h4 class="hl sm">' + a.hl + '</h4>'
      +   '<div class="pgrid">' + cells + '</div>'
      +   (a.dek ? '<div class="dek" style="font-size:23px;margin-top:30px">' + a.dek + '</div>' : '')
      +   (a.code ? '<div class="code ac" style="margin-top:22px">' + a.code + '</div>' : '')
      + '</div></div>' + strip(a.url);
  }
};

/* -------------------------------------------------------------------------
   FEED — 1080x1080. Ordered by how hard the cow hits.
   ------------------------------------------------------------------------- */
var FEED = [
{
  id:'F01', slug:'the-receipt', name:'The receipt', palette:'carbon', tpl:'doc', safe:'paid',
  art:{ doc:'retatrutide.jpg', docTop:0, docH:380, kick:'Lot HLX-SOP-RT20-2PEP',
        hl:'Most ads show<br>the vial.<br>This one shows<br>the paperwork.',
        callout:['Peptide purity, HPLC','98.76%'], url:'steadfastresearchgroup.com/coa' },
  score:['Stops the scroll','Says it out loud','Screenshot-worthy','New in the brain'],
  cow:'This ad is a lab report. We put the document in the creative and the vial nowhere.',
  pain:'In research supply, &ldquo;99%+ pure&rdquo; is a font choice. It appears on the artwork, never on a document anybody can open.',
  process:'Every lot is tested by an independent lab before it gets a label. Purity, identity and measured content go onto a batch-specific Certificate of Analysis, tied to the lot number printed on the vial in your hand.',
  proof:'The report in this ad is real: Retatrutide 20 mg, lot HLX-SOP-RT20-2PEP, purity <b>98.76%</b> against a &ge;95% spec, tested by <b>ILS Laboratories</b> (ISO/IEC 17025 accredited).',
  cta:'Read a COA before you order the vial &rarr; steadfastresearchgroup.com/coa',
  caption:"This is not a product photo. It's a lab report.\n\nIn research supply, “99%+ pure” is a font choice. It goes on the artwork and never on a document anyone can open.\n\nEvery Steadfast lot is tested by an independent lab before it gets a label. Purity, identity and measured content go onto a batch-specific Certificate of Analysis — tied to the lot number printed on the vial in your hand.\n\nThe report above is real. Retatrutide 20 mg, lot HLX-SOP-RT20-2PEP: 98.76% purity against a ≥95% spec, tested by ILS Laboratories, ISO/IEC 17025 accredited.\n\nRead the COA before you order the vial → steadfastresearchgroup.com/coa\n\nFor laboratory and research use only. Not for human consumption. Not a drug and not intended to diagnose, treat, cure, or prevent any disease.",
  fields:{ headline:'The COA is the product.', desc:'Batch-specific lot report. Research use only.', cta:'Learn more' },
  spec:'Lot report greyscaled and bled full-frame behind a top-to-bottom Carbon scrim so the headline holds. Purity figure boxed in olive, 2px rule, bottom left. Do not retouch the document and do not crop out the lab letterhead — the letterhead is the ad.'
},
{
  id:'F02', slug:'fill-accuracy', name:'Fill accuracy', palette:'field', tpl:'metric', safe:'paid',
  art:{ kick:'BPC-157 &middot; Report #151664', pre:'Label says <span class="strike">10 MG</span>',
        big:'10.23', bigsub:'Milligrams measured',
        dek:'We publish both numbers. Even when the second one is lower.', vial:'srg-prod-bb10.jpg',
        url:'steadfastresearchgroup.com/coa' },
  score:['Stops the scroll','Says it out loud','Screenshot-worthy','New in the brain'],
  cow:'Here is the number nobody in this category will show you: what is actually in the vial.',
  pain:'A label is a claim. Fill weight is a measurement. Almost every supplier will only ever show you the claim.',
  process:'Independent labs weigh net peptide content per lot and report it against the labeled amount. We publish that figure on the COA whatever it says &mdash; over, under, or exact.',
  proof:'BPC-157 10 mg &rarr; <b>10.23 mg</b> measured, 98.767% purity (Janoshik). GHK-Cu 50 mg &rarr; <b>52.33 mg</b>, 104.7% fill accuracy (Testides). And the one that makes the rest believable: NAD+ 500 mg lot &rarr; <b>494.51 mg</b>, just under label (Kovera Labs).',
  cta:'Every lot, every number &rarr; steadfastresearchgroup.com/coa',
  caption:"Label says 10 mg. The lab measured 10.23 mg. We publish both.\n\nA label is a claim. Fill weight is a measurement. Almost every supplier in this category will only ever show you the claim.\n\nIndependent labs weigh net peptide content per lot and report it against the labeled amount. That figure goes on our COA whatever it says — over, under, or exact.\n\nBPC-157 10 mg → 10.23 mg measured, 98.767% purity (Janoshik)\nGHK-Cu 50 mg → 52.33 mg, 104.7% fill accuracy (Testides)\nNAD+ 500 mg lot → 494.51 mg, just under label (Kovera Labs)\n\nThat last one is the point. A supplier who only publishes the numbers that flatter them is publishing marketing.\n\nEvery lot, every number → steadfastresearchgroup.com/coa\n\nFor laboratory and research use only. Not for human consumption. Not a drug and not intended to diagnose, treat, cure, or prevent any disease.",
  fields:{ headline:'Labeled 10 mg. Measured 10.23 mg.', desc:'We publish the measurement, not the claim.', cta:'Learn more' },
  spec:'Field ground. The struck-through label figure sits small above a 250px measured number in olive. Vial right, on its own bone panel, multiply blend so the studio white drops out. This is the flagship — build the story cut and the paid cut from the same file.'
},
{
  id:'F03', slug:'labs-we-dont-own', name:'Labs we don’t own', palette:'olive', tpl:'text', safe:'paid',
  art:{ kick:'Independent testing', hl:'We send our lots<br>to four labs<br>we don’t own.', hlSize:'',
        dek:'ILS Laboratories &middot; Janoshik &middot; Testides &middot; Kovera Labs. Different labs, different methods, same requirement.',
        url:'steadfastresearchgroup.com/coa' },
  score:['Stops the scroll','Says it out loud','New in the brain'],
  cow:'Four different labs, none of them ours. An in-house certificate is a self-portrait.',
  pain:'&ldquo;Third-party tested&rdquo; is the easiest sentence in this industry to write and the hardest to check. Plenty of certificates come from a lab with the same owner as the seller.',
  process:'Lots go out to independent labs that have no stake in the result. Every COA we publish carries the lab’s own letterhead, its report number, and its director’s signature.',
  proof:'<b>ILS Laboratories</b> (ISO/IEC 17025), <b>Janoshik</b>, <b>Testides</b> and <b>Kovera Labs</b> &mdash; four labs across five published lot reports.',
  cta:'Check the letterheads yourself &rarr; steadfastresearchgroup.com/coa',
  caption:"We send our lots to four labs we don't own.\n\n“Third-party tested” is the easiest sentence in this industry to write and the hardest to check. Plenty of certificates come from a lab that shares an owner with the seller.\n\nOurs go out to independent labs with no stake in the result. Every COA we publish carries that lab's own letterhead, its report number, and its director's signature — so you can verify it without taking our word for anything.\n\nILS Laboratories (ISO/IEC 17025 accredited)\nJanoshik\nTestides\nKovera Labs\n\nFour labs. Five published lot reports. Check the letterheads yourself → steadfastresearchgroup.com/coa\n\nFor laboratory and research use only. Not for human consumption. Not a drug and not intended to diagnose, treat, cure, or prevent any disease.",
  fields:{ headline:'Four labs. None of them ours.', desc:'Independent lot testing, letterheads published.', cta:'Learn more' },
  spec:'Olive flood, type only, no product. Headline at 104px, lab names set in Space Mono in the deck so they read as attribution rather than logos. Cheapest asset in the pack to produce and likely the most shared.'
},
{
  id:'F04', slug:'the-full-panel', name:'The full panel', palette:'carbon', tpl:'list', safe:'organic',
  art:{ kick:'One lot. Ten lines.', hl:'Purity is one line<br>on the report.',
        items:['Peptide purity, HPLC','Identity, HPLC-RTM','Net peptide content','Arsenic','Cadmium','Lead','Mercury','Chromium','*Contaminant screen','Sterility, PCR'],
        dek:'Every line above came back pass or not detected on lot HLX-SOP-RT20-2PEP.',
        url:'steadfastresearchgroup.com/coa' },
  score:['Stops the scroll','Says it out loud','Screenshot-worthy','New in the brain'],
  cow:'One line on our Retatrutide lot report is a contaminant screen most suppliers would rather you never thought about. We would rather you knew it was there.',
  pain:'Purity tells you what fraction of the powder is the peptide. It tells you nothing whatsoever about the rest of it.',
  process:'The full QC panel on that lot covers identity and purity by HPLC, net content, five heavy metals, a contaminant immunoassay, and sterility by PCR.',
  proof:'Lot HLX-SOP-RT20-2PEP, ILS Laboratories, ISO/IEC 17025: purity <b>98.76%</b>, arsenic, cadmium, lead, mercury and chromium all <b>not detected</b>, contaminant screen <b>not detected</b>, sterility <b>no growth</b>.',
  cta:'Read the whole panel &rarr; steadfastresearchgroup.com/coa',
  caption:"Purity is one line on the report. Here are the other nine.\n\nPurity tells you what fraction of the powder is the peptide. It tells you nothing at all about the rest of it.\n\nThe full QC panel on lot HLX-SOP-RT20-2PEP, run by ILS Laboratories (ISO/IEC 17025 accredited):\n\nPeptide purity, HPLC — 98.76% against a ≥95% spec\nIdentity, HPLC-RTM — confirmed\nNet peptide content — 20.37 mg on a 20 mg label\nArsenic, cadmium, lead, mercury, chromium — all not detected\nFentanyl immunoassay — not detected\nSterility, PCR — no growth\n\nTen lines. Every one of them pass or not detected.\n\nRead the whole panel → steadfastresearchgroup.com/coa\n\nFor laboratory and research use only. Not for human consumption. Not a drug and not intended to diagnose, treat, cure, or prevent any disease.",
  fields:{ headline:'Purity is one line. There are nine more.', desc:'Full QC panel, published per lot.', cta:'Learn more' },
  spec:'ORGANIC ONLY — the caption names the substance, which is exactly why this one does not go into paid. Two-column checklist on Carbon, olive ticks, the contaminant line set in olive semibold as the visual anchor. The artwork itself says “contaminant screen” so the image stays reusable if the copy is softened.'
},
{
  id:'F05', slug:'tested-twice', name:'Tested twice', palette:'field', tpl:'hero', safe:'paid',
  art:{ kick:'Janoshik &middot; Report #151664', hl:'The lab’s note on our<br>BPC-157: &ldquo;tested&nbsp;twice.&rdquo;',
        dek:'One run can flatter a batch. Two runs are harder to argue with.',
        callout:['Purity, HPLC','98.767%'], vial:'srg-prod-bb10.jpg', url:'steadfastresearchgroup.com/coa' },
  score:['Says it out loud','Screenshot-worthy','New in the brain'],
  cow:'The most persuasive line on our BPC-157 report was written by the lab, not by us: sample was tested twice.',
  pain:'A single run on a good day is the cheapest way to make a mediocre batch look excellent.',
  process:'Where a result needs confirming, the sample gets run again before the lot is released. The lab’s comment stays on the published report either way.',
  proof:'Janoshik report #151664, Arg-BPC-157: <b>10.23 mg</b> content on a 10 mg label, purity <b>98.767%</b>, lab comment: <em>sample was tested twice</em>.',
  cta:'See the report &rarr; steadfastresearchgroup.com/coa',
  caption:"The most persuasive line on our BPC-157 report was written by the lab, not by us.\n\n“Sample was tested twice.”\n\nA single run on a good day is the cheapest way to make a mediocre batch look excellent. Where a result needs confirming, the sample gets run again before the lot is released — and the lab's comment stays on the published report either way.\n\nJanoshik report #151664, Arg-BPC-157:\nContent — 10.23 mg on a 10 mg label\nPurity — 98.767%\nComment — sample was tested twice\n\nSee the report → steadfastresearchgroup.com/coa\n\nFor laboratory and research use only. Not for human consumption. Not a drug and not intended to diagnose, treat, cure, or prevent any disease.",
  fields:{ headline:'“Sample was tested twice.” — the lab', desc:'BPC-157 / TB-500, 10 mg. Lot report published.', cta:'Shop now' },
  spec:'Field ground, vial right on multiply. Headline carries the lab’s quotation marks — keep them, the quote is doing the work. Purity boxed under the deck.'
},
{
  id:'F06', slug:'spot-a-fake-coa', name:'Spot a fake COA', palette:'olive', tpl:'doc', safe:'paid',
  art:{ doc:'ghk-cu.jpg', docTop:-45, docH:520, kick:'Free guide, no email gate',
        hl:'We published<br>the guide that<br>catches a faked<br>certificate.',
        dek:'Including, in principle, one of ours. Six checks, five minutes.',
        url:'steadfastresearchgroup.com/blog' },
  score:['Stops the scroll','Says it out loud','Would share','New in the brain'],
  cow:'We wrote the guide that teaches you to catch a forged certificate &mdash; a guide that works on us too.',
  pain:'A PDF is trivial to edit. A researcher holding a certificate usually has no way to tell a real chromatogram from a decorative one.',
  process:'Six checks: lab name and report number, does the lot on the certificate match the vial, analysis date against the fill date, the stated method, the retention peaks themselves, and whether the purity figure agrees with the peak area.',
  proof:'The whole thing is on our blog. No email, no gate: steadfastresearchgroup.com/blog/how-to-spot-a-fake-peptide-coa',
  cta:'Read it, then use it on us.',
  caption:"We published the guide that catches a faked certificate. It works on us too.\n\nA PDF is trivial to edit. A researcher holding a certificate usually has no way to tell a real chromatogram from a decorative one — which is exactly why so many of them are decorative.\n\nSix checks, about five minutes:\n\n1. Lab name and report number — does the lab exist, does the number resolve\n2. Lot match — the lot on the certificate against the lot on the vial\n3. Analysis date against the fill date\n4. The stated method — HPLC at what wavelength, which column\n5. The chromatogram itself — retention peaks, or a drawing of them\n6. Whether the purity figure actually agrees with the peak area\n\nFull guide, no email required → steadfastresearchgroup.com/blog/how-to-spot-a-fake-peptide-coa\n\nThen run it on ours.\n\nFor laboratory and research use only. Not for human consumption. Not a drug and not intended to diagnose, treat, cure, or prevent any disease.",
  fields:{ headline:'Six checks that catch a faked COA', desc:'Free guide. No email required.', cta:'Learn more' },
  spec:'The GHK-Cu report behind an Olive scrim, cropped so the chromatogram sits behind the headline. The most shareable asset here, because it is useful to someone who never buys from us.'
},
{
  id:'F07', slug:'bench-tool', name:'The bench tool', palette:'carbon', tpl:'metric', safe:'paid',
  art:{ kick:'Free tool, no signup', pre:'50 mg vial, 2 mL solvent',
        big:'25', bigsub:'Milligrams per mL, in the vial', bigSize:'sm',
        dek:'Concentration math for the vial in front of you. Free, no email, no account.',
        url:'steadfastresearchgroup.com/tools' },
  score:['Would share','New in the brain'],
  cow:'A free bench calculator with no email gate, from the company that sells the thing you’re measuring.',
  pain:'Concentration math is where a perfectly good lot gets wasted, usually late, usually by someone doing it in their head.',
  process:'Enter the vial’s labeled mg and the volume of solvent. It returns mg/mL for that vial. That is the whole tool.',
  proof:'Live on the site: steadfastresearchgroup.com/tools/peptide-reconstitution-calculator',
  cta:'Bookmark it. It costs nothing.',
  caption:"A free reconstitution calculator. No email, no account, no gate.\n\nConcentration math is where a perfectly good lot gets wasted — usually late in the day, usually by someone doing it in their head.\n\nEnter the vial's labeled mg and your solvent volume. It returns mg/mL for that vial. That's the whole tool.\n\nsteadfastresearchgroup.com/tools/peptide-reconstitution-calculator\n\nBookmark it — it costs nothing and it works whether or not you ever order from us.\n\nFor laboratory and research use only. Not for human consumption. Not a drug and not intended to diagnose, treat, cure, or prevent any disease.",
  fields:{ headline:'Free reconstitution calculator', desc:'mg/mL for the vial. No email required.', cta:'Learn more' },
  spec:'Carbon, no product. The worked example is deliberately generic — 50 mg in 2 mL gives 25 mg/mL. That figure describes the vial and nothing else: no volumes, no subjects, no schedules anywhere near this creative.'
},
{
  id:'F08', slug:'boring-box', name:'The boring box', palette:'field', tpl:'hero', safe:'paid',
  art:{ kick:'Cold-handled &middot; unbranded &middot; tracked', hl:'The least interesting<br>photo in our library.',
        dek:'A plain box with nothing on it. Most orders leave within one business day, cold-handled, tracked, with the tracking email sent the moment it ships.',
        vial:'srg-prod-wa10.jpg', url:'steadfastresearchgroup.com/shipping' },
  score:['Says it out loud','New in the brain'],
  cow:'We built an ad around the packaging, because the packaging says nothing at all. That is the feature.',
  pain:'Slow dispatch, warm transit, and a box that announces itself to everyone who walks past it.',
  process:'Orders are cold-handled to protect stability, shipped in plain unbranded packaging, and tracked. Most go out within one business day, with the tracking email sent the moment the parcel leaves the facility.',
  proof:'Terms and timings are published: steadfastresearchgroup.com/shipping',
  cta:'See how it ships &rarr; steadfastresearchgroup.com/shipping',
  caption:"The least interesting photo in our library: a plain box with nothing written on it.\n\nThat's the feature.\n\nOrders are cold-handled to protect stability, shipped in plain unbranded packaging, and tracked. Most leave within one business day, and the tracking email goes out the moment the parcel leaves the facility.\n\nNo branding on the outside. No guessing where it is.\n\nsteadfastresearchgroup.com/shipping\n\nFor laboratory and research use only. Not for human consumption. Not a drug and not intended to diagnose, treat, cure, or prevent any disease.",
  fields:{ headline:'Plain box. One business day.', desc:'Cold-handled, unbranded, tracked.', cta:'Shop now' },
  spec:'NEEDS PHOTOGRAPHY — currently rendering with a BAC water vial as a stand-in. Shoot the actual outer box on the Field ground: empty, closed, no props. The whole joke depends on the photo being genuinely dull.'
},
{
  id:'F09', slug:'ruo-is-the-spec', name:'RUO is the spec', palette:'carbon', tpl:'text', safe:'paid',
  art:{ kick:'What’s on the label', hl:'Not for human<br>consumption.',
        dek:'The least marketable sentence in the world, printed on the front of every vial we make. It isn’t small print. It’s the specification.',
        url:'steadfastresearchgroup.com/blog' },
  score:['Stops the scroll','New in the brain'],
  cow:'An ad whose headline is the disclaimer. We put the least sellable sentence available on the front of the creative.',
  pain:'Half this category treats &ldquo;research use only&rdquo; as a legal shrug, then winks at the reader in the caption.',
  process:'It is printed on the front panel of the label, stated on every product page, and repeated on the invoice. Our buyer is a qualified researcher, and the material is a reagent.',
  proof:'Every label reads: lyophilized powder, for research use only, not for human consumption. What that actually means: steadfastresearchgroup.com/blog/what-does-research-use-only-mean',
  cta:'Read what RUO means, properly.',
  caption:"“Not for human consumption.”\n\nThe least marketable sentence in the world, printed on the front panel of every vial we make.\n\nHalf this category treats research use only as a legal shrug — fine print at the bottom, a wink in the caption. We set it in the same size as the compound name, because it isn't a disclaimer. It's the specification.\n\nEvery label: lyophilized powder. For research use only. Not for human consumption.\n\nOur buyer is a qualified researcher and the material is a reagent. That's the entire product.\n\nWhat RUO actually means → steadfastresearchgroup.com/blog/what-does-research-use-only-mean\n\nNot a drug and not intended to diagnose, treat, cure, or prevent any disease.",
  fields:{ headline:'It isn’t small print. It’s the spec.', desc:'Research use only, stated on the front panel.', cta:'Learn more' },
  spec:'NEEDS PHOTOGRAPHY — wants a tight crop of a real printed label with the compliance lines legible. Type-only until we have it. Also the single best asset to have in the account when a reviewer is deciding what kind of advertiser we are.'
},
{
  id:'F10', slug:'lineup-priced', name:'The lineup, priced', palette:'olive', tpl:'grid', safe:'paid',
  art:{ kick:'Fifteen SKUs &middot; prices published', hl:'No &ldquo;contact us<br>for pricing.&rdquo;',
        cells:[['srg-prod-rt10.jpg','RETATRUTIDE','10 mg &middot; $99.99'],['srg-prod-tr10.jpg','TIRZEPATIDE','10 mg &middot; $69.99'],
               ['srg-prod-bb10.jpg','BPC / TB-500','10 mg &middot; $49.99'],['srg-prod-cu50.jpg','GHK-CU','50 mg &middot; $34.99']],
        dek:'Every size, every price, on the page. Each lot ships with its own certificate.',
        code:'STEADFAST10 &mdash; 10% first order', url:'steadfastresearchgroup.com/products' },
  score:['Says it out loud','New in the brain'],
  cow:'The whole catalogue with the prices left in, in a category that hides them behind a form.',
  pain:'&ldquo;Contact us for pricing&rdquo; wastes a researcher’s afternoon and tells them the price depends on who is asking.',
  process:'Fifteen SKUs, prices published on the page, each lot shipping with its own certificate of analysis.',
  proof:'Prices as shown: Retatrutide 10 mg $99.99, Tirzepatide 10 mg $69.99, Tesamorelin 5 mg $49.99, BPC-157/TB-500 10 mg $49.99, GHK-Cu 50 mg $34.99. Free shipping over $200.',
  cta:'STEADFAST10 takes 10% off a first order &rarr; steadfastresearchgroup.com/products',
  caption:"No “contact us for pricing.” Here's the catalogue with the prices left in.\n\nGatekeeping a price list wastes a researcher's afternoon and quietly says the number depends on who's asking.\n\nFifteen SKUs. Prices on the page. Every lot ships with its own certificate of analysis.\n\nRetatrutide 10 mg — $99.99\nTirzepatide 10 mg — $69.99\nTesamorelin 5 mg — $49.99\nBPC-157 / TB-500 10 mg — $49.99\nGHK-Cu 50 mg — $34.99\n\nFree shipping over $200. STEADFAST10 takes 10% off a first order.\n\nsteadfastresearchgroup.com/products\n\nFor laboratory and research use only. Not for human consumption. Not a drug and not intended to diagnose, treat, cure, or prevent any disease.",
  fields:{ headline:'Fifteen SKUs. Prices on the page.', desc:'STEADFAST10 for 10% off a first order.', cta:'Shop now' },
  spec:'Olive ground, four vials in bone cells on multiply, grid bled to the canvas edge so the glass renders as large as possible. Prices in Space Mono. Four rather than five because a cell’s width caps the product size — if a fifth SKU has to appear, it comes at the cost of every vial shrinking. Verify every figure against the live catalogue on the day it ships; this is the one asset in the pack that goes stale.'
}
];

/* -------------------------------------------------------------------------
   STORIES — 1080x1920, 250px clear top and bottom.
   ------------------------------------------------------------------------- */
var STORIES = [
{
  id:'S01', slug:'fill-accuracy-story', name:'Fill accuracy, vertical', palette:'field', tpl:'metric', safe:'paid',
  art:{ kick:'BPC-157 &middot; #151664', pre:'Label says <span class="strike">10 MG</span>', big:'10.23',
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
  id:'S02', slug:'calculator-story', name:'Calculator, vertical', palette:'carbon', tpl:'text', safe:'paid',
  art:{ kick:'Free &middot; no email', hl:'mg/mL,<br>solved.',
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
  id:'S03', slug:'lineup-story', name:'Lineup, vertical', palette:'olive', tpl:'grid', safe:'paid',
  art:{ kick:'Prices published', hl:'The whole shelf.',
        cells:[['srg-prod-rt10.jpg','RETATRUTIDE','$99.99'],['srg-prod-tr10.jpg','TIRZEPATIDE','$69.99'],
               ['srg-prod-bb10.jpg','BPC / TB-500','$49.99'],['srg-prod-cu50.jpg','GHK-CU','$34.99']],
        dek:'Fifteen SKUs, each shipping with its own certificate of analysis.',
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
  id:'S04', slug:'full-panel-story', name:'The panel, vertical', palette:'carbon', tpl:'list', safe:'organic',
  art:{ kick:'One lot, ten lines', hl:'Purity is<br>one line.',
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
  F01: 'DAHRRZJZIDE', F02: 'DAHRRQKzs_E', F03: 'DAHRRadMKGs', F04: 'DAHRRfM_a3o',
  F05: 'DAHRRXL81r0', F06: 'DAHRRTL1KrQ', F07: 'DAHRRYxxe_s', F08: 'DAHRRX98fQk',
  F09: 'DAHRRVYbkLA', F10: 'DAHRRZp-dTE',
  S01: 'DAHRRWtw3xE', S02: 'DAHRRYRCMHM', S03: 'DAHRReRPNRQ', S04: 'DAHRReOyuUg'
};
var CANVA_NUDGE = { F02: true, S01: true };

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
