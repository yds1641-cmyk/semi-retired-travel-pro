'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// 1. 데이터 형식 정의
interface Deal {
  id: string;
  title: string;
  lat: number;
  lng: number;
  price: number;
  link: string;
}

const Map = dynamic(() => import('../components/Map'), { ssr: false });

// ★ 중요: 반드시 export default가 있어야 Netlify 배포가 성공합니다.
export default function Home() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [budget, setBudget] = useState(300000);
  const [language, setLanguage] = useState<'ko' | 'en'>('ko'); // 언어 상태
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [region, setRegion] = useState('All');

  // 2. 다국어 번역 데이터
  const t = {
    ko: {
      title: "✈️ 반백수 여행",
      budgetLabel: "💰 나의 생존 예산",
      settings: "환경 설정",
      region: "선호 지역",
      world: "🌏 전 세계",
      asia: "아시아",
      europe: "유럽",
      close: "설정 완료",
      loading: "데이터 동기화 중...",
      apply: "혜택 확인 및 신청하기",
      provider: "제공",
      basis: "근거",
      step: "절차",
      guide: "🖱️ 지도를 움직여 여행지를 찾으세요!"
    },
    en: {
      title: "✈️ Semi-Retired Travel",
      budgetLabel: "💰 My Budget",
      settings: "Settings",
      region: "Preferred Region",
      world: "🌏 World",
      asia: "Asia",
      europe: "Europe",
      close: "Done",
      loading: "Syncing Data...",
      apply: "Apply / Check Benefits",
      provider: "Provider",
      basis: "Basis",
      step: "Step",
      guide: "🖱️ Move the map to find deals!"
    }
  }[language];

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://semi-retired-travel-pro.onrender.com/deals?budget=${budget}&region=${region}`);
        const data = await res.json();
        setDeals(data);
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setLoading(false);
      }
    };
    const tid = setTimeout(fetchDeals, 300);
    return () => clearTimeout(tid);
  }, [budget, region]);

  // 3. 각 항목별 상세 팝업 정보 (언어별 대응)
  const getDetailInfo = (id: string) => {
    const info: Record<string, any> = {
      'hk-1': {
        ko: { p: '홍콩공항청', b: '관광객 유치 캠페인', s: '사이트 접속 후 응모' },
        en: { p: 'HK Airport', b: 'Tourism Campaign', s: 'Apply on Website' }
      },
      'tw-1': {
        ko: { p: '대만 관광청', b: '자유여행객 지원금', s: '입국 전 온라인 신청' },
        en: { p: 'Taiwan Tourism', b: 'Lucky Land Grant', s: 'Online Pre-apply' }
      },
      'os-1': {
        ko: { p: 'LCC 항공사', b: '출발 임박 땡처리', s: '즉시 결제 필요' },
        en: { p: 'LCC Airline', b: 'Last Minute Deal', s: 'Immediate Booking' }
      }
    };
    return info[id] ? info[id][language] : { p: '---', b: '---', s: '---' };
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      <header className="flex justify-between items-center p-4 bg-white shadow-md z-30">
        <h1 className="text-xl font-bold text-blue-600">{t.title}</h1>
        <div className="flex gap-4">
          <button onClick={() => setLanguage(l => l === 'ko' ? 'en' : 'ko')} className="text-2xl hover:scale-110 transition-transform">🌐</button>
          <button onClick={() => setIsSettingsOpen(true)} className="text-2xl hover:scale-110 transition-transform">⚙️</button>
        </div>
      </header>

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-xs">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">⚙️ {t.settings}</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">{t.region}</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full p-2 border rounded-xl bg-gray-50">
                <option value="All">{t.world}</option>
                <option value="Asia">{t.asia}</option>
                <option value="Europe">{t.europe}</option>
              </select>
            </div>
            <button onClick={() => setIsSettingsOpen(false)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">{t.close}</button>
          </div>
        </div>
      )}

      <main className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <aside className="w-full lg:w-[400px] bg-white p-5 overflow-y-auto shadow-inner z-10 border-r">
          <div className="bg-blue-50 p-5 rounded-2xl mb-6 border border-blue-100">
            <div className="flex justify-between mb-2 font-bold text-sm text-blue-800">
              <span>{t.budgetLabel}</span>
              <span className="text-blue-600">{budget.toLocaleString()}원</span>
            </div>
            <input type="range" min="0" max="500000" step="10000" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full h-2 accent-blue-600 cursor-pointer" />
          </div>

          <div className="space-y-4">
            {loading ? <div className="text-center py-10 animate-pulse">{t.loading}</div> :
              deals.map((deal) => {
                const det = getDetailInfo(deal.id);
                return (
                  <div key={deal.id} className="relative border rounded-2xl p-4 hover:border-blue-400 bg-white transition-all shadow-sm group"
                    onMouseEnter={() => setHoveredId(deal.id)} onMouseLeave={() => setHoveredId(null)} onClick={() => setSelectedId(deal.id)}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-800">{deal.title}</span>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg">{deal.price === 0 ? 'FREE' : `${deal.price.toLocaleString()}W`}</span>
                    </div>

                    {hoveredId === deal.id && (
                      <div className="absolute left-0 right-0 top-0 -translate-y-[105%] bg-gray-900 text-white p-4 rounded-xl shadow-2xl z-50 text-xs animate-in fade-in zoom-in duration-200">
                        <p><span className="text-blue-400 font-bold">{t.provider}:</span> {det.p}</p>
                        <p><span className="text-blue-400 font-bold">{t.basis}:</span> {det.b}</p>
                        <p className="mb-2"><span className="text-blue-400 font-bold">{t.step}:</span> {det.s}</p>
                      </div>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); window.open(deal.link, '_blank'); }} className="w-full mt-2 py-2 bg-gray-50 text-blue-600 rounded-xl text-xs font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">{t.apply}</button>
                  </div>
                );
              })
            }
          </div>
        </aside>
        <section className="flex-1 bg-gray-200 relative">
          <Map deals={deals} selectedId={selectedId} />
          <div className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-full shadow-lg text-xs z-10 font-bold">{t.guide}</div>
        </section>
      </main>
    </div>
  );
}