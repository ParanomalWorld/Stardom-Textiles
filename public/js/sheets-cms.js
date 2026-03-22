'use strict';

// ═══════════════════════════════════════════════════════
//  STARDOM TEXTILES — Google Sheets CMS
//  
//  STEP 1: Paste your Google Sheet ID below.
//  Your Sheet ID is in the URL:
//  https://docs.google.com/spreadsheets/d/  ← THIS PART →  /edit
// ═══════════════════════════════════════════════════════

const SHEET_ID = '1OvFW7cGgDO2FuPyWoSf6swK1JlVtxLCMcvSOESlMtlA';

// ───────────────────────────────────────────────────────
//  Internal helpers — do not edit below this line
// ───────────────────────────────────────────────────────

function sheetUrl(tabName) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
}

// CSV parser — handles quoted fields with commas inside
function parseCSV(text) {
  const rows = [];
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (c === ',' && !inQ) {
        cols.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    cols.push(cur.trim());
    rows.push(cols);
  }
  return rows;
}

// Key-value sheet parser (contact tab, hero tab)
// Column A = field name, Column B = value
function parseKV(text) {
  const obj = {};
  for (const row of parseCSV(text)) {
    if (row[0] && row[0].toLowerCase() !== 'field') {
      obj[row[0].trim()] = (row[1] || '').trim();
    }
  }
  return obj;
}

// Table sheet parser (products tab, ticker tab)
// First row = headers, rest = data
function parseTable(text) {
  const rows = parseCSV(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  return rows.slice(1)
    .filter(r => r.some(c => c.trim()))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = (row[i] || '').trim(); });
      return obj;
    });
}

// Safe DOM text setter
function setText(id, val) {
  const el = document.getElementById(id);
  if (el && val) el.textContent = val;
}

// ═══════════════════════════════════════════════════════
//  CONTACT TAB loader
//  Sheet columns: field | value
//
//  Rows needed:
//  shopName    | Stardom Textiles
//  phone       | 7510000000
//  city        | Karanja (Gh.)
//  address     | Karanja (Gh.), Maharashtra
//  hours       | Mon–Sat · 10:00 am – 10:30 pm
//  hoursShort  | Open till 10:30 pm
//  email       | (optional)
//  mapsUrl     | (optional Google Maps link)
//  facebook    | (optional)
//  instagram   | (optional)
//  pinterest   | (optional)
//  yearsInBusiness | 11+
//  ordersDelivered | 500+
//  rating      | 4.3
//  ratingStars | ⭐⭐⭐⭐☆
//  waCountryCode | 91
// ═══════════════════════════════════════════════════════

function loadContact() {
  fetch(sheetUrl('contact'))
    .then(r => r.ok ? r.text() : Promise.reject('contact sheet missing'))
    .then(text => {
      const d = parseKV(text);

      const phone       = d.phone       || SITE.primaryPhone;
      const waCode      = d.wacountrycode || d.waCountryCode || '91';
      const city        = d.city        || SITE.city;
      const address     = d.address     || SITE.address;
      const hours       = d.hours       || SITE.hours;
      const hoursShort  = d.hoursshort  || d.hoursShort || SITE.hoursShort;
      const shopName    = d.shopname    || d.shopName   || SITE.shopName;
      const years       = d.yearsinbusiness || d.yearsInBusiness || SITE.yearsInBusiness;
      const orders      = d.ordersdelivered || d.ordersDelivered || SITE.ordersDelivered;
      const rating      = d.rating      || String(SITE.rating.value);
      const ratingStars = d.ratingstars || d.ratingStars || SITE.rating.stars;
      const email       = d.email       || '';
      const mapsUrl     = d.mapsurl     || d.mapsUrl    || '';

      // Update SITE object so WA links use new phone
      SITE.primaryPhone   = phone;
      SITE.primaryWaCode  = waCode;
      SITE.city           = city;
      SITE.address        = address;
      SITE.hours          = hours;
      SITE.hoursShort     = hoursShort;
      SITE.shopName       = shopName;
      SITE.yearsInBusiness= years;
      SITE.ordersDelivered= orders;
      SITE.rating.value   = parseFloat(rating) || SITE.rating.value;
      SITE.rating.stars   = ratingStars;
      if (d.facebook)  SITE.social.facebook  = d.facebook;
      if (d.instagram) SITE.social.instagram = d.instagram;
      if (d.pinterest) SITE.social.pinterest = d.pinterest;

      // ── Top bar ──
      const tbCity  = document.getElementById('tbCity');
      const tbPhone = document.getElementById('tbPhone');
      if (tbCity)  tbCity.innerHTML  = `<span class="dot"></span>📍 ${city}`;
      if (tbPhone) tbPhone.innerHTML = `<span class="dot"></span>📞 ${phone}`;

      // ── Header phone ──
      setText('headerPhone', phone);

      // ── Trust popup ──
      const tpStars = document.getElementById('tpStars');
      if (tpStars) { tpStars.textContent = ratingStars; tpStars.setAttribute('aria-label', `${rating} out of 5`); }
      const tpCity  = document.getElementById('tpCity');
      const tpHours = document.getElementById('tpHoursShort');
      const tpPhone = document.getElementById('tpPhone');
      const tpWa    = document.getElementById('tpWaLink');
      if (tpCity)  tpCity.textContent  = `📍 ${city}`;
      if (tpHours) tpHours.textContent = `🕐 ${hoursShort}`;
      if (tpPhone) tpPhone.textContent = `📞 ${phone}`;
      if (tpWa)    tpWa.href           = SITE.waLink();

      // ── Mobile nav WA ──
      const mobWa = document.getElementById('mobileNavWa');
      if (mobWa) mobWa.href = SITE.waLink();

      // ── Contact channels ──
      const cpv    = document.getElementById('contactPhoneVal');
      const cav    = document.getElementById('contactAddressVal');
      const chv    = document.getElementById('contactHoursVal');
      const cpCard = document.getElementById('channelPhone');
      if (cpv)    cpv.textContent = phone;
      if (cav)    cav.textContent = address;
      if (chv)    chv.textContent = hours;
      if (cpCard) cpCard.href     = `tel:${phone}`;

      // Optional email card
      if (email) {
        const existing = document.getElementById('channelEmail');
        if (!existing) {
          const ec = document.createElement('a');
          ec.id        = 'channelEmail';
          ec.href      = `mailto:${email}`;
          ec.className = 'channel-card';
          ec.setAttribute('role', 'listitem');
          ec.innerHTML = `<div class="channel-icon" aria-hidden="true">📧</div><div><div class="channel-label">Email Us</div><div class="channel-val">${email}</div></div>`;
          const ch = document.getElementById('contactChannels');
          if (ch) ch.appendChild(ec);
        }
      }

      // ── Hero stats ──
      setText('heroEyebrowCity', city);
      setText('heroEyebrowYears', years);
      setText('statYears',  years);
      setText('statOrders', orders);
      setText('statRating', `${rating}★`);
      setText('factYears',  years);
      setText('factOrders', orders);

      // ── Footer ──
      setText('footerShopName', shopName);
      const fTag = document.getElementById('footerTagline');
      if (fTag) fTag.textContent = `Premium Textile Manufacturing · ${city} · Pan-India`;
      const fPL = document.getElementById('footerPhoneLink');
      if (fPL)  { fPL.textContent = phone; fPL.href = `tel:${phone}`; }
      const fCont = document.getElementById('footerContact');
      if (fCont) {
        const emailLine = email ? `📧 <a href="mailto:${email}" style="color:#f0ede8;font-weight:600">${email}</a><br>` : '';
        const mapAttr   = mapsUrl ? `href="${mapsUrl}" target="_blank" rel="noopener"` : '';
        fCont.innerHTML = `📍 <a ${mapAttr} style="color:#7a7570">${address}</a><br>📞 <a href="tel:${phone}" style="color:#f0ede8;font-weight:600">${phone}</a><br>🕐 ${hours}<br>${emailLine}✈️ Delivering All Over India`;
      }

      // ── Social links ──
      const fFb = document.getElementById('fSocFb');
      const fIg = document.getElementById('fSocIg');
      const fPt = document.getElementById('fSocPt');
      if (fFb && d.facebook)  fFb.href = d.facebook;
      if (fIg && d.instagram) fIg.href = d.instagram;
      if (fPt && d.pinterest) fPt.href = d.pinterest;

      // ── Form WA links ──
      const waD = document.getElementById('waDirectLink');
      if (waD) waD.href = SITE.waLink('Hi, I want to enquire about your products.');
      setText('successPhone', phone);
    })
    .catch(err => console.warn('[Sheets CMS] contact tab:', err));
}

// ═══════════════════════════════════════════════════════
//  TICKER TAB loader
//  Sheet columns: highlight | text
//
//  Example rows:
//  New Arrival:  | Premium Drifit Sports Kits — bulk orders welcome
//  Free Delivery | on orders above ₹5,000 across India
//  (leave highlight empty if not needed)
// ═══════════════════════════════════════════════════════

function loadTicker() {
  fetch(sheetUrl('ticker'))
    .then(r => r.ok ? r.text() : Promise.reject('ticker sheet missing'))
    .then(text => {
      const items = parseTable(text);
      if (!items.length) return;
      const track = document.getElementById('tickerTrack');
      if (!track) return;
      const html = items.map(item => {
        const hl = item.highlight ? `<strong>${item.highlight}</strong> ` : '';
        return `<span class="ticker-item"><span class="tdot"></span>${hl}${item.text || ''}</span>`;
      }).join('');
      // Duplicate for seamless scroll
      track.innerHTML = html + html;
      track.style.animationDuration = Math.max(18, items.length * 6) + 's';
    })
    .catch(err => console.warn('[Sheets CMS] ticker tab:', err));
}

// ═══════════════════════════════════════════════════════
//  HERO TAB loader
//  Sheet columns: field | value
//
//  Rows needed:
//  heading    | Fabric That<br>Fits <em>Every Story</em>
//  subheading | Premium T-shirts, Uniforms & Sports Kits
//  image1     | https://... (first carousel image URL)
//  image2     | https://... (second image — add more: image3, image4)
//  alt1       | Description for image 1 (optional)
//  alt2       | Description for image 2 (optional)
//
//  Tip: Upload images to Cloudinary (free) and paste the URL here.
// ═══════════════════════════════════════════════════════

function loadHero() {
  fetch(sheetUrl('hero'))
    .then(r => r.ok ? r.text() : Promise.reject('hero sheet missing'))
    .then(text => {
      const d = parseKV(text);

      const headingEl    = document.getElementById('heroHeading');
      const subheadingEl = document.getElementById('heroSubheading');
      if (headingEl    && d.heading)    headingEl.innerHTML   = d.heading;
      if (subheadingEl && d.subheading) subheadingEl.textContent = d.subheading;

      // Collect image1, image2, image3... from the sheet
      const images = [];
      let i = 1;
      while (d[`image${i}`]) {
        images.push({ url: d[`image${i}`], alt: d[`alt${i}`] || 'Stardom Textiles' });
        i++;
      }

      const bgImg      = document.getElementById('heroImage');
      const bgCarousel = document.getElementById('heroBgCarousel');
      const dotsWrap   = document.getElementById('heroCarouselDots');

      if (images.length >= 2) {
        // Multi-image carousel
        if (bgImg)      bgImg.style.display      = 'none';
        if (bgCarousel) bgCarousel.style.display  = 'block';
        if (dotsWrap)   dotsWrap.style.display    = 'flex';

        bgCarousel.innerHTML = images.map((img, idx) =>
          `<div class="hc-slide${idx === 0 ? ' active' : ''}" style="background-image:url('${img.url}')" role="img" aria-label="${img.alt}"></div>`
        ).join('');
        dotsWrap.innerHTML = images.map((_, idx) =>
          `<button class="hc-dot${idx === 0 ? ' active' : ''}" data-i="${idx}" aria-label="Image ${idx + 1}"></button>`
        ).join('');

        const slides = bgCarousel.querySelectorAll('.hc-slide');
        const dots   = dotsWrap.querySelectorAll('.hc-dot');
        let cur = 0, hcT;

        function goBg(n) {
          slides[cur].classList.remove('active'); dots[cur].classList.remove('active');
          cur = (n + slides.length) % slides.length;
          slides[cur].classList.add('active'); dots[cur].classList.add('active');
        }
        function startBg() { hcT = setInterval(() => goBg(cur + 1), 5000); }
        function stopBg()  { clearInterval(hcT); }

        dots.forEach(d => d.addEventListener('click', () => { stopBg(); goBg(+d.dataset.i); startBg(); }));
        bgCarousel.addEventListener('mouseenter', stopBg);
        bgCarousel.addEventListener('mouseleave', startBg);
        startBg();

      } else if (images.length === 1) {
        // Single image
        if (bgImg) { bgImg.src = images[0].url; bgImg.style.display = 'block'; }
      }
    })
    .catch(err => console.warn('[Sheets CMS] hero tab:', err));
}

// ═══════════════════════════════════════════════════════
//  SOLUTIONS TAB loader
//  Sheet columns: title | image | badge | description | moq | buttonText | buttonLink
//
//  Example row:
//  School Uniforms | https://... | B2B | Premium sets | Min 50 pcs | Order Now |
//
//  Leave buttonLink empty → auto WhatsApp link
// ═══════════════════════════════════════════════════════

function loadSolutions() {
  fetch(sheetUrl('solutions'))
    .then(r => r.ok ? r.text() : Promise.reject('solutions sheet missing'))
    .then(text => {
      const all     = parseTable(text);
      const display = all.slice(0, 8);
      const grid    = document.getElementById('solutionsGrid');
      if (!grid) return;

      grid.innerHTML = display.map(sol => {
        const href    = (sol.buttonlink && sol.buttonlink !== '#') ? sol.buttonlink : SITE.waOrder(sol.title);
        const btnText = sol.buttontext || 'Order Now';
        return `
          <article class="sol-card" role="listitem" tabindex="0"
            onclick="window.open('${href}','_blank')"
            onkeypress="if(event.key==='Enter') window.open('${href}','_blank')"
            aria-label="${sol.title}">
            <div class="sol-img-wrap">
              <img src="${sol.image}" alt="${sol.title}" class="sol-img" loading="lazy" width="400" height="200">
            </div>
            <div class="sol-body">
              <span class="sol-tag">${sol.badge || 'Collection'}</span>
              <h3 class="sol-name">${sol.title}</h3>
              <span class="sol-order" aria-hidden="true">${btnText} →</span>
            </div>
          </article>`;
      }).join('');

      const row = document.getElementById('exploreMoreRow');
      if (row) row.style.display = all.length > 8 ? 'block' : 'none';
    })
    .catch(err => console.warn('[Sheets CMS] solutions tab:', err));
}

// ═══════════════════════════════════════════════════════
//  PRODUCTS TAB loader  (also feeds the carousel)
//  Sheet columns: name | image | category | description | buttonText | buttonLink
//
//  Example row:
//  School Uniform Set | https://... | Uniforms | Premium sets, min 50 pcs | Order via WhatsApp |
//
//  Leave buttonLink empty → auto WhatsApp link
// ═══════════════════════════════════════════════════════

function loadProducts() {
  const DEMO = [
    { name: 'School Uniform Set',  image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=900&q=75', category: 'Uniforms',   description: 'Premium school uniform sets — customisable sizing and colours. Minimum 50 pcs.' },
    { name: 'Sports Jersey Kit',   image: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=900&q=75', category: 'Sports Kit', description: 'Breathable drifit kits for football, cricket and kabaddi. Custom printing available.' },
    { name: 'Custom T-Shirt',      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=75', category: 'T-Shirts',   description: 'Round neck and polo tees in all sizes. Screen or digital print. Min. 12 pcs.' },
    { name: 'Track Suit',          image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=900&q=75', category: 'Track Suits',description: 'Comfortable track suits for school, corporate or personal use. Fleece and nylon.' }
  ];

  fetch(sheetUrl('products'))
    .then(r => r.ok ? r.text() : Promise.reject('products sheet missing'))
    .then(text => {
      const rows = parseTable(text);
      buildCarousel(rows.length ? rows : DEMO);
    })
    .catch(() => buildCarousel(DEMO));
}

// ─── Carousel builder (unchanged logic, now fed from Sheets) ───
function buildCarousel(products) {
  let idx = 0, total = products.length, timer = null;

  const track = document.getElementById('carouselTrack');
  const dots  = document.getElementById('cDots');
  if (!track || !dots) return;

  track.innerHTML = products.map((p, i) => {
    const waHref  = (p.buttonlink && p.buttonlink !== '#') ? p.buttonlink : SITE.waOrder(p.name);
    const btnText = p.buttontext || 'Order via WhatsApp';
    const cat     = p.category  || 'Collection';
    const num     = String(i + 1).padStart(2, '0');
    return `
      <article class="c-slide" role="listitem" aria-label="Product ${i + 1}: ${p.name}">
        <div class="c-slide-img">
          <img src="${p.image}" alt="${p.name}" loading="${i === 0 ? 'eager' : 'lazy'}" width="600" height="480">
          <div class="c-slide-img-overlay" aria-hidden="true"></div>
        </div>
        <div class="c-slide-body">
          <div class="c-slide-num" aria-hidden="true">${num}</div>
          <div class="c-slide-cat">${cat}</div>
          <h3 class="c-slide-name">${p.name}</h3>
          <p class="c-slide-desc">${p.description || 'Premium quality, bulk & retail.'}</p>
          <div class="c-slide-actions">
            <a href="${waHref}" class="btn btn-wa btn-sm" target="_blank" rel="noopener">${btnText}</a>
            <a href="explore_catalog.html" class="btn btn-ghost btn-sm">View Details</a>
          </div>
        </div>
      </article>`;
  }).join('');

  dots.innerHTML = products.map((_, i) =>
    `<button class="c-dot${i === 0 ? ' active' : ''}" data-i="${i}" role="tab" aria-label="Slide ${i + 1}" aria-selected="${i === 0}"></button>`
  ).join('');

  function go(n) {
    idx = (n + total) % total;
    track.style.transform = `translateX(-${idx * 100}%)`;
    document.querySelectorAll('.c-dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
      d.setAttribute('aria-selected', String(i === idx));
    });
    const pct  = ((idx + 1) / total) * 100;
    const fill = document.getElementById('cProgressFill');
    const bar  = document.getElementById('cProgressBar');
    if (fill) fill.style.width = pct + '%';
    if (bar)  bar.setAttribute('aria-valuenow', Math.round(pct));
  }
  function start() { stop(); timer = setInterval(() => go(idx + 1), 5500); }
  function stop()  { clearInterval(timer); }

  dots.querySelectorAll('.c-dot').forEach(d => d.addEventListener('click', () => { stop(); go(+d.dataset.i); start(); }));

  const prev = document.getElementById('cPrev');
  const next = document.getElementById('cNext');
  if (prev) prev.addEventListener('click', () => { stop(); go(idx - 1); start(); });
  if (next) next.addEventListener('click', () => { stop(); go(idx + 1); start(); });

  const wrap = document.getElementById('carouselWrap');
  if (wrap) {
    wrap.addEventListener('mouseenter', stop);
    wrap.addEventListener('mouseleave', start);
    wrap.addEventListener('focusin',  stop);
    wrap.addEventListener('focusout', start);
    let tx = 0;
    wrap.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchend',   e => {
      const diff = tx - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 44) { stop(); go(idx + (diff > 0 ? 1 : -1)); start(); }
    }, { passive: true });
  }

  go(0); start();
}

// ═══════════════════════════════════════════════════════
//  BOOT — load all tabs
// ═══════════════════════════════════════════════════════

if (SHEET_ID === 'YOUR_SHEET_ID_HERE') {
  console.warn('[Sheets CMS] ⚠️  SHEET_ID not set in public/js/sheets-cms.js — using site defaults.');
} else {
  loadContact();
  setTimeout(() => {
    loadHero();
    loadTicker();
    loadSolutions();
    loadProducts();
  }, 50);
}