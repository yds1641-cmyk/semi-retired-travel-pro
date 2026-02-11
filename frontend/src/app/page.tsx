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

// 지도는 클라이언트에서만 로드
const Map = dynamic(() => import('../components/Map'), { ssr: false });

// ★ 중요: export default 가 반드시 있어야 배포 에러가 나지 않습니다.
export default function Home() {
  // --- 상태 관리 ---
  const [deals, setDeals] = useState<Deal[]>([]);
  const [budget, setBudget] = useState(300000);
  const [language, setLanguage] = useState('ko');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null); // 마우스 오버 감지

  const [region, setRegion] = useState('All');

  // --- 데이터 불러오기 ---
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

  // --- 상세 정보 생성기 (홍콩, 대만, 오사카 등) ---
  const getDetailInfo = (id: string) => {
    const details: Record<string, { provider: string; basis: string; step: string }> = {
      'hk-1': { provider: '홍콩공항청', basis: '관광객 유치 캠페인', step: '사이트 접속 후 응모' },
      'tw-1': { provider: '대만 관광청', basis: '자유여행객 추첨 지원금', step: '입국 전 온라인 신청' },
      'os-1': { provider: 'LCC 땡처리', basis: '출발 임박 특가', step: '예약 사이트 즉시 결제' },
    };
    return details[id] || { provider: '현지 관광청/항공사', basis: '특가 프로모션', step: '상세 링크 확인' };
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      {/* === 상단바 === */}
      <header className="flex justify-between items-center p-4 bg-white shadow-md z-30">
        <h1 className="text-xl font-bold text-blue-600">
          {language === 'ko' ? '✈️ 반백수 여행' : '✈️ Semi-Retired Travel'}
        </h1>
        <div className="flex gap-5 items-center">
          {/* 지구 모양(언어) 버튼 */}
          <button
            onClick={() => setLanguage(l => l === 'ko' ? 'en' : 'ko')}
            className="text-2xl hover:scale-110 transition-transform"
            title="언어 변경"
          >
            🌐
          </button>
          {/* 설정 버튼 */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="text-2xl hover:scale-110 transition-transform"
            title="환경 설정"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* === 설정 모달 === */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-xs border border-gray-100">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <span>⚙️</span> {language === 'ko' ? '환경 설정' : 'Settings'}
            </h2>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-gray-600">선호 지역</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="All">🌏 전 세계</option>
                <option value="Asia">아시아</option>
                <option value="Europe">유럽</option>
              </select>
            </div>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              {language === 'ko' ? '설정 완료' : 'Done'}
            </button>
          </div>
        </div>
      )}

      <main className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* === 사이드바 === */}
        <aside className="w-full lg:w-[420px] bg-white p-5 overflow-y-auto shadow-inner z-10 border-r border-gray-100">

          <div className="bg-blue-50 p-5 rounded-2xl mb-6 border border-blue-100">
            <div className="flex justify-between mb-3 font-bold text-sm text-blue-800">
              <span>💰 나의 생존 예산</span>
              <span className="text-blue-600 text-lg">{budget.toLocaleString()}원</span>
            </div>
            <input
              type="range"
              min="0"
              max="500000"
              step="10000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="space-y-4">
            <h2 className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-2">오늘의 초저가 추천</h2>
            {loading ? <div className="text-center py-10 animate-pulse">📡 데이터를 동기화 중입니다...</div> :
              deals.map((deal) => {
                const info = getDetailInfo(deal.id);
                return (
                  <div
                    key={deal.id}
                    className="relative border border-gray-100 rounded-2xl p-4 hover:border-blue-300 hover:shadow-lg transition-all bg-white cursor-pointer group"
                    onMouseEnter={() => setHoveredId(deal.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => setSelectedId(deal.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-800 text-lg">{deal.title}</span>
                      <span className="bg-green-100 text-green-700 text-xs font-black px-2 py-1 rounded-lg">
                        {deal.price === 0 ? 'FREE' : `${deal.price.toLocaleString()}원`}
                      </span>
                    </div>

                    {/* 마우스 오버 시 나타나는 간략 설명창 (대만, 오사카 포함 모든 항목 적용) */}
                    {hoveredId === deal.id && (
                      <div className="absolute left-0 right-0 top-0 -translate-y-[105%] bg-gray-900 text-white p-4 rounded-2xl shadow-2xl z-50 text-xs leading-relaxed animate-in fade-in zoom-in duration-200">
                        <p className="mb-1"><span className="text-blue-400 font-bold">🏢 제공:</span> {info.provider}</p>
                        <p className="mb-1"><span className="text-blue-400 font-bold">📜 근거:</span> {info.basis}</p>
                        <p className="mb-2"><span className="text-blue-400 font-bold">🚀 절차:</span> {info.step}</p>
                        <div className="text-[10px] text-gray-400 border-t border-gray-700 pt-2 font-light">
                          * 클릭 시 공식 신청/예약 페이지로 이동합니다.
                        </div>
                      </div>
                    )}

                    <button
                      onClick={(e) => { e.stopPropagation(); window.open(deal.link, '_blank'); }}
                      className="w-full mt-3 py-2 bg-gray-50 text-blue-600 rounded-xl text-xs font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors"
                    >
                      상세 혜택 확인 및 신청하기
                    </button>
                  </div>
                );
              })
            }
          </div>
        </aside>

        {/* === 지도 영역 === */}
        <section className="flex-1 bg-gray-100 relative">
          <Map deals={deals} selectedId={selectedId} />
        </section>
      </main>
    </div>
  );
}