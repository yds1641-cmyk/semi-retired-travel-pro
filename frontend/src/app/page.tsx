'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';

// 지도는 브라우저에서만 로드되도록 설정
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-800 animate-pulse" />
});

export default function Home() {
  const [deals, setDeals] = useState<any[]>([]);
  const [budget, setBudget] = useState(300000);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [aiPlan, setAiPlan] = useState<any>(null);

  // 데이터 불러오기
  useEffect(() => {
    fetch(`https://semi-retired-travel-pro.onrender.com/deals?budget=${budget}`)
      .then(res => res.json())
      .then(data => setDeals(data || []))
      .catch(err => console.error("백엔드 연결 확인 필요:", err));
  }, [budget]);

  const handleDealClick = (deal: any) => {
    if (selectedId === deal.id) {
      setSelectedId(null);
      setAiPlan(null);
      return;
    }
    setSelectedId(deal.id);
    fetch(`https://semi-retired-travel-pro.onrender.com/ai-plan/${deal.id}`)
      .then(res => res.json())
      .then(data => setAiPlan(data))
      .catch(err => console.error("AI 동선 로딩 실패:", err));
  };

  return (
    <main className="flex flex-col lg:flex-row h-screen w-full overflow-hidden bg-slate-900 font-sans">

      {/* 🛠️ 사이드바 (PC 좌측 고정) */}
      <div className="w-full lg:w-[450px] h-1/2 lg:h-full bg-slate-800 z-10 flex flex-col border-r border-slate-700 order-last lg:order-first">

        {/* ✅ 요청하신 새 디자인 헤더 */}
        <div className="p-7 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 shadow-2xl text-white shrink-0">
          <div className="flex flex-col gap-2">
            {/* 메인: 놀면 뭐해 여행이나 가자!! */}
            <h1 className="text-2xl lg:text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500">
              놀면 뭐해 여행이나 가자!!
            </h1>
            {/* 서브: 🎁반백수✈️거의 무료여행 (위치 이동 및 크기 확대) */}
            <p className="text-base lg:text-lg font-bold text-white/90 tracking-tight">
              🎁반백수✈️거의 무료여행
            </p>
          </div>
        </div>

        {/* 예산 필터 */}
        <div className="p-5 bg-slate-900/40 border-b border-slate-700 shrink-0">
          <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
            <span>나의 생존 예산</span>
            <span className="text-yellow-400 font-black">{budget.toLocaleString()}원</span>
          </div>
          <input
            type="range" min="0" max="300000" step="10000" value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full h-2 accent-orange-500 cursor-pointer"
          />
        </div>

        {/* 특가 리스트 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {deals.length > 0 ? deals.map((deal: any) => (
            <div key={deal.id} className="space-y-2">
              <div
                onClick={() => handleDealClick(deal)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedId === deal.id ? 'border-orange-500 bg-orange-950/20' : 'bg-slate-700/40 border-slate-600 hover:border-blue-500'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] bg-blue-900 text-blue-200 px-2 py-0.5 rounded-full font-bold uppercase">{deal.category || '특가'}</span>
                  <span className="text-[10px] text-blue-400 font-bold">{selectedId === deal.id ? '닫기 ▲' : '정보보기 ▼'}</span>
                </div>
                <h3 className="font-bold text-sm text-white leading-tight">{deal.title}</h3>
                <p className="text-orange-400 font-black mt-2 text-lg">{deal.price_text || '0원 ~'}</p>
              </div>

              {/* 🤖 AI 계획 섹션 (안전장치 적용) */}
              {selectedId === deal.id && aiPlan && (
                <div className="p-5 bg-slate-900 border border-orange-500/50 rounded-2xl space-y-5">
                  {/* 교통비 비교 (Optional Chaining 적용으로 에러 방지) */}
                  {aiPlan.transport && (
                    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                      <div className="grid grid-cols-2 bg-slate-700/50 p-2 text-[10px] font-bold text-slate-400 text-center">
                        <span>일반 택시 요금</span>
                        <span className="text-orange-400">{aiPlan.transport.name}</span>
                      </div>
                      <div className="grid grid-cols-2 p-3 text-center items-center">
                        <span className="text-xs text-slate-500 line-through">{aiPlan.transport.taxi}</span>
                        <span className="text-sm font-black text-white">{aiPlan.transport.price}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 border-l-2 border-slate-700 pl-3">
                    {aiPlan.itinerary?.map((s: any, i: number) => (
                      <div key={i} className="text-[11px] text-slate-300"><span className="text-blue-500 font-bold mr-2">{s.day}</span>{s.activity}</div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2">
                    <a href={deal.link} target="_blank" className="block w-full py-3 bg-gradient-to-r from-orange-600 to-yellow-600 text-white text-center rounded-xl font-black text-xs">🚀 0원 혜택 받으러 가기</a>
                    <a href={aiPlan.booking_link} target="_blank" className="block w-full py-3 bg-slate-700 text-white text-center rounded-xl font-bold text-xs border border-slate-600">🏠 게스트하우스 예약 (아고다)</a>
                  </div>
                </div>
              )}
            </div>
          )) : (
            <div className="text-center py-10 text-slate-500 text-xs italic">데이터를 불러오는 중입니다...</div>
          )}
        </div>
      </div>

      {/* 🗺️ 지도 영역 */}
      <div className="flex-1 h-1/2 lg:h-full relative">
        <Map deals={deals} selectedId={selectedId} />
      </div>
    </main>
  );
}