// (상단 코드는 동일하므로 생략, 중간의 리스트 렌더링 부분만 수정된 버전입니다)

// ... (생략)
<div className="space-y-3">
  {loading ? <p className="text-center py-10">데이터를 불러오는 중... 📡</p> :
    deals.map((deal: any) => (
      <div key={deal.id} className="border rounded-lg p-4 hover:shadow-md cursor-pointer bg-white">
        <div className="flex justify-between font-bold">
          {/* destination 대신 name일 경우도 대비 */}
          <span className="text-gray-800">
            {deal.destination || deal.name || "이름 없는 여행지"}
          </span>
          <span className="text-blue-600">
            {(deal.price || 0).toLocaleString()}원
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {deal.description || deal.country || "상세 설명이 없습니다."}
        </p>
      </div>
    ))
  }
</div>
// ... (생략)