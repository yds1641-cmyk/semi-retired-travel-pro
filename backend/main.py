from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

latest_deals = [
    {"id": "hk-1", "title": "홍콩 0원 항공권 이벤트", "lat": 22.31, "lng": 114.1, "price": 0, "link": "https://www.cathaypacific.com/"},
    {"id": "tw-1", "title": "대만 럭키랜드 지원금 21만원", "lat": 25.03, "lng": 121.5, "price": 0, "link": "https://5000.taiwan.net.tw/"},
    {"id": "os-1", "title": "오사카 땡처리 5만원대", "lat": 34.69, "lng": 135.5, "price": 55000, "link": "https://www.skyscanner.co.kr/"}
]

@app.get("/deals")
def get_deals(budget: int = 500000):
    return [d for d in latest_deals if d["price"] <= budget]

@app.get("/ai-plan/{deal_id}")
def generate_ai_plan(deal_id: str):
    # 2026년 기준 실시간 교통비 데이터 (택시 vs 최저가)
    transport_db = {
        "홍콩": {"name": "공항버스 A21", "price": "약 5,700원", "taxi": "약 54,000원", "save": "48,300원"},
        "대만": {"name": "타오위안 공항철도", "price": "약 6,800원", "taxi": "약 58,000원", "save": "51,200원"},
        "오사카": {"name": "난카이 공항급행", "price": "약 9,200원", "taxi": "약 175,000원", "save": "165,800원"}
    }
    
    deal = next((d for d in latest_deals if d["id"] == deal_id), latest_deals[0])
    city = "홍콩" if "홍콩" in deal["title"] else ("대만" if "대만" in deal["title"] else "오사카")
    t = transport_db.get(city)

    return {
        "itinerary": [
            {"day": "1일차", "activity": f"{t['name']} 탑승 후 게스트하우스 체크인"},
            {"day": "2일차", "activity": "현지 시장 마감 세일 활용 식비 1만원 챌린지"},
            {"day": "3일차", "activity": "무료 전시관 관람 및 기념품 최저가 구매"}
        ],
        "transport": t,
        # category=4,5,12는 아고다에서 호스텔, 게스트하우스, 민박을 의미하는 필터입니다.
        "booking_link": f"https://www.agoda.com/search?lat={deal['lat']}&lng={deal['lng']}&category=4,5,12"
    }