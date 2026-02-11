'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// 1. 실제 데이터 구조(JSON)에 맞게 인터페이스 수정
interface Deal {
  id: string;
  title: string;
  lat: number;
  lng: number;
  price: number;
  link: string;
}

const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [budget, setBudget] = useState(300000);
  const [language, setLanguage] = useState('ko');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [region, setRegion] = useState('All');
  const [showEventInfo, setShowEventInfo] = useState(false);

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://semi-retired-travel-pro.onrender.com/deals?budget=${budget}&region=${region}`
        );
        const data = await res.json();
        setDeals(data);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchDeals, 300);
    return () => clearTimeout(timeoutId);
  }, [budget, region]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      <header className="flex justify-between items-center p-4 bg-white shadow-sm z-20">
        <h1 className="text-xl font-bold text-blue-600">
          {language === 'ko' ? '✈️ 반백수 여행' : '✈️ Semi-Retired Travel'}
        </h1>
        <div className="flex gap-4 text-2xl">
          <button onClick={() => setLanguage(l => l === 'ko' ? 'en' : 'ko')}>🌐</button>
          <button onClick={() => setIsSettingsOpen(true)}>⚙️</button>
        </div>
      </header>

      {/* 설정 모달 */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-xs">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">⚙️ 설정</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">선호 지역</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full p-2 border rounded bg-white">
                <option value="All">🌏 전 세계</option>
                <option value="Asia">아시아</option>
                <option value="Europe">유럽</option>
              </select>
            </div>
            <button onClick={() => setIsSettingsOpen(false)} className="w-full bg-blue-600 text-white py-2 rounded font-bold">확인</button>
          </div>
        </div>
      )}

      <main className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <aside className="w-full lg:w-[400px] bg-white p-5 overflow-y-auto shadow-lg z-10">

          {/* 홍콩 0원 배너 (마우스 오버 시 상세 설명) */}
          <div
            className="relative bg-gradient-to-r from-red-500 to-purple-600 text-white p-4 rounded-xl mb-6 cursor-pointer"
            onMouseEnter={() => setShowEventInfo(true)}
            onMouseLeave={() => setShowEventInfo(false)}
            onClick={() => window.open('https://www.cathaypacific.com/', '_blank')}
          >
            <h3 className="font-bold">🇭🇰 홍콩 0원 항공권!</h3>
            <p className="text-sm opacity-90">선착순 혜택 받으러 가기 👉</p>
            {showEventInfo && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white text-gray-800 p-3 rounded-lg shadow-xl border text-xs z-50">
                <p><strong>🎁 제공처:</strong> 홍콩국제공항 (World of Winners)</p>
                <p><strong>📝 근거:</strong> 관광 활성화 캠페인</p>
                <p><strong>🚀 절차:</strong> 클릭 → 사이트 접속 → 응모</p>
              </div>
            )}
          </div>

          <div className="bg-gray-100 p-5 rounded-xl mb-6">
            <div className="flex justify-between mb-2 font-bold text-sm">
              <span>💰 나의 생존 예산</span>
              <span className="text-blue-600">{budget.toLocaleString()}원</span>
            </div>
            <input type="range" min="0" max="500000" step="10000" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full h-2 accent-blue-600" />
          </div>

          <div className="space-y-3">
            {loading ? <p className="text-center py-10">데이터 로딩 중...</p> :
              deals.map((deal) => (
                <div
                  key={deal.id}
                  className="border rounded-lg p-4 hover:border-blue-500 transition-colors bg-white shadow-sm"
                  onClick={() => setSelectedId(deal.id)}
                >
                  <div className="flex justify-between font-bold text-base mb-1">
                    <span className="text-gray-800">{deal.title}</span>
                    <span className="text-blue-600 text-sm">{deal.price.toLocaleString()}원</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); window.open(deal.link, '_blank'); }}
                    className="text-xs text-blue-500 hover:underline mt-2 inline-block"
                  >
                    🔗 혜택 확인/신청하러 가기
                  </button>
                </div>
              ))
            }
          </div>
        </aside>

        <section className="flex-1 bg-gray-200 relative">
          <Map deals={deals} selectedId={selectedId} />
        </section>
      </main>
    </div>
  );
}