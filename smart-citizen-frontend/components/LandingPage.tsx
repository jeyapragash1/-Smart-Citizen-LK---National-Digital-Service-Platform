'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  UserCheck, 
  CreditCard, 
  ShieldCheck, 
  Search, 
  ArrowRight, 
  Baby, 
  HeartHandshake, 
  Smartphone,
  Globe,
  ShoppingBag,
  Menu,
  X
} from 'lucide-react';

// ==========================================
// 🗣️ TRANSLATION DICTIONARY
// ==========================================
const translations = {
  en: {
    nav: { 
      services: "E-Services", 
      market: "Smart Marketplace", 
      verify: "Verify Documents", 
      support: "Help & Support", 
      login: "Login", 
      register: "Create Account" 
    },
    hero: {
      badge: "Official Government Platform",
      title1: "One Identity.",
      title2: "Infinite Possibilities.",
      desc: "Skip the queues. Apply for government services, track status, and receive certificates from home. Secure. Fast. Digital.",
      btnPrimary: "Access My Portal",
      btnSecondary: "Browse Services"
    },
    stats: { citizens: "Citizens Connected", services: "Digital Services", online: "Online Access", secure: "Secure Data" },
    steps: {
      title: "How It Works",
      step1: "Login Securely",
      step1desc: "Use your NIC number to access your unique digital profile.",
      step2: "Apply Online",
      step2desc: "Fill forms and upload documents digitally. No paper needed.",
      step3: "Get Certified",
      step3desc: "Receive verified digital certificates directly to your wallet."
    },
    services: {
      title: "Most Used Services",
      desc: "Access the most requested government services instantly.",
      card1: "Vital Records",
      card1desc: "Birth, Marriage, and Death certificates.",
      card2: "Police Clearance",
      card2desc: "Get clearance reports for jobs or visas.",
      card3: "Revenue License",
      card3desc: "Renew vehicle revenue licenses instantly.",
      apply: "Apply Now"
    },
    smart: {
      new: "NEW FEATURE",
      title: "Services That Understand You.",
      desc: "We connect your life events with helpful services and products.",
      baby: "New Baby Born?",
      babyDesc: "Auto-suggest child health plans & benefits.",
      wedding: "Getting Married?",
      weddingDesc: "Housing loans & event partner suggestions."
    },
    app: {
      title: "Government in Your Pocket",
      desc: "Download the Smart Citizen mobile app for easier access, push notifications, and offline wallet access.",
      btnApple: "App Store",
      btnGoogle: "Google Play"
    },
    footer: {
      desc: "A project by the Government of Sri Lanka.",
      links: "Quick Links",
      legal: "Legal",
      contact: "Contact"
    }
  },
  si: {
    nav: { 
      services: "විද්‍යුත් සේවා", 
      market: "ස්මාර්ට් වෙළඳපොළ", 
      verify: "ලේඛන පරීක්ෂාව", 
      support: "සහාය", 
      login: "පිවිසෙන්න", 
      register: "ලියාපදිංචි වන්න" 
    },
    hero: {
      badge: "නිල රාජ්‍ය වේදිකාව",
      title1: "එක් අනන්‍යතාවයක්.",
      title2: "නිමක් නැති පහසුකම්.",
      desc: "පෝලිම්වල සිටීමෙන් වලකින්න. නිවසේ සිටම රාජ්‍ය සේවාවන් ලබාගන්න, සහතික පත් ලබාගන්න. ආරක්ෂිතයි. වේගවත්.",
      btnPrimary: "මගේ ගිණුම",
      btnSecondary: "සේවාවන් සොයන්න"
    },
    stats: { citizens: "සම්බන්ධ වූ පුරවැසියන්", services: "ඩිජිටල් සේවාවන්", online: "මාර්ගගත ප්‍රවේශය", secure: "ආරක්ෂිත දත්ත" },
    steps: {
      title: "ක්‍රියා කරන ආකාරය",
      step1: "ආරක්ෂිතව පිවිසෙන්න",
      step1desc: "ඔබගේ අනන්‍යතා අංකය භාවිතා කර පිවිසෙන්න.",
      step2: "අයදුම් කරන්න",
      step2desc: "පෝරම පුරවා ලේඛන අප්ලෝඩ් කරන්න.",
      step3: "සහතික ලබාගන්න",
      step3desc: "සත්‍යාපිත ඩිජිටල් සහතික ඔබගේ ගිණුමටම ලබාගන්න."
    },
    services: {
      title: "ජනප්‍රිය සේවාවන්",
      desc: "බහුලවම භාවිතා වන රාජ්‍ය සේවාවන්.",
      card1: "ලියාපදිංචි කිරීම්",
      card1desc: "උප්පැන්න, විවාහ සහ මරණ සහතික.",
      card2: "පොලිස් වාර්තා",
      card2desc: "රැකියා හෝ වීසා සඳහා පොලිස් නිශ්කාශන වාර්තා.",
      card3: "ආදායම් බලපත්‍ර",
      card3desc: "වාහන ආදායම් බලපත්‍ර අලුත් කිරීම.",
      apply: "අයදුම් කරන්න"
    },
    smart: {
      new: "නව විශේෂාංගය",
      title: "ඔබව හඳුනන සේවාවක්.",
      desc: "ඔබගේ ජීවන සිදුවීම් වලට ගැලපෙන සේවාවන් අපි යෝජනා කරමු.",
      baby: "දරුවෙකු ලැබුනාද?",
      babyDesc: "ළමා සෞඛ්‍ය සැලසුම් සහ ප්‍රතිලාභ යෝජනා.",
      wedding: "විවාහ වීමට සූදානම්ද?",
      weddingDesc: "නිවාස ණය සහ රක්ෂණ සහාය."
    },
    app: {
      title: "රාජ්‍ය සේවය ඔබගේ අතේ",
      desc: "Smart Citizen ජංගම යෙදුම ඩවුන්ලෝඩ් කරගන්න. පහසුවෙන් සේවා ලබාගන්න.",
      btnApple: "ඇප් ස්ටෝර්",
      btnGoogle: "ගූගල් ප්ලේ"
    },
    footer: {
      desc: "ශ්‍රී ලංකා රජයේ ව්‍යාපෘතියකි.",
      links: "සබැඳි",
      legal: "නීතිමය",
      contact: "අමතන්න"
    }
  },
  ta: {
    nav: { 
      services: "மின் சேவைகள்", 
      market: "ஸ்மார்ட் சந்தை", 
      verify: "ஆவண சரிபார்ப்பு", 
      support: "உதவி மையம்", 
      login: "உள்நுழைய", 
      register: "கணக்கை உருவாக்க" 
    },
    hero: {
      badge: "அதிகாரபூர்வ அரசாங்க தளம்",
      title1: "ஒரு அடையாளம்.",
      title2: "முடிவற்ற வசதிகள்.",
      desc: "வரிசைகளைத் தவிர்க்கவும். வீட்டிலிருந்தே அரசாங்க சேவைகளைப் பெறுங்கள். பாதுகாப்பானது. வேகமானது.",
      btnPrimary: "என் கணக்கு",
      btnSecondary: "சேவையைத் தேடுங்கள்"
    },
    stats: { citizens: "இணைக்கப்பட்ட குடிமக்கள்", services: "டிஜிட்டல் சேவைகள்", online: "இணைய அணுகல்", secure: "பாதுகாப்பான தரவு" },
    steps: {
      title: "எப்படி இது செயல்படுகிறது",
      step1: "பாதுகாப்பாக உள்நுழையவும்",
      step1desc: "உங்கள் அடையாள எண்ணைப் பயன்படுத்தவும்.",
      step2: "விண்ணப்பிக்கவும்",
      step2desc: "படிவங்களை நிரப்பி ஆவணங்களைப் பதிவேற்றவும்.",
      step3: "சான்றிதழ் பெறுங்கள்",
      step3desc: "சரிபார்க்கப்பட்ட டிஜிட்டல் சான்றிதழ்களைப் பெறுங்கள்."
    },
    services: {
      title: "பிரபலமான சேவைகள்",
      desc: "அதிகம் பயன்படுத்தப்படும் அரசாங்க சேவைகள்.",
      card1: "பதிவுத் துறை",
      card1desc: "பிறப்பு, திருமணம் மற்றும் இறப்பு சான்றிதழ்கள்.",
      card2: "காவல் துறை அறிக்கை",
      card2desc: "வேலை அல்லது விசாவுக்கான காவல் துறை அறிக்கைகள்.",
      card3: "வருவாய் உரிமம்",
      card3desc: "வாகன வருவாய் உரிமத்தைப் புதுப்பிக்கவும்.",
      apply: "விண்ணப்பிக்கவும்"
    },
    smart: {
      new: "புதிய வசதி",
      title: "உங்களைப் புரிந்துகொள்ளும் சேவை.",
      desc: "உங்கள் வாழ்க்கை நிகழ்வுகளுக்கு ஏற்ற சேவைகளை நாங்கள் பரிந்துரைக்கிறோம்.",
      baby: "குழந்தை பிறந்ததா?",
      babyDesc: "குழந்தை சுகாதார திட்டங்கள் மற்றும் சலுகைகள்.",
      wedding: "திருமணம் செய்யப் போகிறீர்களா?",
      weddingDesc: "வீட்டுக் கடன் மற்றும் காப்பீட்டு உதவி."
    },
    app: {
      title: "அரசாங்க சேவைகள் உங்கள் கையில்",
      desc: "Smart Citizen செயலியைப் பதிவிறக்கவும்.",
      btnApple: "App Store",
      btnGoogle: "Google Play"
    },
    footer: {
      desc: "இலங்கை அரசாங்கத்தின் திட்டம்.",
      links: "இணைப்புகள்",
      legal: "சட்டம்",
      contact: "தொடர்பு"
    }
  }
};

type Language = 'en' | 'si' | 'ta';

export default function LandingPage() {
  const [lang, setLang] = useState<Language>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* =======================
          1. NAVIGATION BAR
      ======================== */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo Area */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center text-white font-bold">
                SL
              </div>
              <span className="text-xl font-bold text-blue-900 tracking-tight cursor-pointer">
                SmartCitizen<span className="text-orange-600">.lk</span>
              </span>
            </div>

            {/* Desktop Menu - Updated with Project Links */}
            <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600">
              <Link href="/services" className="hover:text-blue-700 flex items-center gap-1">
                {t.nav.services}
              </Link>
              <Link href="/marketplace" className="hover:text-blue-700 flex items-center gap-1">
                <ShoppingBag className="w-4 h-4 text-orange-600" />
                {t.nav.market}
              </Link>
              <Link href="/verify" className="hover:text-blue-700">
                {t.nav.verify}
              </Link>
              <Link href="/support" className="hover:text-blue-700">
                {t.nav.support}
              </Link>
            </div>

            {/* Language & Auth */}
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <div className="hidden md:flex bg-gray-100 rounded-lg p-1 mr-2">
                <button onClick={() => setLang('en')} className={`px-2 py-1 text-xs rounded ${lang === 'en' ? 'bg-white shadow text-blue-700 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>EN</button>
                <button onClick={() => setLang('si')} className={`px-2 py-1 text-xs rounded ${lang === 'si' ? 'bg-white shadow text-blue-700 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>සිං</button>
                <button onClick={() => setLang('ta')} className={`px-2 py-1 text-xs rounded ${lang === 'ta' ? 'bg-white shadow text-blue-700 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>தமிழ்</button>
              </div>

              <Link href="/login">
                <button className="hidden md:block px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                  {t.nav.login}
                </button>
              </Link>
              <Link href="/register">
                <button className="hidden md:block px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-md hover:shadow-lg transition">
                  {t.nav.register}
                </button>
              </Link>
              
              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700">
                  {mobileMenuOpen ? <X /> : <Menu />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-lg">
             <div className="flex justify-center gap-2 mb-4">
                <button onClick={() => setLang('en')} className={`px-3 py-1 text-sm rounded border ${lang === 'en' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200'}`}>English</button>
                <button onClick={() => setLang('si')} className={`px-3 py-1 text-sm rounded border ${lang === 'si' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200'}`}>සිංහල</button>
                <button onClick={() => setLang('ta')} className={`px-3 py-1 text-sm rounded border ${lang === 'ta' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200'}`}>தமிழ்</button>
             </div>
             <Link href="/services" className="block text-gray-700 font-medium py-2 border-b border-gray-100">{t.nav.services}</Link>
             <Link href="/marketplace" className="block text-gray-700 font-medium py-2 border-b border-gray-100">{t.nav.market}</Link>
             <Link href="/verify" className="block text-gray-700 font-medium py-2 border-b border-gray-100">{t.nav.verify}</Link>
             <Link href="/support" className="block text-gray-700 font-medium py-2 border-b border-gray-100">{t.nav.support}</Link>
             <div className="flex flex-col gap-2 pt-2">
               <Link href="/login" className="w-full">
                 <button className="w-full px-4 py-2 text-blue-700 bg-blue-50 rounded-lg">{t.nav.login}</button>
               </Link>
               <Link href="/register" className="w-full">
                 <button className="w-full px-4 py-2 text-white bg-blue-700 rounded-lg">{t.nav.register}</button>
               </Link>
             </div>
          </div>
        )}
      </nav>

      {/* =======================
          2. HERO SECTION
      ======================== */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            {t.hero.badge}
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-blue-950 tracking-tight mb-6">
            {t.hero.title1} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {t.hero.title2}
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-10">
            {t.hero.desc}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 py-4 bg-blue-700 text-white rounded-xl font-semibold text-lg shadow-xl hover:bg-blue-800 hover:scale-105 transition-all duration-200 flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              {t.hero.btnPrimary}
            </button>
            <button className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold text-lg shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
              <Search className="w-5 h-5" />
              {t.hero.btnSecondary}
            </button>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-200 pt-8">
            <div>
              <p className="text-3xl font-bold text-blue-900">21M+</p>
              <p className="text-sm text-gray-500">{t.stats.citizens}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-900">500+</p>
              <p className="text-sm text-gray-500">{t.stats.services}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-900">24/7</p>
              <p className="text-sm text-gray-500">{t.stats.online}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-900">100%</p>
              <p className="text-sm text-gray-500">{t.stats.secure}</p>
            </div>
          </div>
        </div>
      </section>

      {/* =======================
          3. HOW IT WORKS
      ======================== */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{t.steps.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">1</div>
              <h3 className="text-xl font-bold mb-2">{t.steps.step1}</h3>
              <p className="text-gray-500">{t.steps.step1desc}</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">2</div>
              <h3 className="text-xl font-bold mb-2">{t.steps.step2}</h3>
              <p className="text-gray-500">{t.steps.step2desc}</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">3</div>
              <h3 className="text-xl font-bold mb-2">{t.steps.step3}</h3>
              <p className="text-gray-500">{t.steps.step3desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* =======================
          4. POPULAR SERVICES
      ======================== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">{t.services.title}</h2>
            <p className="text-gray-500 mt-2">{t.services.desc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-8 bg-white rounded-2xl hover:bg-blue-50 hover:shadow-lg transition-all border border-gray-200 group cursor-pointer">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.services.card1}</h3>
              <p className="text-gray-600 mb-4">{t.services.card1desc}</p>
              <span className="text-blue-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">{t.services.apply} <ArrowRight className="w-4 h-4"/></span>
            </div>

            {/* Card 2 */}
            <div className="p-8 bg-white rounded-2xl hover:bg-blue-50 hover:shadow-lg transition-all border border-gray-200 group cursor-pointer">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.services.card2}</h3>
              <p className="text-gray-600 mb-4">{t.services.card2desc}</p>
              <span className="text-blue-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">{t.services.apply} <ArrowRight className="w-4 h-4"/></span>
            </div>

            {/* Card 3 */}
            <div className="p-8 bg-white rounded-2xl hover:bg-blue-50 hover:shadow-lg transition-all border border-gray-200 group cursor-pointer">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.services.card3}</h3>
              <p className="text-gray-600 mb-4">{t.services.card3desc}</p>
              <span className="text-blue-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">{t.services.apply} <ArrowRight className="w-4 h-4"/></span>
            </div>
          </div>
        </div>
      </section>

      {/* =======================
          5. SMART LIFE EVENTS
      ======================== */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            
            <div className="md:w-1/2">
              <div className="inline-block bg-blue-800 px-3 py-1 rounded-full text-xs font-bold mb-4">{t.smart.new}</div>
              <h2 className="text-4xl font-bold mb-6">{t.smart.title}</h2>
              <p className="text-blue-200 text-lg mb-8">{t.smart.desc}</p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center shrink-0">
                    <Baby className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl">{t.smart.baby}</h4>
                    <p className="text-blue-200 text-sm">{t.smart.babyDesc}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl">{t.smart.wedding}</h4>
                    <p className="text-blue-200 text-sm">{t.smart.weddingDesc}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Representation */}
            <div className="md:w-1/2 bg-white/10 p-8 rounded-3xl backdrop-blur-sm border border-white/20">
               <div className="bg-white text-gray-900 p-6 rounded-xl shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-lg">Dashboard</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="bg-orange-100 p-2 rounded">👶</div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">Birth Certificate</p>
                        <p className="text-xs text-gray-500">Approved • 2m ago</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="bg-blue-100 p-2 rounded">🎁</div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">Baby Care Pack</p>
                        <p className="text-xs text-blue-600">Recommended for you</p>
                      </div>
                      <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded">View</button>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================
          6. MOBILE APP SECTION
      ======================== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold text-blue-900 mb-4">{t.app.title}</h2>
              <p className="text-lg text-gray-600 mb-8">{t.app.desc}</p>
              <div className="flex gap-4">
                <button className="px-6 py-3 bg-gray-900 text-white rounded-xl flex items-center gap-2 hover:bg-gray-800 transition">
                  <Smartphone className="w-5 h-5" />
                  {t.app.btnApple}
                </button>
                <button className="px-6 py-3 bg-gray-900 text-white rounded-xl flex items-center gap-2 hover:bg-gray-800 transition">
                  <Smartphone className="w-5 h-5" />
                  {t.app.btnGoogle}
                </button>
              </div>
            </div>
            <div className="md:w-1/3 flex justify-center">
              {/* Phone Mockup Placeholder */}
              <div className="w-64 h-96 bg-white border-8 border-gray-900 rounded-[3rem] shadow-2xl flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-blue-600 flex flex-col items-center justify-center text-white p-4 text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full mb-4"></div>
                    <p className="font-bold">Smart Citizen App</p>
                    <p className="text-xs mt-2 opacity-80">Scan QR to Login</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================
          7. FOOTER
      ======================== */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold">SL</div>
                <span className="text-white font-bold text-lg">SmartCitizen.lk</span>
              </div>
              <p className="text-sm">{t.footer.desc}</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t.footer.links}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Home</a></li>
                <li><a href="#" className="hover:text-white">Services</a></li>
                <li><a href="#" className="hover:text-white">Verify</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Use</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t.footer.contact}</h4>
              <ul className="space-y-2 text-sm">
                <li>help@smartcitizen.gov.lk</li>
                <li>1919 (Gov Hotline)</li>
                <li>Colombo 01, Sri Lanka</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-xs flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 Government of Sri Lanka. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
               <Globe className="w-4 h-4" />
               <span>English • සිංහල • தமிழ்</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}