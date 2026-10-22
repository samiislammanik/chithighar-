import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Feather,
  Shield,
  FileText,
  Mail,
  Heart,
  MapPin,
  Phone,
  Send,
  CheckCircle,
} from 'lucide-react';

interface InfoPagesProps {
  pageType: 'about' | 'guidelines' | 'privacy' | 'terms' | 'contact';
}

export const InfoPages: React.FC<InfoPagesProps> = ({ pageType }) => {
  const { t, language } = useLanguage();
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMsg('');
      setContactSent(false);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 select-none">
      {/* ABOUT US */}
      {pageType === 'about' && (
        <article className="space-y-8 animate-in fade-in">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-[#801D2E] font-bold">
              OUR NOSTALGIC JOURNEY
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-900">
              চিঠিঘরের গল্প: কিছু কথা চিঠিতেই সুন্দর
            </h1>
            <p className="text-sm font-serif text-stone-600">
              ডিজিটাল কোলাহলের যুগে হৃদয়ের নিভৃত অনুভূতিকে ধরে রাখার এক চিরকালীন নিকেতন।
            </p>
          </div>

          <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#E4DAC8] shadow-sm font-serif space-y-6 text-stone-800 leading-relaxed text-base">
            <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-[#801D2E] first-letter:float-left first-letter:mr-3 first-letter:leading-none">
              একসময় আমাদের দেশে ডাক পিয়ন সাইকেলের ঘণ্টা বাজিয়ে উঠোনে চিঠি ফেলে যেত। খাম ছেঁড়ার আগের সেই আকুল অপেক্ষা, কাগজের সুবাস, আর পরিচিত হস্তাক্ষরের ভাঁজে লুকিয়ে থাকা নীরব ভালোবাসার যে রোমাঞ্চ—তা কোনো ইনস্ট্যান্ট মেসেজিং অ্যাপের নোটিফিকেশনে খুঁজে পাওয়া সম্ভব নয়।
            </p>

            <p>
              <strong>চিঠিঘর (Chithighor)</strong> গড়ে উঠেছে সেই হারিয়ে যাওয়া চিঠির সংস্কৃতিকে আধুনিক প্রযুক্তির সাথে মেলবন্ধন ঘটাতে। এখানে আপনি ডিজিটালভাবে বেনামী চিঠি লিখে কারও ডাকবাক্সে পাঠিয়ে দিতে পারেন, আবার চাইলে আপনার পাঠানো ডিজিটাল চিঠিটিকে খাঁটি মোমের সিলমোহরে সুগন্ধি আসল কাগজের খামে রূপান্তর করে পৌঁছে দিতে পারেন বাংলাদেশের যেকোনো প্রান্তে।
            </p>

            <blockquote className="p-4 rounded-xl bg-[#FAF5EB] border-l-4 border-[#801D2E] italic my-6 text-stone-900 text-sm">
              &ldquo;চিঠি লেখা মানে কেবল কিছু শব্দ বিনিময় নয়; এটি হলো হৃদয়ের এক টুকরো নিশ্বাসকে সময়ের সীমানা পেরিয়ে অন্যের হাতে সঁপে দেওয়া।&rdquo;
            </blockquote>

            <h3 className="text-xl font-bold text-stone-900 pt-2">
              আমাদের তিনটি মূল স্তম্ভ:
            </h3>
            <ul className="space-y-3 text-sm text-stone-700">
              <li>
                <strong>১. নিভৃত গোপনীয়তা:</strong> অনেকে আপনজন বা পরিচিত কাউকে অনেক কথা সরাসরি বলতে পারেন না। চিঠিঘর তাদের সুযোগ দেয় নাম প্রকাশ না করেও আন্তরিক অনুভূতি পৌঁছে দেওয়ার।
              </li>
              <li>
                <strong>২. নান্দনিক আবহ:</strong> ভিন্টেজ পার্চমেন্ট পাতা, ডাকঘরের স্মারক ডাকটিকিট, লাল মোমের সিলমোহর—প্রতিটি উপাদানে আমরা এনেছি পুরোনো বাংলার ডাক সংস্কৃতির স্মৃতি।
              </li>
              <li>
                <strong>৩. বাস্তবের ডাকবাক্স:</strong> শুধু স্ক্রিনেই সীমাবদ্ধ নয়—আমরা ৬৪ জেলার ঠিকানায় আসল কাগজের চিঠি পৌঁছে দিই।
              </li>
            </ul>
          </div>
        </article>
      )}

      {/* COMMUNITY GUIDELINES */}
      {pageType === 'guidelines' && (
        <article className="space-y-8 animate-in fade-in">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-serif font-bold">
              <Shield className="w-4 h-4 text-amber-700" />
              <span>শালীনতা ও নীতি</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-900">
              চিঠিঘর সম্প্রদায় নির্দেশিকা (Community Guidelines)
            </h1>
            <p className="text-sm font-serif text-stone-600">
              চিঠিঘরকে নিরাপদ, মার্জিত ও সংবেদনশীল রাখতে আমাদের সম্মিলিত অঙ্গীকার।
            </p>
          </div>

          <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#E4DAC8] shadow-sm font-serif space-y-6 text-stone-800 text-sm leading-relaxed">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-stone-900">১. কোনো ধরনের হয়রানি বা ব্যক্তিগত আক্রমণ নয়</h3>
              <p className="text-stone-600">
                বেনামী থাকার সুবিধা মানে এই নয় যে কাউকে উত্ত্যক্ত, গালাগাল বা মানহানিকর বার্তা পাঠানো যাবে। যে কোনো বিদ্বেষমূলক চিঠি অপসারণ করা হবে এবং ব্যবহারকারীকে নিষিদ্ধ করা হবে।
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-stone-900">২. ব্যক্তিগত তথ্য ফাঁস (Doxxing) কঠোরভাবে নিষিদ্ধ</h3>
              <p className="text-stone-600">
                চিঠিতে বা প্রকাশ্য মন্তব্যে কারও মোবাইল নম্বর, ব্যক্তিগত ঠিকানা, পাসপোর্ট বা পরিচয়পত্রের তথ্য দেওয়া সম্পূর্ণ নিষিদ্ধ।
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-stone-900">৩. অশালীন ও কুরুচিপূর্ণ উপাদান বর্জন</h3>
              <p className="text-stone-600">
                যৌন ইঙ্গিতপূর্ণ, অশ্লীল বা হিংসাত্মক কোনো রচনা চিঠিঘরের উন্মুক্ত মেলায় স্থান পাবে না।
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-stone-900">৪. সহমর্মিতা ও শ্রদ্ধা প্রদর্শন</h3>
              <p className="text-stone-600">
                এখানে অনেকেই তাদের ভাঙা মন, কান্না বা অপূর্ণ স্বপ্নের কথা লেখেন। মন্তব্যে সবসময় ভদ্র, মার্জিত ও সহানুভূতিশীল ভাষা ব্যবহার করুন।
              </p>
            </div>
          </div>
        </article>
      )}

      {/* PRIVACY POLICY */}
      {pageType === 'privacy' && (
        <article className="space-y-8 animate-in fade-in">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-900">
              গোপনীয়তা নীতি (Privacy Policy)
            </h1>
            <p className="text-sm font-serif text-stone-600">
              আপনার বিশ্বস্ততা ও তথ্যের সুরক্ষা আমাদের প্রধান অগ্রাধিকার।
            </p>
          </div>

          <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#E4DAC8] shadow-sm font-serif space-y-6 text-stone-800 text-sm leading-relaxed">
            <p>
              চিঠিঘর ব্যবহারে আপনার গোপনীয়তা রক্ষা করা আমাদের আইনি ও নৈতিক দায়িত্ব।
            </p>

            <h3 className="text-base font-bold text-stone-900">বেনামী চিঠি প্রেরকের পরিচয়</h3>
            <p className="text-stone-600">
              আপনি যখন &quot;নাম গোপন রাখুন&quot; নির্বাচন করে চিঠি পাঠান, তখন সাধারণ পাঠক বা প্রাপকের কাছে আপনার ইমেইল বা প্রোফাইল কোনোভাবেই উন্মুক্ত হয় না। শুধুমাত্র মডারেশন বা স্প্যাম প্রতিরোধের উদ্দেশ্যে সিস্টেমের ব্যাকএন্ডে একটি অভ্যন্তরীণ এনক্রিপ্টেড রেকর্ড রাখা হয়।
            </p>

            <h3 className="text-base font-bold text-stone-900">শারীরিক ডাক চিঠির ডেলিভারি ঠিকানা</h3>
            <p className="text-stone-600">
              কাগজের চিঠি প্রেরণের জন্য আপনি যে ডেলিভারি ঠিকানা ও মোবাইল নম্বর প্রদান করেন, তা শুধুমাত্র চিঠিটি মুদ্রণ ও নির্দিষ্ট কুরিয়ার প্রতিনিধির নিকট হস্তান্তরের কাজে ব্যবহৃত হয়। এটি কখনো পাবলিক ফিড বা তৃতীয় পক্ষের ডেটা ব্রোকারের কাছে বিক্রি করা হয় না।
            </p>

            <h3 className="text-base font-bold text-stone-900">অ্যাকাউন্ট ডেটা মুছে ফেলা</h3>
            <p className="text-stone-600">
              আপনি যেকোনো সময় আপনার নিজস্ব পাঠানো চিঠি বা অ্যাকাউন্ট সম্পর্কিত ডেটা চিঠিঘর থেকে স্থায়ীভাবে মুছে ফেলতে পারেন।
            </p>
          </div>
        </article>
      )}

      {/* TERMS OF SERVICE */}
      {pageType === 'terms' && (
        <article className="space-y-8 animate-in fade-in">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-900">
              ব্যবহারের শর্তাবলী (Terms of Service)
            </h1>
            <p className="text-sm font-serif text-stone-600">
              চিঠিঘর অ্যাপ্লিকেশন ব্যবহারের নিয়ম ও নির্দেশাবলী।
            </p>
          </div>

          <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#E4DAC8] shadow-sm font-serif space-y-4 text-stone-800 text-sm leading-relaxed">
            <h3 className="text-base font-bold text-stone-900">১. সেবা গ্রহণের সম্মতি</h3>
            <p className="text-stone-600">
              চিঠিঘর ব্রাউজ বা চিঠি প্রেরণের মাধ্যমে আপনি আমাদের নীতিমালা ও শর্তাবলীতে সম্মত হন।
            </p>

            <h3 className="text-base font-bold text-stone-900">২. বুদ্ধিবৃত্তিক স্বত্ব</h3>
            <p className="text-stone-600">
              আপনার লিখিত চিঠির পূর্ণ স্বত্ব আপনার নিজের। তবে চিঠিঘরের উন্মুক্ত মেলায় চিঠি প্রকাশ করলে পাঠক তা পড়তে ও ইতিবাচক অনুভূতি ব্যক্ত করতে পারবেন।
            </p>

            <h3 className="text-base font-bold text-stone-900">৩. কাগজের চিঠি ডেলিভারি সময়সীমা</h3>
            <p className="text-stone-600">
              বাংলাদেশ ডাক বিভাগ বা শীর্ষস্থানীয় পার্সেল কুরিয়ারের মাধ্যমে ঢাকার মধ্যে ২৪-৪৮ ঘণ্টা এবং ঢাকার বাইরে জেলা সদরে ২-৫ কার্যদিবসের মধ্যে ডেলিভারি সম্পন্ন হয়। প্রাকৃতিক দুর্যোগ বা রাজনৈতিক ধর্মঘটের ক্ষেত্রে কিছুটা বিলম্ব হতে পারে।
            </p>
          </div>
        </article>
      )}

      {/* CONTACT US */}
      {pageType === 'contact' && (
        <article className="space-y-8 animate-in fade-in">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-900">
              চিঠিঘর ডাক বিভাগে যোগাযোগ (Contact Us)
            </h1>
            <p className="text-sm font-serif text-stone-600">
              যেকোনো জিজ্ঞাসা, মতামত বা বিশেষ ডাকচিঠি অর্ডারের জন্য আমাদের লিখুন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 space-y-6 rounded-2xl bg-[#FAF5EB] p-6 border border-[#E6DBC9] font-serif text-stone-800">
              <h3 className="text-base font-bold text-stone-900 border-b pb-2">
                প্রধান ডাক তথ্যকেন্দ্র
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#801D2E] mt-0.5" />
                  <div>
                    <strong>চিঠিঘর ডাক সমন্বয় কেন্দ্র</strong>
                    <p className="text-stone-600">জিপিও রোড, মতিঝিল, ঢাকা-১০০০, বাংলাদেশ।</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#801D2E] mt-0.5" />
                  <div>
                    <strong>অফিসিয়াল ইমেইল</strong>
                    <p className="text-stone-600 font-mono">dakghor@chithighor.me</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#801D2E] mt-0.5" />
                  <div>
                    <strong>হেল্পলাইন</strong>
                    <p className="text-stone-600 font-mono">+880 1700-000000 (সকাল ১০টা - রাত ৮টা)</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#DECDB7] text-[11px] text-stone-600">
                কাগজের চিঠি প্রেরণের কুরিয়ার ট্র্যাকিং সংক্রান্ত যে কোনো সমস্যায় আপনার অর্ডারের ৬-সংখ্যার ট্র্যাকিং কোডটি উল্লেখ করুন।
              </div>
            </div>

            <div className="md:col-span-7 rounded-2xl bg-white p-6 sm:p-8 border border-[#E4DAC8] shadow-sm">
              {contactSent ? (
                <div className="text-center py-12 space-y-3">
                  <CheckCircle className="w-12 h-12 mx-auto text-emerald-600" />
                  <h3 className="text-lg font-serif font-bold text-stone-900">
                    আপনার বার্তা চিঠিঘরে পৌঁছেছে!
                  </h3>
                  <p className="text-xs font-serif text-stone-600">
                    আমাদের ডাক প্রতিনিধি খুব দ্রুত আপনার সাথে যোগাযোগ করবেন।
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-serif font-bold text-stone-800">
                      আপনার নাম *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      placeholder="আপনার পুরো নাম লিখুন"
                      className="w-full p-2.5 rounded-lg border border-[#D5C6B0] text-sm font-serif"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-serif font-bold text-stone-800">
                      ইমেইল ঠিকানা *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      placeholder="example@mail.com"
                      className="w-full p-2.5 rounded-lg border border-[#D5C6B0] text-sm font-serif"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-serif font-bold text-stone-800">
                      আপনার বার্তা বা জিজ্ঞাসা *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={contactMsg}
                      onChange={e => setContactMsg(e.target.value)}
                      placeholder="এখানে আপনার বার্তাটি লিখুন..."
                      className="w-full p-2.5 rounded-lg border border-[#D5C6B0] text-sm font-serif"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#801D2E] hover:bg-[#962337] text-white text-xs font-serif font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>বার্তা পাঠান (Send Message)</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </article>
      )}
    </div>
  );
};
