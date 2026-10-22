export type LetterCategory =
  | 'love'
  | 'heartbreak'
  | 'family'
  | 'friendship'
  | 'life_stories'
  | 'poetry'
  | 'anonymous'
  | 'apology'
  | 'memories'
  | 'motivation'
  | 'unsent'
  | 'general';

export type PaperStyle =
  // 10 Free Vintage Letter Paper Designs
  | 'antique-rose-parchment'
  | 'torn-deckle-kraft'
  | 'botanical-dried-fern'
  | 'classic-ivory-deckle'
  | 'monarch-butterfly-sepia'
  | 'romantic-hearts-lace'
  | 'newspaper-chronicle-antique'
  | 'minimal-sepia-frame'
  | 'pressed-lavender-field'
  | 'heritage-postmaster-ruled'
  // 5 Premium Vintage Letter Paper Designs
  | 'celestial-moonlit-night'
  | 'victorian-royal-gold'
  | 'vintage-rose-envelope-collage'
  | 'romantic-crimson-velvet'
  | 'ancient-cartography-map'
  // Backward compatibility keys
  | 'classic-ivory-paper'
  | 'vintage-aged-paper'
  | 'burgundy-border'
  | 'royal-gold-frame'
  | 'minimal-white'
  | 'romantic-rose'
  | 'midnight-blue-paper'
  | 'botanical-paper'
  | 'soft-pastel'
  | 'antique-correspondence'
  | 'vintage-parchment'
  | 'cream-linen'
  | 'rose-petal'
  | 'night-sky'
  | 'classic-kraft'
  | 'tear-stained';

export type FontFamily =
  // 10 Free Handwriting Fonts
  | 'elegant-noto-script'
  | 'natural-casual-kalam'
  | 'romantic-galada-cursive'
  | 'soft-dancing-cursive'
  | 'neat-notebook-hind'
  | 'vintage-manuscript-tiro'
  | 'playful-brush-atma'
  | 'minimal-clean-anek'
  | 'rounded-friendly-mina'
  | 'classic-cinzel-post'
  // 5 Premium Handwriting Fonts
  | 'luxury-great-vibes'
  | 'romantic-love-script'
  | 'artistic-alex-brush'
  | 'vintage-satisfy-antique'
  | 'elegant-parisienne-letter'
  // Backward compatibility
  | 'noto-serif'
  | 'hind-siliguri'
  | 'kalam'
  | 'playfair';

export type EnvelopeColor =
  | 'classic-ivory'
  | 'burgundy-velvet'
  | 'midnight-blue'
  | 'vintage-letter'
  | 'rose-garden'
  | 'minimal-modern'
  | 'royal-gold'
  | 'botanical-green'
  | 'romantic-blush'
  | 'midnight-romance'
  // Backward compatibility
  | 'burgundy'
  | 'forest-green'
  | 'terracotta'
  | 'navy'
  | 'gold-sand';

export type WaxSeal = 'heart' | 'rose' | 'bird' | 'anchor' | 'monogram' | 'none';

export type StampStyle =
  | 'dhaka-vintage'
  | 'post-runner'
  | 'water-lily'
  | 'bengal-tiger'
  | 'tea-garden';

export interface StationeryTemplate {
  id: string; // e.g. 'paper_antique-rose-parchment', 'font_luxury-great-vibes', 'env_classic-ivory'
  type: 'envelope' | 'paper' | 'font';
  templateId: EnvelopeColor | PaperStyle | FontFamily;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  category?: string;
  isFree: boolean;
  priceBdt: number;
  isActive: boolean;
  badge?: 'featured' | 'new' | 'popular' | 'none';
  previewColorPrimary: string;
  previewColorSecondary: string;
  accentColor?: string;
  displayOrder: number;
  updatedAt?: string;
}

export type PaymentMethod = 'bKash' | 'Nagad';
export type PurchaseStatus = 'pending' | 'approved' | 'rejected';

export interface TemplatePurchase {
  id: string; // e.g. 'PUR-92810'
  userId: string;
  userUsername: string;
  userDisplayName?: string;
  templateId: string;
  templateName: string;
  templateType: 'paper' | 'envelope' | 'font';
  amountBdt: number;
  paymentMethod: PaymentMethod;
  senderPhone: string;
  transactionId: string;
  status: PurchaseStatus;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserTemplateAccess {
  id: string; // `${userId}_${templateId}`
  userId: string;
  templateId: string;
  purchaseId?: string;
  unlockedAt: string;
  grantedBy: string;
}

export interface AppSettings {
  id: string;
  bkashMerchantNumber: string;
  nagadMerchantNumber: string;
  paymentInstructionsBn: string;
  paymentInstructionsEn: string;
  supportContact: string;
  defaultPremiumPriceBdt: number;
  isMaintenanceMode?: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export type ReactionType = 'heart' | 'crying' | 'hug' | 'rose' | 'feather';

export interface Letter {
  id: string;
  title: string;
  content: string;
  body?: string;
  authorId: string;
  ownerUid?: string;
  authorName: string;
  isAnonymous: boolean;
  anonymous?: boolean;
  recipientType: 'public' | 'username' | 'link_only';
  recipientUsername?: string | null;
  visibility: 'public' | 'unlisted' | 'private';
  category: LetterCategory;
  language?: string;
  paperStyle: PaperStyle;
  fontFamily: FontFamily;
  envelopeColor: EnvelopeColor;
  waxSeal: WaxSeal;
  stampStyle: StampStyle;
  reactions: Record<ReactionType, number>;
  viewsCount: number;
  savesCount: number;
  isDraft: boolean;
  status?: 'published' | 'draft' | 'moderated';
  isReported?: boolean;
  isModerated?: boolean;
  createdAt: string; // ISO string
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  username: string;
  bio?: string;
  avatarStyle?: string;
  lettersCount: number;
  createdAt: string;
}

export interface UserPrivateInfo {
  email: string;
  role: 'user' | 'admin';
  realName?: string;
  phone?: string;
  defaultShippingAddress?: string;
  updatedAt?: string;
}

export interface LetterComment {
  id: string;
  letterId: string;
  authorId: string;
  authorName: string;
  content: string;
  isAnonymous: boolean;
  createdAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'mock_verified' | 'paid';

export interface PhysicalOrder {
  id: string;
  userId: string;
  letterTitle: string;
  letterContent: string;
  paperStyle: PaperStyle;
  envelopeColor: EnvelopeColor;
  waxSeal: WaxSeal;
  packageType: 'standard' | 'vintage_wax_box' | 'keepsake_deluxe';
  priceBdt: number;
  senderName: string;
  senderAddress?: string;
  senderPhone?: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  district: string;
  postalCode?: string;
  status: OrderStatus;
  trackingNumber: string;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentTxId?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DeliveryPackage {
  id: string;
  name: string;
  nameBn: string;
  priceBdt: number;
  estimatedDays: string;
  features: string[];
  featuresBn: string[];
  active: boolean;
  badge?: string;
}

export interface ContentReport {
  id: string;
  targetType: 'letter' | 'comment' | 'user';
  targetId: string;
  reportedBy: string;
  reason: string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}
