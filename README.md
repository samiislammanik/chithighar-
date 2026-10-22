# Chithighor (চিঠিঘর) — “কিছু কথা চিঠিতেই সুন্দর”

A full-stack, emotional, and authentic web application inspired by the intimate, nostalgic letter-writing tradition of Bengal. Users can write digital anonymous letters, explore public community reflections, react with gentle emotions, and order physical wax-sealed keepsake letters delivered across all 64 districts of Bangladesh.

---

## 🌟 Key Features

1. **Digital Letter Studio**:
   - Write heartfelt letters with Bengali Unicode support and English support.
   - Choose from 6 authentic paper stationery styles (*Vintage Parchment, Cream Linen, Rose Petal, Midnight Sky, Classic Kraft, Tear Stained*).
   - 4 literary and calligraphic font styles (*Noto Serif Bengali, Hind Siliguri, Kalam Handwriting, Playfair Display*).
   - 5 wax seal insignia choices (*Heart, Rose, Free Bird, Anchor, Monogram*) in authentic wax colors (*Burgundy, Forest Green, Terracotta, Navy, Golden Sand*).
   - Vintage Bangladeshi postage stamps (*Dhaka GPO 1971, The Post Runner, Water Lily, Royal Bengal Tiger, Sreemangal Tea*).
   - Complete anonymity mode: public identity is masked as "অচেনা লেখক / Anonymous Writer" while keeping internal security association for abuse prevention.

2. **Tactile Envelope Opening Ceremony**:
   - Interactive 3D envelope with postal postmark cancellation seal.
   - Click to break the wax seal with synthesized audio pop and flap opening animation.
   - Stationery paper unfolding effect.

3. **Public Community Feed & Discovery**:
   - Filter by categories: *প্রেম ও ভালোবাসা (Love), বন্ধুত্ব (Friendship), পরিবার (Family), ক্ষমা ও অনুশোচনা (Apology), পুরোনো স্মৃতি (Memories), অনুপ্রেরণা (Motivation), না-বলা চিঠি (Unsent Letters), সাধারণ ভাবনা (Musings)*.
   - Search by keyword, title, or recipient.
   - Sort by latest, popular, or unsent reflections.

4. **Reactions, Comments & Bookmarks**:
   - Emotional reaction bar: ❤️ ভালোবাসা, 🫂 পাশে আছি, 🥀 স্মৃতি, 🕊️ শান্তি, 💧 চোখের জল.
   - Warm comments section with optional anonymous replying.
   - Private bookmarks saved to personal letterbox.

5. **Physical Letter Delivery Across 64 Districts of Bangladesh**:
   - 3 Curated postal tiers:
     - **সাধারণ ডাকচিঠি (Standard Postal Mail)** — ৳120 BDT
     - **হাতে লেখা ভিন্টেজ চিঠি (Wax Seal Edition)** — ৳280 BDT
     - **রয়াল স্মৃতি ডাকবাক্স (Deluxe Keepsake Box)** — ৳590 BDT
   - Private checkout form with all 64 districts of Bangladesh.
   - Automated Tracking Number generation (`CG-XXXXXXBD`).
   - Order tracking progression: *Pending → Confirmed → Processing → Dispatched → Delivered*.
   - Payment interface for bKash, Nagad, Rocket, or Card with manual/sandbox verification.

6. **Admin Desk & Safety**:
   - Verified administrative authorization for `manikmia2049@gmail.com`.
   - Moderation queue for handling reported content and hiding abusive letters.
   - Order dispatch manager to update courier tracking notes and status.

7. **Bilingual Experience**:
   - Seamless toggle between Bengali (বাংলা) and English (EN).

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Icons & Animation**: Lucide React, Canvas Confetti
- **Audio**: Web Audio API synthesized tactile sounds (paper rustle, wax seal crack, postmark stamp)
- **Database & Auth**: Cloud Firestore, Firebase Authentication
- **Security**: Hardened Firestore rules with zero-trust validation and PII isolation

---

## ⚙️ Setup & Deployment Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Firebase Configuration**:
   The application automatically reads configuration from `firebase-applet-config.json` containing:
   - `projectId`
   - `appId`
   - `apiKey`
   - `authDomain`
   - `firestoreDatabaseId`

3. **Deploy Security Rules**:
   Ensure `firestore.rules` is deployed using the deployment tool:
   ```bash
   # Automatically deployed via AI Studio fax.DeployRules
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Production Build**:
   ```bash
   npm run build
   ```

---

## 📋 Integration Status Checklist

- [x] Firebase Authentication (Google Sign-In with popup & guest demo fallback)
- [x] Cloud Firestore database integration with explicit database instance ID
- [x] Hardened `firestore.rules` protecting PII and anonymous author mapping
- [x] Bilingual Bangla / English dictionary and switcher
- [x] Letter customization (Paper textures, fonts, wax seals, stamps)
- [x] Envelope opening ceremony with Web Audio API sound synthesis
- [x] Community feed, search, sorting, and category filters
- [x] Physical delivery order flow for all 64 districts of Bangladesh
- [x] Postal order tracking with visual progression timeline
- [x] Admin desk with moderation queue and courier fulfillment status updates
- [ ] Real-time payment gateway webhook integration (e.g., bKash merchant API / SSLCommerz gateway credentials required for live card charges).
