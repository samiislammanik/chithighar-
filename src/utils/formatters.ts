export function toBengaliNumber(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, digit => bnDigits[parseInt(digit, 10)]);
}

export function formatRelativeTime(dateString: string, lang: 'bn' | 'en'): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) {
      return lang === 'bn' ? 'এইমাত্র' : 'Just now';
    }
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
      return lang === 'bn'
        ? `${toBengaliNumber(diffMin)} মিনিট আগে`
        : `${diffMin} min ago`;
    }
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) {
      return lang === 'bn'
        ? `${toBengaliNumber(diffHour)} ঘণ্টা আগে`
        : `${diffHour}h ago`;
    }
    const diffDays = Math.floor(diffHour / 24);
    if (diffDays < 30) {
      return lang === 'bn'
        ? `${toBengaliNumber(diffDays)} দিন আগে`
        : `${diffDays}d ago`;
    }
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      return lang === 'bn'
        ? `${toBengaliNumber(diffMonths)} মাস আগে`
        : `${diffMonths}mo ago`;
    }
    const diffYears = Math.floor(diffDays / 365);
    return lang === 'bn'
      ? `${toBengaliNumber(diffYears)} বছর আগে`
      : `${diffYears}y ago`;
  } catch {
    return dateString;
  }
}

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function generateLetterId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 9; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export function generateTrackingNumber(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `CG-${randomNum}BD`;
}

export function getShareableUrl(letterId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/?letter=${letterId}`;
  }
  return `https://chithighor.me/?letter=${letterId}`;
}
