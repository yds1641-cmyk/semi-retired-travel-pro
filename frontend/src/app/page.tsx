'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// 1. 데이터 형식 정의
interface Deal {
  id: number;
  destination: string;
  country: string;
  price: number;
  description: string;
}

const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [budget, setBudget] = useState(300000);
  const [language, setLanguage] = useState('ko');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 에러 해결의 핵심: selectedId 상태 추가
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [region, setRegion] = useState('All');
  const [country, setCountry] = useState('All');
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [showEventInfo, setShowEventInfo] = useState(false);

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://semi-retired-travel-pro.onrender.com/deals?budget=${budget}&region=${region}&country=${country}`
        );
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setDeals(data);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchDeals();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [budget, region, country]);

  const toggleLanguage = () => setLanguage((p) => (p === 'ko' ? 'en' : 'ko'));
  const handleEventClick = () => window.open('https://flights.cathaypacific.com/ko_KR/offers/world-of-winners.html', '_blank');

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      <header className="flex justify-between items-center p-4 bg-white shadow-sm z-20">
        <h1 className="text-xl font-bold text-blue-600">
          {language === 'ko' ? '✈️ 반백수 여행' : '✈️ Semi-Retired Travel'}
        </h1>
        <div className="flex gap-4">
          <button onClick={toggleLanguage} className="p-2 text-2xl">🌐</button>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-2xl">⚙️</button>
        </div>
      </header>

      {/* 설정 모달 */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-80">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">⚙️ 환경 설정</h2>
            <div className="mb-4">
              <label className="block text-sm mb-1">선호 지역</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full p-2 border rounded">
                <option value="All">🌏 전 세계</option>
                <option value="Asia">아시아</option>
                <option value="Europe">유럽</option>
              </select>
            </div>
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm">🔔 알림 설정</span>
              <input type="checkbox" checked={alarmEnabled} onChange={(e) => setAlarmEnabled(e.target.checked)} className="w-5 h-5 accent-blue-600" />
            </div>
            <button onClick={() => setIsSettingsOpen(false)} className="w-full bg-blue-600 text-white py-2 rounded">저장 후 닫기</button>
          </div>
        </div>
      )}

      <main className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <aside className="w-full lg:w-[400px] bg-white p-5 overflow-y-auto shadow-lg z-10">
          {/* 홍콩 배너 */}
          <div
            className="relative bg-gradient-to-r from-red-500 to-purple-600 text-white p-4 rounded-xl mb-6 cursor-pointer shadow-md"
            onMouseEnter={() => setShowEventInfo(true)}
            onMouseLeave={() => setShowEventInfo(false)}
            onClick={handleEventClick}
          >
            <h3 className="font-bold text-lg">🇭🇰 홍콩 0원 항공권!</h3>
            <p className="text-sm opacity-90">선착순 혜택 받으러 가기 👉</p>
            {showEventInfo && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white text-gray-800 p-3 rounded-lg shadow-xl border text-xs z-50">
                <p><strong>🎁 제공처:</strong> 홍콩국제공항</p>
                <p><strong>🚀 절차:</strong> 클릭 후 이벤트 응모</p>
              </div>
            )}
          </div>

          {/* 예산 슬라이더 */}
          <div className="bg-gray-100 p-5 rounded-xl mb-6">
            <div className="flex justify-between mb-2 font-bold">
              <span>💰 나의 생존 예산</span>
              <span className="text-blue-600">{budget.toLocaleString()}원</span>
            </div>
            <input type="range" min="0" max="500000" step="10000" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full h-2 accent-blue-600" />
          </div>

          {/* 목록 */}
          <div className="space-y-3">
            {loading ? <p className="text-center py-10 animate-pulse">데이터를 불러오는 중... 📡</p> :
              deals.map((deal) => (
                <div key={deal.id} className="border rounded-lg p-4 hover:shadow-md cursor-pointer">
                  <div className="flex justify-between font-bold">
                    <span>{deal.destination}</span>
                    <span className="text-blue-600">{deal.price.toLocaleString()}원</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{deal.description}</p>
                </div>
              ))
            }
          </div>
        </aside>

        {/* 지도 영역 - selectedId를 추가로 보내줍니다 */}
        <section className="flex-1 bg-gray-200 relative">
          <Map deals={deals} selectedId={selectedId} />
        </section>
      </main>
    </div>
  );
}