'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// 지도는 클라이언트 사이드에서만 로딩 (에러 방지)
const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
  // --- 1. 상태 관리 (State) ---
  const [deals, setDeals] = useState([]);
  const [budget, setBudget] = useState(300000); // 기본 30만원
  const [language, setLanguage] = useState('ko'); // 언어 설정 (ko/en)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // 설정창 열기/닫기
  const [loading, setLoading] = useState(false);

  // 설정 메뉴 상태
  const [region, setRegion] = useState('All'); // 선호 지역
  const [country, setCountry] = useState('All'); // 선호 국가
  const [alarmEnabled, setAlarmEnabled] = useState(false); // 알림 설정

  // 홍콩 이벤트 툴팁 상태
  const [showEventInfo, setShowEventInfo] = useState(false);

  // --- 2. 데이터 가져오기 (백엔드 통신) ---
  // 예산, 지역, 국가가 바뀔 때마다 자동으로 실행됩니다.
  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      try {
        // 백엔드 주소 (Render) + 검색 조건 쿼리
        // 주의: 백엔드가 region/country 필터링을 아직 지원 안 하면 무시하고 전체를 줄 수 있습니다.
        const res = await fetch(
          `https://semi-retired-travel-pro.onrender.com/deals?budget=${budget}&region=${region}&country=${country}`
        );
        const data = await res.json();
        setDeals(data);
      } catch (error) {
        console.error('여행지 불러오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    // 디바운싱 (슬라이더 과부하 방지): 0.3초 멈추면 요청
    const timeoutId = setTimeout(() => {
      fetchDeals();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [budget, region, country]);

  // --- 3. 이벤트 핸들러 ---
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBudget(Number(e.target.value)); // 슬라이드 즉시 반영
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ko' ? 'en' : 'ko'));
  };

  const handleEventClick = () => {
    // 실제 예약 사이트로 이동 (새 창)
    window.open('https://flights.cathaypacific.com/ko_KR/offers/world-of-winners.html', '_blank');
  };

  // --- 4. 화면 구성 (UI) ---
  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* === 상단 네비게이션 바 === */}
      <header className="flex justify-between items-center p-4 bg-white shadow-sm z-20">
        <h1 className="text-xl font-bold text-blue-600">
          {language === 'ko' ? '✈️ 반백수 여행' : '✈️ Semi-Retired Travel'}
        </h1>
        <div className="flex gap-4">
          {/* 언어 변경 버튼 */}
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-full hover:bg-gray-100 text-2xl"
            title="언어 변경 / Change Language"
          >
            🌐
          </button>
          {/* 설정 메뉴 버튼 */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100 text-2xl"
            title="설정 / Settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* === 설정 모달창 (팝업) === */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-80">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">⚙️ 환경 설정</h2>

            {/* 1. 선호 지역 */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">선호 지역</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="All">🌏 전 세계 (World)</option>
                <option value="Asia">동남아/아시아</option>
                <option value="Europe">유럽</option>
                <option value="NorthAmerica">북미</option>
                <option value="SouthAmerica">남미</option>
                <option value="Africa">아프리카</option>
              </select>
            </div>

            {/* 2. 선호 국가 */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">선호 국가</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="All">🏳️ 전체 국가</option>
                <option value="Japan">일본</option>
                <option value="China">중국</option>
                <option value="Vietnam">베트남</option>
                <option value="UK">영국</option>
                <option value="USA">미국</option>
              </select>
            </div>

            {/* 3. 알림 설정 */}
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-medium">🔔 초저가 알림 받기</span>
              <input
                type="checkbox"
                checked={alarmEnabled}
                onChange={(e) => setAlarmEnabled(e.target.checked)}
                className="w-5 h-5 accent-blue-600"
              />
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              저장 및 닫기
            </button>
          </div>
        </div>
      )}

      {/* === 메인 콘텐츠 === */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

        {/* 사이드바 (컨트롤 패널) */}
        <div className="w-full lg:w-[450px] bg-white p-5 overflow-y-auto shadow-lg z-10">

          {/* === 홍콩 0원 항공권 이벤트 배너 === */}
          <div
            className="relative bg-gradient-to-r from-red-500 to-purple-600 text-white p-4 rounded-xl mb-6 cursor-pointer shadow-md transform hover:scale-105 transition-transform"
            onMouseEnter={() => setShowEventInfo(true)}
            onMouseLeave={() => setShowEventInfo(false)}
            onClick={handleEventClick}
          >
            <h3 className="font-bold text-lg">🇭🇰 홍콩 왕복 0원!</h3>
            <p className="text-sm opacity-90">선착순 혜택 받으러 가기 👉</p>

            {/* 마우스 오버 시 뜨는 설명창 (툴팁) */}
            {showEventInfo && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white text-gray-800 p-3 rounded-lg shadow-xl border border-gray-200 text-xs z-50">
                <p><strong>🎁 제공처:</strong> 홍콩국제공항 (World of Winners)</p>
                <p><strong>📝 근거:</strong> 관광 활성화 캠페인 무료 배포</p>
                <p><strong>🚀 절차:</strong> 클릭 → 사이트 접속 → 회원가입 → 퀴즈 풀고 응모</p>
                <p className="mt-2 text-blue-600 font-bold text-center border-t pt-1">
                  클릭해서 예약하러 가기
                </p>
              </div>
            )}
          </div>

          {/* === 나의 생존 예산 슬라이더 === */}
          <div className="bg-gray-100 p-5 rounded-xl mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="font-bold text-gray-700">
                💰 {language === 'ko' ? '나의 생존 예산' : 'My Budget'}
              </label>
              <span className="text-blue-600 font-bold text-lg">
                {budget.toLocaleString()}원
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="500000" // 50만원까지 확장
              step="10000"
              value={budget}
              onChange={handleBudgetChange}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0원</span>
              <span>25만원</span>
              <span>50만원</span>
            </div>
          </div>

          {/* 여행지 목록 */}
          <h2 className="text-lg font-bold mb-3 border-b pb-2">
            🏝️ {region === 'All' ? '추천 여행지' : `${region} 여행지`} ({deals.length}곳)
          </h2>

          {loading ? (
            <p className="text-center text-gray-500 py-10 animate-pulse">
              데이터를 불러오는 중입니다... 📡
            </p>
          ) : (
            <div className="space-y-3 pb-20">
              {deals.map((deal: any) => (
                <div key={deal.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{deal.destination}</h3>
                      <p className="text-sm text-gray-500">{deal.country}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      {deal.price.toLocaleString()}원~
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {deal.description}
                  </p>
                </div>
              ))}
              {deals.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  <p>이 예산으로 갈 수 있는 곳이 없네요 😭</p>
                  <p className="text-sm mt-1">예산을 조금만 더 올려보세요!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 지도 영역 */}
        <div className="flex-1 relative h-[50vh] lg:h-auto bg-gray-200">
          <Map deals={deals} />
          {/* 지도 위 안내 문구 */}
          <div className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-full shadow-lg text-sm z-10 backdrop-blur-sm">
            🖱️ 지도를 움직여서 {region === 'All' ? '전 세계' : region} 여행지를 찾아보세요!
          </div>
        </div>
      </div>
    </div>
  );
}