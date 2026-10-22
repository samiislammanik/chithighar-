import {
  StationeryTemplate,
  EnvelopeColor,
  PaperStyle,
  TemplatePurchase,
  UserTemplateAccess,
  AppSettings,
  PaymentMethod,
  PurchaseStatus,
} from '../types';
import { db } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';

export interface EnvelopeDesignConfig {
  id: EnvelopeColor;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  isFree: boolean;
  priceBdt: number;
  badge?: 'featured' | 'new' | 'popular' | 'none';
  bgClass: string;
  borderColor: string;
  flapBorderColor: string;
  innerBgColor: string;
  accentTextColor: string;
  subTextColor: string;
  badgeBg: string;
  ornamentStyle: 'classic' | 'gold_filigree' | 'floral' | 'minimal' | 'botanical' | 'vintage';
  previewGradient: string;
}

export type PaperOrnamentStyle =
  | 'vintage_rose_bouquet'
  | 'torn_deckle_edge'
  | 'botanical_fern'
  | 'classic_gold_filigree'
  | 'monarch_butterfly'
  | 'romantic_lace_hearts'
  | 'newspaper_chronicle'
  | 'minimal_sepia_corner'
  | 'pressed_lavender'
  | 'heritage_postmark'
  | 'celestial_moon_stars'
  | 'victorian_gold_leaf'
  | 'rose_envelope_collage'
  | 'crimson_velvet_vines'
  | 'ancient_cartography_compass';

export interface PaperDesignConfig {
  id: PaperStyle;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  category: string;
  isFree: boolean;
  priceBdt: number;
  badge?: 'featured' | 'new' | 'popular' | 'none';
  bgClass: string;
  textClass: string;
  borderClass: string;
  innerFrameBorder: string;
  watermarkColor: string;
  cornerOrnament: PaperOrnamentStyle;
  ruledLines: boolean;
  lineColor?: string;
  previewGradient: string;
  textureDetails: string;
}

// 10 Distinct Premium Envelope Templates
export const ENVELOPE_TEMPLATES: EnvelopeDesignConfig[] = [
  {
    id: 'classic-ivory',
    name: 'Classic Ivory',
    nameBn: 'ক্লাসিক আইভরি',
    description: 'Timeless luxury stationery with embossed creamy ivory warmth',
    descriptionBn: 'অনবদ্য আভিজাত্য ও স্নিগ্ধ আইভরি শুভ্রতা',
    isFree: true,
    priceBdt: 0,
    badge: 'popular',
    bgClass: 'bg-[#F7F3E9] text-stone-800 border-[#D8CEBA]',
    borderColor: '#D8CEBA',
    flapBorderColor: 'border-t-[#E6DBC6]',
    innerBgColor: '#EDE5D4',
    accentTextColor: 'text-stone-800',
    subTextColor: 'text-stone-600',
    badgeBg: 'bg-stone-200/80 text-stone-800',
    ornamentStyle: 'classic',
    previewGradient: 'from-[#FAF7F0] via-[#F4EDE0] to-[#E9DEC9]',
  },
  {
    id: 'burgundy-velvet',
    name: 'Burgundy Velvet',
    nameBn: 'বারগান্ডি ভেলভেট',
    description: 'Deep burgundy royal shade with rich gold postal details',
    descriptionBn: 'গভীর লাল বারগান্ডি ও সোনালি ডাক মোহরের রাজকীয় মেলবন্ধন',
    isFree: true,
    priceBdt: 0,
    badge: 'featured',
    bgClass: 'bg-[#5B1622] text-amber-50 border-[#822435]',
    borderColor: '#822435',
    flapBorderColor: 'border-t-[#46101A]',
    innerBgColor: '#380B13',
    accentTextColor: 'text-amber-100',
    subTextColor: 'text-amber-200/80',
    badgeBg: 'bg-amber-400/20 text-amber-200',
    ornamentStyle: 'gold_filigree',
    previewGradient: 'from-[#6D1B2A] via-[#541420] to-[#3B0C15]',
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    nameBn: 'মিডনাইট ব্লু',
    description: 'Navy blue depths with celestial silver and refined accents',
    descriptionBn: 'গভীর নীল নিশীথের সৌন্দর্য ও মার্জিত রৌপ্য অলংকরণ',
    isFree: false,
    priceBdt: 25,
    badge: 'new',
    bgClass: 'bg-[#14233C] text-sky-50 border-[#223961]',
    borderColor: '#223961',
    flapBorderColor: 'border-t-[#0D1829]',
    innerBgColor: '#0A1220',
    accentTextColor: 'text-sky-100',
    subTextColor: 'text-sky-200/80',
    badgeBg: 'bg-sky-400/20 text-sky-200',
    ornamentStyle: 'gold_filigree',
    previewGradient: 'from-[#1A2D4C] via-[#122036] to-[#0A1220]',
  },
  {
    id: 'vintage-letter',
    name: 'Vintage Letter',
    nameBn: 'ভিন্টেজ লেটার',
    description: 'Aged antique kraft paper styling with historical postal authenticity',
    descriptionBn: 'শতবর্ষী পুরোনো চিঠির বাদামি ক্রাফট ও ডাকঘরের ঐতিহ্য',
    isFree: true,
    priceBdt: 0,
    badge: 'popular',
    bgClass: 'bg-[#8F6A42] text-amber-50 border-[#A67E51]',
    borderColor: '#A67E51',
    flapBorderColor: 'border-t-[#6E4F2E]',
    innerBgColor: '#52391F',
    accentTextColor: 'text-amber-100',
    subTextColor: 'text-amber-200/80',
    badgeBg: 'bg-amber-900/30 text-amber-100',
    ornamentStyle: 'vintage',
    previewGradient: 'from-[#9C754A] via-[#856037] to-[#634524]',
  },
  {
    id: 'rose-garden',
    name: 'Rose Garden',
    nameBn: 'রোজ গার্ডেন',
    description: 'Delicate floral blush with soft crimson petals and romantic embossing',
    descriptionBn: 'গোলাপের পাপড়ি ছোঁয়া রোমান্টিক খাম ও কোমল শোভা',
    isFree: false,
    priceBdt: 20,
    badge: 'featured',
    bgClass: 'bg-[#7A2B3D] text-rose-50 border-[#9B3A4F]',
    borderColor: '#9B3A4F',
    flapBorderColor: 'border-t-[#5F1F2E]',
    innerBgColor: '#4A1622',
    accentTextColor: 'text-rose-100',
    subTextColor: 'text-rose-200/80',
    badgeBg: 'bg-rose-400/20 text-rose-200',
    ornamentStyle: 'floral',
    previewGradient: 'from-[#8C3347] via-[#6F2536] to-[#4F1824]',
  },
  {
    id: 'minimal-modern',
    name: 'Minimal Modern',
    nameBn: 'মিনিমাল মডার্ন',
    description: 'Clean architectural slate with subtle debossed borders and crisp lines',
    descriptionBn: 'আধুনিক রুচিশীল পরিমিতিবোধ ও শান্ত মসৃণ রূপ',
    isFree: true,
    priceBdt: 0,
    badge: 'none',
    bgClass: 'bg-[#2E3338] text-stone-100 border-[#434A52]',
    borderColor: '#434A52',
    flapBorderColor: 'border-t-[#22262A]',
    innerBgColor: '#1A1C1F',
    accentTextColor: 'text-stone-100',
    subTextColor: 'text-stone-300',
    badgeBg: 'bg-stone-500/20 text-stone-200',
    ornamentStyle: 'minimal',
    previewGradient: 'from-[#3A4047] via-[#2A2E33] to-[#1C1E21]',
  },
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    nameBn: 'রয়্যাল গোল্ড',
    description: 'Premium golden ornamental borders with rich gilded opulence',
    descriptionBn: 'জরির কাজ করা রাজকীয় সোনালি ফ্রেম ও আভিজাত্য',
    isFree: false,
    priceBdt: 35,
    badge: 'featured',
    bgClass: 'bg-[#7E5E21] text-amber-50 border-[#A67E33]',
    borderColor: '#A67E33',
    flapBorderColor: 'border-t-[#634816]',
    innerBgColor: '#47330C',
    accentTextColor: 'text-amber-100',
    subTextColor: 'text-amber-200/90',
    badgeBg: 'bg-amber-300/30 text-amber-100',
    ornamentStyle: 'gold_filigree',
    previewGradient: 'from-[#947029] via-[#75551A] to-[#4F390F]',
  },
  {
    id: 'botanical-green',
    name: 'Botanical Green',
    nameBn: 'বোটানিক্যাল গ্রিন',
    description: 'Subtle botanical foliage, forest sage hues, and organic calmness',
    descriptionBn: 'সবুজ অরণ্য ও লতাপাতার শান্ত স্নিগ্ধ নৈসর্গিক রূপ',
    isFree: true,
    priceBdt: 0,
    badge: 'none',
    bgClass: 'bg-[#1C3D2B] text-emerald-50 border-[#2D5A40]',
    borderColor: '#2D5A40',
    flapBorderColor: 'border-t-[#142E20]',
    innerBgColor: '#0E2117',
    accentTextColor: 'text-emerald-100',
    subTextColor: 'text-emerald-200/80',
    badgeBg: 'bg-emerald-400/20 text-emerald-200',
    ornamentStyle: 'botanical',
    previewGradient: 'from-[#254F38] via-[#1A3A28] to-[#10241A]',
  },
  {
    id: 'romantic-blush',
    name: 'Romantic Blush',
    nameBn: 'রোমান্টিক ব্লাশ',
    description: 'Soft pink elegance with champagne undertones and gentle grace',
    descriptionBn: 'স্নিগ্ধ গোলাপি ও শ্যাম্পেন আভার মিষ্টি রোমান্টিক খাম',
    isFree: false,
    priceBdt: 20,
    badge: 'new',
    bgClass: 'bg-[#9C4B5E] text-rose-50 border-[#BA6075]',
    borderColor: '#BA6075',
    flapBorderColor: 'border-t-[#7A3646]',
    innerBgColor: '#5C2533',
    accentTextColor: 'text-rose-100',
    subTextColor: 'text-rose-200/90',
    badgeBg: 'bg-rose-300/30 text-rose-100',
    ornamentStyle: 'floral',
    previewGradient: 'from-[#AB556A] via-[#8C3F51] to-[#612735]',
  },
  {
    id: 'midnight-romance',
    name: 'Midnight Romance',
    nameBn: 'মিডনাইট রোমান্স',
    description: 'Dark romantic stationery with obsidian silk and deep crimson touches',
    descriptionBn: 'কালো রেশম ও গভীর লালের মোহময় নিশীথ রোমান্স',
    isFree: false,
    priceBdt: 30,
    badge: 'featured',
    bgClass: 'bg-[#1B1417] text-rose-100 border-[#3D252D]',
    borderColor: '#3D252D',
    flapBorderColor: 'border-t-[#120C0E]',
    innerBgColor: '#0A0608',
    accentTextColor: 'text-rose-200',
    subTextColor: 'text-rose-300/70',
    badgeBg: 'bg-rose-950/60 text-rose-300',
    ornamentStyle: 'gold_filigree',
    previewGradient: 'from-[#291C22] via-[#1B1216] to-[#0D080A]',
  },
];

// EXACTLY 15 DISTINCT VINTAGE LETTER PAPER DESIGNS
// (10 Free designs + 5 Premium designs)
export const PAPER_TEMPLATES: PaperDesignConfig[] = [
  // --- 10 FREE DESIGNS (৳0) ---
  {
    id: 'antique-rose-parchment',
    name: 'Antique Rose Parchment',
    nameBn: 'ভিন্টেজ পার্চমেন্ট ও গোলাপ',
    description: 'Tea-stained aged parchment with delicate antique rose bouquets, deckle hairline borders, and warm sepia tones',
    descriptionBn: 'চা-রং মাখা শতবর্ষী পার্চমেন্ট, চারকোণে শুকনো লাল গোলাপ ও স্নিগ্ধ সেপিয়া আভা',
    category: 'vintage_floral',
    isFree: true,
    priceBdt: 0,
    badge: 'popular',
    bgClass: 'bg-[#FAF4E8]',
    textClass: 'text-[#362417]',
    borderClass: 'border-[#CBB494]',
    innerFrameBorder: 'border-[#BFA481]/50',
    watermarkColor: 'text-[#8A6341]/10',
    cornerOrnament: 'vintage_rose_bouquet',
    ruledLines: false,
    previewGradient: 'from-[#FDF8EE] via-[#F6ECE0] to-[#EBDCC8]',
    textureDetails: 'Tea-stained parchment patina with botanical rose vignettes',
  },
  {
    id: 'torn-deckle-kraft',
    name: 'Torn Deckle Kraft',
    nameBn: 'ছেঁড়া প্রান্তের ক্রাফট পাতা',
    description: 'Handmade raw fiber paper with deckle torn edges, postal cancel marks, and vintage ink ruled writing lines',
    descriptionBn: 'ছেঁড়া অসম প্রান্তের খাঁটি ক্রাফট পেপার, পুরোনো ডাকঘরের সিলমোহর ও দাগটানা পাতা',
    category: 'vintage_aged',
    isFree: true,
    priceBdt: 0,
    badge: 'popular',
    bgClass: 'bg-[#EFE5D3]',
    textClass: 'text-[#382618]',
    borderClass: 'border-[#BD9F7B]',
    innerFrameBorder: 'border-[#9F7B54]/40',
    watermarkColor: 'text-[#4A321D]/10',
    cornerOrnament: 'torn_deckle_edge',
    ruledLines: true,
    lineColor: 'rgba(110, 75, 45, 0.08)',
    previewGradient: 'from-[#F5EDDD] via-[#E8DCBF] to-[#D5C29F]',
    textureDetails: 'Torn rough edges with postal cancellations and ink rules',
  },
  {
    id: 'botanical-dried-fern',
    name: 'Dried Botanical Herbarium',
    nameBn: 'শুকনো ফার্ন ও বোটানিক্যাল পাতা',
    description: 'Pressed sage herbarium specimens, dried fern fronds, specimen framing, and natural cream linen texture',
    descriptionBn: 'শুকনো বোটানিক্যাল ফার্ন, ভেষজ পাতার আলতো ছায়া ও নরম লিনেন ক্যানভাস',
    category: 'botanical',
    isFree: true,
    priceBdt: 0,
    badge: 'none',
    bgClass: 'bg-[#F4F6F0]',
    textClass: 'text-[#1F2C22]',
    borderClass: 'border-[#B8CAB5]',
    innerFrameBorder: 'border-[#9FB89A]/45',
    watermarkColor: 'text-[#2C4A32]/10',
    cornerOrnament: 'botanical_fern',
    ruledLines: false,
    previewGradient: 'from-[#F8FAF5] via-[#EBF0E6] to-[#D9E3D4]',
    textureDetails: 'Herbarium pressed fern leaves and botanical border framing',
  },
  {
    id: 'classic-ivory-deckle',
    name: 'Classic Ivory Deckle',
    nameBn: 'অভিজাত আইভরি ও জরি ফ্রেম',
    description: 'Smooth luxury heavy ivory sheet with refined gold filigree corners and expansive writing area for long letters',
    descriptionBn: 'উচ্চমানের মসৃণ আইভরি পাতা, সোনালি সূক্ষ্ম জরি কোণ ও দীর্ঘ চিঠি লেখার প্রশস্ত আয়তন',
    category: 'classic',
    isFree: true,
    priceBdt: 0,
    badge: 'popular',
    bgClass: 'bg-[#FCF9F2]',
    textClass: 'text-[#2D231C]',
    borderClass: 'border-[#D9CDBC]',
    innerFrameBorder: 'border-[#CFC0AC]/50',
    watermarkColor: 'text-[#614935]/8',
    cornerOrnament: 'classic_gold_filigree',
    ruledLines: false,
    previewGradient: 'from-[#FDFBF7] via-[#F8F3E9] to-[#ECE1D0]',
    textureDetails: 'Classic warm ivory deckle paper with corner filigree',
  },
  {
    id: 'monarch-butterfly-sepia',
    name: 'Vintage Butterfly & Script',
    nameBn: 'প্রজাপতি ও পুরোনো হস্তাক্ষর',
    description: 'Engraved sepia monarch butterfly illustration, faint historical cursive manuscript watermark, and bronze borders',
    descriptionBn: 'কোণে আঁকা সেপিয়া প্রজাপতি, হালকা পুরোনো হস্তাক্ষরের জলছাপ ও ব্রোঞ্জ সীমানা',
    category: 'vintage_script',
    isFree: true,
    priceBdt: 0,
    badge: 'featured',
    bgClass: 'bg-[#F7F1E5]',
    textClass: 'text-[#332216]',
    borderClass: 'border-[#CCA885]',
    innerFrameBorder: 'border-[#B38C66]/40',
    watermarkColor: 'text-[#5C3F26]/10',
    cornerOrnament: 'monarch_butterfly',
    ruledLines: false,
    previewGradient: 'from-[#FAF5EC] via-[#F0E6D2] to-[#E3D3B9]',
    textureDetails: 'Antique butterfly etching with faded cursive background',
  },
  {
    id: 'romantic-hearts-lace',
    name: 'Romantic Hearts & Lace',
    nameBn: 'রোমান্টিক লেইস ও হৃদয়ের ছোঁয়া',
    description: 'Muted dusty rose tinted paper framed with delicate Victorian lace filigree and intertwined heart motifs',
    descriptionBn: 'কোমল গোলাপি-ধূসর পাতা, ভিক্টোরিয়ান সূক্ষ্ম লেইস ও হৃদয়ের রোমান্টিক নকশা',
    category: 'romantic',
    isFree: true,
    priceBdt: 0,
    badge: 'none',
    bgClass: 'bg-[#FFF5F6]',
    textClass: 'text-[#3D1E25]',
    borderClass: 'border-[#E8B8C2]',
    innerFrameBorder: 'border-[#DDA0AD]/40',
    watermarkColor: 'text-[#872D43]/10',
    cornerOrnament: 'romantic_lace_hearts',
    ruledLines: false,
    previewGradient: 'from-[#FFF7F8] via-[#FAEBEE] to-[#EFCED5]',
    textureDetails: 'Soft Victorian lace borders with intertwined heart watermark',
  },
  {
    id: 'newspaper-chronicle-antique',
    name: 'Antique Chronicle Paper',
    nameBn: 'শতবর্ষী সংবাদপত্র ও চিঠির ক্যানভাস',
    description: 'Historic vintage Bengal gazette clipping on side margin, antique ink ruling, and warm sepia body',
    descriptionBn: 'বাম পাশে শতবর্ষী পুরোনো সংবাদপত্রের ছাপচিত্র, নস্টালজিক বাদামি দাগটানা চিঠির পাতা',
    category: 'vintage_aged',
    isFree: true,
    priceBdt: 0,
    badge: 'none',
    bgClass: 'bg-[#F2ECE0]',
    textClass: 'text-[#2C2118]',
    borderClass: 'border-[#C4B39B]',
    innerFrameBorder: 'border-[#A89377]/40',
    watermarkColor: 'text-[#4A3828]/10',
    cornerOrnament: 'newspaper_chronicle',
    ruledLines: true,
    lineColor: 'rgba(90, 70, 50, 0.08)',
    previewGradient: 'from-[#F6F1E8] via-[#ECE1D0] to-[#DDD0BB]',
    textureDetails: 'Antique newspaper column texture with sepia letter ruling',
  },
  {
    id: 'minimal-sepia-frame',
    name: 'Minimalist Sepia Frame',
    nameBn: 'পরিমিত শেপিয়া ফ্রেম',
    description: 'Clean aged warm ivory paper with a balanced double sepia border, fine corner dots, and effortless readability',
    descriptionBn: 'পরিমিত আভিজাত্য, দ্বৈত সেপিয়া বর্ডার ও চোখের জন্য পরম আরামদায়ক স্বচ্ছতা',
    category: 'minimal',
    isFree: true,
    priceBdt: 0,
    badge: 'none',
    bgClass: 'bg-[#FBF8F1]',
    textClass: 'text-[#2B231D]',
    borderClass: 'border-[#D2C5B2]',
    innerFrameBorder: 'border-[#C2B29C]/40',
    watermarkColor: 'text-[#443528]/8',
    cornerOrnament: 'minimal_sepia_corner',
    ruledLines: false,
    previewGradient: 'from-[#FCFAF5] via-[#F4EFE5] to-[#E7DEC8]',
    textureDetails: 'Double hairline sepia framing on pristine natural cream',
  },
  {
    id: 'pressed-lavender-field',
    name: 'Pressed Lavender Field',
    nameBn: 'শুকনো ল্যাভেন্ডার ও পত্রশোভা',
    description: 'Pressed dried lavender flowers on bottom margin, soothing dusty mauve-sand hue, and nostalgic calmness',
    descriptionBn: 'নিচে আলতো ফুটে থাকা শুকনো ল্যাভেন্ডার মঞ্জরী ও শান্ত স্নিগ্ধ আভা',
    category: 'botanical',
    isFree: true,
    priceBdt: 0,
    badge: 'none',
    bgClass: 'bg-[#F8F5F7]',
    textClass: 'text-[#2E202B]',
    borderClass: 'border-[#D4C3D1]',
    innerFrameBorder: 'border-[#BEA6BA]/40',
    watermarkColor: 'text-[#5E3857]/10',
    cornerOrnament: 'pressed_lavender',
    ruledLines: false,
    previewGradient: 'from-[#FAF7F9] via-[#EFE7EE] to-[#E0D0DE]',
    textureDetails: 'Pressed dried lavender illustrations on soft botanical paper',
  },
  {
    id: 'heritage-postmaster-ruled',
    name: 'Heritage Postmaster Ruled',
    nameBn: 'ঐতিহ্যবাহী পোস্টমাস্টার পাতা',
    description: 'Classic British-Bengal post office airmail styling, vintage runner stamp header, and fine airmail ruling',
    descriptionBn: 'ঐতিহাসিক ডাক হরকরা সিলমোহর, এয়ারমেইল ডাকটিকিট ও নীলচে-বাদামি রুল্ড পেপার',
    category: 'heritage',
    isFree: true,
    priceBdt: 0,
    badge: 'popular',
    bgClass: 'bg-[#F5F1E7]',
    textClass: 'text-[#261E17]',
    borderClass: 'border-[#C8BAA6]',
    innerFrameBorder: 'border-[#AE9C84]/40',
    watermarkColor: 'text-[#3E2E20]/10',
    cornerOrnament: 'heritage_postmark',
    ruledLines: true,
    lineColor: 'rgba(55, 65, 80, 0.08)',
    previewGradient: 'from-[#F8F5EE] via-[#EDE7DA] to-[#DFD5C3]',
    textureDetails: 'Postal airmail border marks with postal runner watermark',
  },

  // --- 5 PREMIUM DESIGNS (৳20 Default, Locked until verified purchase) ---
  {
    id: 'celestial-moonlit-night',
    name: 'Starry Midnight & Moonlit Serenade',
    nameBn: 'নিশীথ চন্দ্র ও তারকারাজি',
    description: 'Deep celestial midnight twilight with golden crescent moon, star constellations, and radiant silver-gold text',
    descriptionBn: 'তারার রাতে লেখা চিঠির গভীর নিশীথ আকাশ, একফালি সোনালি চাঁদ ও নক্ষত্রের আলোকছটা',
    category: 'celestial',
    isFree: false,
    priceBdt: 20,
    badge: 'featured',
    bgClass: 'bg-[#101726]',
    textClass: 'text-[#EBF1FA]',
    borderClass: 'border-[#364966]',
    innerFrameBorder: 'border-[#C6A24D]/50',
    watermarkColor: 'text-[#E5B84B]/15',
    cornerOrnament: 'celestial_moon_stars',
    ruledLines: false,
    previewGradient: 'from-[#19243C] via-[#101726] to-[#0A0E18]',
    textureDetails: 'Luminous crescent moon, starlight constellations, and twilight horizon',
  },
  {
    id: 'victorian-royal-gold',
    name: 'Victorian Gilded Gold Leaf',
    nameBn: 'ভিক্টোরিয়ান রাজকীয় স্বর্ণখচিত ফ্রেম',
    description: 'Baroque gold leaf ornamental borders, ornate royal corner arabesques, and heavy embossed parchment canvas',
    descriptionBn: 'খাঁটি স্বর্ণালী জরির কাজের নকশাঘেরা বারোক ফ্রেম ও রাজকীয় আভিজাত্যের পার্চমেন্ট',
    category: 'royal',
    isFree: false,
    priceBdt: 20,
    badge: 'featured',
    bgClass: 'bg-[#FAF6EE]',
    textClass: 'text-[#291F14]',
    borderClass: 'border-[#B88A38]',
    innerFrameBorder: 'border-[#D4AF37]/50',
    watermarkColor: 'text-[#B88A38]/12',
    cornerOrnament: 'victorian_gold_leaf',
    ruledLines: false,
    previewGradient: 'from-[#FFFDF8] via-[#F8F1DF] to-[#E9D9B7]',
    textureDetails: 'Opulent gilded 24K gold foil borders and royal corner cartouches',
  },
  {
    id: 'vintage-rose-envelope-collage',
    name: 'Rose & Old Letter Collage',
    nameBn: 'শুকনো গোলাপ ও পুরোনো খামের কোলাজ',
    description: 'Antique collage of canceled envelopes, dried red roses, wax seal impression, and historical cursive calligraphy',
    descriptionBn: 'শুকনো রক্তগোলাপের পাপড়ি, পুরোনো খামের কোলাজ ও লাল গালা সিলের অনুপম শৈল্পিক বিন্যাস',
    category: 'vintage_collage',
    isFree: false,
    priceBdt: 20,
    badge: 'popular',
    bgClass: 'bg-[#F7EFE4]',
    textClass: 'text-[#35201A]',
    borderClass: 'border-[#C49B80]',
    innerFrameBorder: 'border-[#A87254]/45',
    watermarkColor: 'text-[#872C2B]/12',
    cornerOrnament: 'rose_envelope_collage',
    ruledLines: false,
    previewGradient: 'from-[#FDF7EE] via-[#F3E7D6] to-[#E4CEB6]',
    textureDetails: 'Artistic vintage envelope scrap collage with dried crimson roses',
  },
  {
    id: 'romantic-crimson-velvet',
    name: 'Burgundy Velvet & Golden Vines',
    nameBn: 'বারগান্ডি ভেলভেট ও স্বর্ণলতা',
    description: 'Deep royal wine burgundy borders intertwined with gilded ivy vines, romantic rose crests, and warm ivory center',
    descriptionBn: 'গভীর বারগান্ডি সুরম্য পাড়, পেঁচানো সোনালি লতাপাতা ও রাজকীয় গোলাপের প্রতীক',
    category: 'romantic',
    isFree: false,
    priceBdt: 20,
    badge: 'new',
    bgClass: 'bg-[#FAF4EC]',
    textClass: 'text-[#2C181E]',
    borderClass: 'border-[#6F1B2A]',
    innerFrameBorder: 'border-[#C29B38]/50',
    watermarkColor: 'text-[#6F1B2A]/10',
    cornerOrnament: 'crimson_velvet_vines',
    ruledLines: false,
    previewGradient: 'from-[#FCF7F0] via-[#F4E8DF] to-[#E4C9BE]',
    textureDetails: 'Deep wine burgundy velvet margins intertwined with gilded ivy vines',
  },
  {
    id: 'ancient-cartography-map',
    name: 'Ancient Cartography & Riverways',
    nameBn: 'প্রাচীন মানচিত্র ও নদীমাতৃক বাংলার চিঠি',
    description: 'Aged maritime nautical chart framing, antique brass compass rose medallion, and historical waterway textures',
    descriptionBn: 'নদীমাতৃক বাংলার প্রাচীন মানচিত্র, ব্রাস কম্পাস রোজ ও পরিব্রাজকের রোমাঞ্চকর চিঠি',
    category: 'heritage',
    isFree: false,
    priceBdt: 20,
    badge: 'new',
    bgClass: 'bg-[#F2EADB]',
    textClass: 'text-[#2A2016]',
    borderClass: 'border-[#B49E7C]',
    innerFrameBorder: 'border-[#99815F]/45',
    watermarkColor: 'text-[#5E472C]/10',
    cornerOrnament: 'ancient_cartography_compass',
    ruledLines: false,
    previewGradient: 'from-[#F6F0E4] via-[#EADBCA] to-[#D5C2A8]',
    textureDetails: 'Historical cartographic river charts with brass compass engraving',
  },
];

// Default System-wide Application Settings
export const DEFAULT_APP_SETTINGS: AppSettings = {
  id: 'general',
  bkashMerchantNumber: '01700-112233',
  nagadMerchantNumber: '01800-445566',
  paymentInstructionsBn:
    'বিকাশ বা নগদ অ্যাপ থেকে "Send Money" বা "Payment" করুন। রেফারেন্স ঘরে আপনার অর্ডার আইডি লিখুন। লেনদেন সম্পন্ন হলে SMS থেকে পাওয়া Transaction ID (TrxID) নিচে লিখে জমা দিন। অ্যাডমিন যাচাই শেষে আপনার চিঠিটি অবিলম্বে আনলক করা হবে।',
  paymentInstructionsEn:
    'Use bKash or Nagad to Send Money/Payment to the merchant number above. Enter your Order ID in the reference. After completing, paste your Transaction ID (TrxID) below to submit for administrative verification.',
  supportContact: 'support@chithighor.com | হেল্পলাইন: 01700-112233',
  defaultPremiumPriceBdt: 20,
  isMaintenanceMode: false,
};

// Normalizers for Envelope and Paper IDs
export function normalizeEnvelopeId(color?: string | null): EnvelopeColor {
  if (!color) return 'classic-ivory';
  const match = ENVELOPE_TEMPLATES.find((e) => e.id === color);
  if (match) return match.id;

  switch (color) {
    case 'burgundy':
      return 'burgundy-velvet';
    case 'forest-green':
      return 'botanical-green';
    case 'terracotta':
      return 'vintage-letter';
    case 'navy':
      return 'midnight-blue';
    case 'gold-sand':
      return 'royal-gold';
    default:
      return 'classic-ivory';
  }
}

export function normalizePaperId(style?: string | null): PaperStyle {
  if (!style) return 'antique-rose-parchment';
  const match = PAPER_TEMPLATES.find((p) => p.id === style);
  if (match) return match.id;

  // Backward-compatibility mappings from previous iterations
  switch (style) {
    case 'classic-ivory-paper':
    case 'cream-linen':
      return 'classic-ivory-deckle';
    case 'vintage-aged-paper':
    case 'vintage-parchment':
      return 'antique-rose-parchment';
    case 'burgundy-border':
      return 'romantic-crimson-velvet';
    case 'royal-gold-frame':
      return 'victorian-royal-gold';
    case 'minimal-white':
      return 'minimal-sepia-frame';
    case 'romantic-rose':
    case 'rose-petal':
      return 'romantic-hearts-lace';
    case 'midnight-blue-paper':
    case 'night-sky':
      return 'celestial-moonlit-night';
    case 'botanical-paper':
      return 'botanical-dried-fern';
    case 'soft-pastel':
    case 'tear-stained':
      return 'pressed-lavender-field';
    case 'antique-correspondence':
    case 'classic-kraft':
      return 'torn-deckle-kraft';
    default:
      return 'antique-rose-parchment';
  }
}

export function getEnvelopeConfig(id?: string | null): EnvelopeDesignConfig {
  const normalized = normalizeEnvelopeId(id as EnvelopeColor);
  return ENVELOPE_TEMPLATES.find((e) => e.id === normalized) || ENVELOPE_TEMPLATES[0];
}

export function getPaperConfig(id?: string | null): PaperDesignConfig {
  const normalized = normalizePaperId(id as PaperStyle);
  return PAPER_TEMPLATES.find((p) => p.id === normalized) || PAPER_TEMPLATES[0];
}

// Convert local designs to Firestore StationeryTemplate objects
export function generateDefaultStationeryTemplates(): StationeryTemplate[] {
  const items: StationeryTemplate[] = [];

  ENVELOPE_TEMPLATES.forEach((env, idx) => {
    items.push({
      id: `env_${env.id}`,
      type: 'envelope',
      templateId: env.id,
      name: env.name,
      nameBn: env.nameBn,
      description: env.description,
      descriptionBn: env.descriptionBn,
      category: env.ornamentStyle,
      isFree: env.isFree,
      priceBdt: env.priceBdt,
      isActive: true,
      badge: env.badge,
      previewColorPrimary: env.borderColor,
      previewColorSecondary: env.innerBgColor,
      accentColor: env.borderColor,
      displayOrder: idx + 1,
      updatedAt: new Date().toISOString(),
    });
  });

  PAPER_TEMPLATES.forEach((paper, idx) => {
    items.push({
      id: `paper_${paper.id}`,
      type: 'paper',
      templateId: paper.id,
      name: paper.name,
      nameBn: paper.nameBn,
      description: paper.description,
      descriptionBn: paper.descriptionBn,
      category: paper.category,
      isFree: paper.isFree,
      priceBdt: paper.priceBdt,
      isActive: true,
      badge: paper.badge,
      previewColorPrimary: paper.borderClass.replace('border-[', '').replace(']', ''),
      previewColorSecondary: paper.bgClass.replace('bg-[', '').replace(']', ''),
      accentColor: paper.watermarkColor,
      displayOrder: idx + 1,
      updatedAt: new Date().toISOString(),
    });
  });

  return items;
}

// Fetch all templates from Firestore with fallback to local defaults
export async function fetchStationeryTemplates(): Promise<StationeryTemplate[]> {
  try {
    const snap = await getDocs(collection(db, 'stationery_templates'));
    if (!snap.empty) {
      const list: StationeryTemplate[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as StationeryTemplate);
      });
      list.sort((a, b) => a.displayOrder - b.displayOrder);
      return list;
    }
  } catch (err) {
    console.warn('Stationery fetch from Firestore note (using local defaults):', err);
  }
  return generateDefaultStationeryTemplates();
}

// Admin save template to Firestore
export async function saveStationeryTemplate(template: StationeryTemplate): Promise<void> {
  const docRef = doc(db, 'stationery_templates', template.id);
  await setDoc(
    docRef,
    {
      ...template,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

// Seed all default templates to Firestore
export async function syncDefaultStationeryToFirestore(): Promise<number> {
  const defaults = generateDefaultStationeryTemplates();
  let count = 0;
  for (const item of defaults) {
    await saveStationeryTemplate(item);
    count++;
  }
  return count;
}

// Fetch app settings from Firestore
export async function fetchAppSettings(): Promise<AppSettings> {
  try {
    const snap = await getDoc(doc(db, 'app_settings', 'general'));
    if (snap.exists()) {
      return { id: 'general', ...snap.data() } as AppSettings;
    }
  } catch (err) {
    console.warn('App settings fetch notice:', err);
  }
  return DEFAULT_APP_SETTINGS;
}

// Save app settings to Firestore
export async function saveAppSettings(settings: Partial<AppSettings>, adminEmail?: string): Promise<void> {
  const docRef = doc(db, 'app_settings', 'general');
  await setDoc(
    docRef,
    {
      ...DEFAULT_APP_SETTINGS,
      ...settings,
      id: 'general',
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail || 'admin',
    },
    { merge: true }
  );
}

// Fetch all unlocked template IDs for a user
export async function fetchUserTemplateAccess(userId: string): Promise<Set<string>> {
  const unlocked = new Set<string>();
  if (!userId) return unlocked;

  try {
    const q = query(collection(db, 'user_template_access'), where('userId', '==', userId));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const data = d.data() as UserTemplateAccess;
      if (data && data.templateId) {
        unlocked.add(data.templateId);
      }
    });
  } catch (err) {
    console.warn('User template access fetch notice:', err);
  }
  return unlocked;
}

// Submit a purchase request for admin verification (bKash / Nagad)
export async function submitTemplatePurchase(params: {
  userId: string;
  userUsername: string;
  userDisplayName?: string;
  templateId: string;
  templateName: string;
  templateType: 'paper' | 'envelope';
  amountBdt: number;
  paymentMethod: PaymentMethod;
  senderPhone: string;
  transactionId: string;
}): Promise<{ success: boolean; purchaseId?: string; error?: string }> {
  try {
    const purchaseId = `PUR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const purchaseData: TemplatePurchase = {
      id: purchaseId,
      userId: params.userId,
      userUsername: params.userUsername,
      userDisplayName: params.userDisplayName || params.userUsername,
      templateId: params.templateId,
      templateName: params.templateName,
      templateType: params.templateType,
      amountBdt: params.amountBdt,
      paymentMethod: params.paymentMethod,
      senderPhone: params.senderPhone,
      transactionId: params.transactionId.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'template_purchases', purchaseId), purchaseData);
    return { success: true, purchaseId };
  } catch (err) {
    console.error('Error submitting template purchase:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to submit payment verification request',
    };
  }
}

// Fetch purchase requests (for Admin or User)
export async function fetchTemplatePurchases(userId?: string): Promise<TemplatePurchase[]> {
  try {
    const coll = collection(db, 'template_purchases');
    let snap;
    if (userId) {
      const q = query(coll, where('userId', '==', userId));
      snap = await getDocs(q);
    } else {
      snap = await getDocs(coll);
    }
    const list: TemplatePurchase[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as TemplatePurchase);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (err) {
    console.warn('Fetch purchases notice:', err);
    return [];
  }
}

// Admin approves a purchase request -> grants unlock access
export async function approveTemplatePurchase(
  purchase: TemplatePurchase,
  adminIdentifier: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();
    // 1. Update purchase document
    const purchaseRef = doc(db, 'template_purchases', purchase.id);
    await updateDoc(purchaseRef, {
      status: 'approved',
      approvedBy: adminIdentifier,
      approvedAt: now,
      updatedAt: now,
    });

    // 2. Grant access record in user_template_access
    const accessId = `${purchase.userId}_${purchase.templateId}`;
    const accessRef = doc(db, 'user_template_access', accessId);
    const accessData: UserTemplateAccess = {
      id: accessId,
      userId: purchase.userId,
      templateId: purchase.templateId,
      purchaseId: purchase.id,
      unlockedAt: now,
      grantedBy: adminIdentifier,
    };
    await setDoc(accessRef, accessData);

    return { success: true };
  } catch (err) {
    console.error('Error approving template purchase:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to approve purchase',
    };
  }
}

// Admin rejects a purchase request
export async function rejectTemplatePurchase(
  purchaseId: string,
  reason: string,
  adminIdentifier: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();
    const purchaseRef = doc(db, 'template_purchases', purchaseId);
    await updateDoc(purchaseRef, {
      status: 'rejected',
      rejectionReason: reason || 'Transaction could not be verified in payment records.',
      approvedBy: adminIdentifier,
      updatedAt: now,
    });
    return { success: true };
  } catch (err) {
    console.error('Error rejecting purchase:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to reject purchase',
    };
  }
}
