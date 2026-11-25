# 모찌트립 구글맵 연결 안내

현재 상태: Google Cloud 프로젝트/결제 계정이 없어 유료 기능은 비활성화되어 있습니다. 지도는 명시된 일러스트, 장소는 예시입니다. 키를 연결하기 전에는 Google API 요금이 발생하지 않습니다. 실제 API 통합 코드는 구현했지만 실제 키로 일본 전역 응답을 검증하지 않았습니다.

## 1. Google Cloud 준비

1. [Google Cloud Console](https://console.cloud.google.com/)에서 모찌트립 전용 프로젝트를 만듭니다.
2. 결제 계정을 연결합니다. 무료 할당량이 있더라도 운영 시 결제 계정이 필요합니다.
3. **Maps JavaScript API**, **Places API (New)**, **Routes API**만 활성화합니다.
4. 키 두 개를 만듭니다. 키를 저장소/GitHub/채팅/스크린샷에 올리지 마세요.

| 환경변수 | 용도 | 제한 |
|---|---|---|
| GOOGLE_MAPS_BROWSER_KEY | 브라우저 지도 표시 | Maps JavaScript API만 허용, 웹사이트 HTTP referrer를 배포된 사이트 도메인으로 제한 |
| GOOGLE_MAPS_SERVER_KEY | 서버의 Places/Routes 요청 | Places API (New), Routes API만 허용. 브라우저에 반환하지 않음 |
| GOOGLE_MAPS_ENABLED | 실제 API 활성화 | 나머지 설정 완료 후 `true` |
| GOOGLE_MAP_ID | 선택 지도 스타일 | 현재 기본 지도에는 필요 없음 |

운영 환경변수는 Sites 런타임 환경변수 도구로 설정합니다. 값은 `.openai/hosting.json`이나 소스에 적지 않습니다. 브라우저용 키는 기술적으로 방문자에게 보이는 공개 키이므로 도메인·API 제한이 필수입니다. 서버용 키는 비밀입니다. Cloudflare 공유 송신 IP 환경에서 무리하게 IP를 고정 등록하지 마세요. 더 강한 서버 인증이 필요하면 지원되는 OAuth 방식 또는 별도 고정 송신 서버를 검토합니다.

## 2. 월 30,000원 예산 보호

앱의 API 예약 한도는 월 **20,000원**, 기타 운영비 여유는 **10,000원**으로 잡았습니다. 서버/도메인/호스팅의 실제 유료 요금제를 자동 구매하거나 설정한 것은 아닙니다. Sites 사용 조건과 실제 청구를 별도 확인해야 합니다.

| 작업 | 1회 예약액 |
|---|---:|
| 장소 검색 | 100원 |
| 장소 상세 재조회 | 60원 |
| 구간 경로 계산 | 25원 |
| 지도 인스턴스 발급 | 25원 |

무료 제공량을 차감하지 않고 보수적으로 계산합니다. D1의 단일 원자적 SQL이 한도 초과 예약을 거부합니다. 월 경계는 한국 시간입니다. 실패한 외부 요청도 예약액을 환급하지 않아 보수적으로 보호합니다. 데이터베이스가 없거나 실패하면 유료 API를 호출하지 않습니다. 1방문자 시간당 45회, 서비스 전체 하루 1,000회 요청 제한도 적용합니다.

**이 값은 실제 Google 청구액이 아니라 앱의 예약장부입니다.** USD 환율·세금·가격 변경·같은 Cloud 계정의 다른 프로젝트·유출된 브라우저 키·앱 외부 호출은 정확히 반영하지 못합니다. 월 30,000원을 절대 초과하지 않는 결제 차단을 보장하지 않습니다.

Google Cloud에서 추가로 다음을 설정해야 합니다.

- 전용 프로젝트의 예산 알림: 15,000원/24,000원/30,000원. 알림만으로 결제가 차단되지 않습니다.
- API별 제공되는 일일/분당 할당량을 작은 값부터 제한합니다. 실제 콘솔이 지원하는 할당량 종류를 확인해야 합니다.
- 처음에는 지도·장소 검색·상세·경로를 각각 하루 약 50회 이하 수준으로 보수적으로 제한하고 실제 청구를 관찰합니다. 해당 API에 일일 제한이 없으면 분당 제한만으로 월 비용이 보장되지 않습니다.
- 앱에서 쓰지 않는 API는 비활성화하고 브라우저 키는 배포 도메인에만 제한합니다.
- 프로덕션 활성화 전 가격표의 SKU와 요청 필드에 따른 과금 등급을 다시 확인합니다. 현재 검색은 평점/리뷰 수 포함으로 Enterprise 등급이 될 수 있습니다.
- 운영자가 즉시 중단할 수 있도록 `GOOGLE_MAPS_ENABLED=false` 스위치를 제공합니다. 이미 로드된 브라우저 지도나 직접 호출은 Google 측 키 비활성화/할당량 변경이 필요할 수 있습니다.

## 3. 실제 연결 후 확인

1. `/api/config`의 `live`가 true인지 확인합니다. 서버 키는 이 응답에 포함되지 않습니다.
2. 도쿄·교토·삿포로·오키나와 등에서 각각 실제 장소 검색을 확인합니다.
3. 도보/대중교통/자동차로 실제 폴리라인과 소요시간을 확인합니다.
4. 경로 없는 구간은 ‘미확인’으로 남는지, 일정 수정 후 이전 경로가 사라지는지 확인합니다.
5. 동일 출발점/도착점, 여러 날 일정, 호텔 출발, 취향별 결과와 비용을 확인합니다.
6. 브라우저 지도 키를 다른 도메인에서 호출하면 거부되는지 확인합니다.

대중교통은 경유지를 지원하지 않으므로 구간별로 계산합니다. 현재 기준 과거 7일~미래 100일의 요청만 받습니다. 지역별 교통 데이터가 없거나 미래 시간표가 바뀌면 경로가 없을 수 있습니다. 실패한 구간 이후는 시간표를 임의로 추정하지 않고 계산을 멈춥니다.

## 저장/개인정보

개인 저장은 브라우저 localStorage에 장소 ID와 사용자 옵션만 기록합니다. Google 장소 이름·좌표·평점·경로는 지속 저장하지 않고 불러올 때 재조회합니다. 찜 역시 ID를 저장하며 해당 여행을 불러오면 세부 내용을 확인할 수 있습니다. 공유는 추측하기 어려운 128비트 URL로 30일간 읽기 전용 보관합니다. 링크를 가진 누구나 볼 수 있으며 작성자의 기기 저장본을 수정하지 않습니다. 숙소 입력 등 사용자 직접 작성 정보는 공유에 포함되므로 민감정보를 적지 마세요.

Google Places의 정책/출처 표기 조건은 공개 전 확인해야 합니다. 현재 리뷰 원문은 수집/인용하지 않고 평점·리뷰 수만 표시합니다. 사진 검색 API는 사용하지 않으며 도시 카드의 사진은 분위기용 외부 이미지입니다. Google 출처 표시를 가리거나 제거하지 마세요.

## 확인한 공식 문서

아래 모두 원문 확인, 조회일 **2026-11-25**입니다.

- [Google Maps 요금표](https://developers.google.com/maps/billing-and-pricing/pricing)
- [비용 관리와 할당량](https://developers.google.com/maps/billing-and-pricing/manage-costs)
- [Places Text Search](https://developers.google.com/maps/documentation/places/web-service/text-search)
- [Routes Compute Routes](https://developers.google.com/maps/documentation/routes/compute_route_directions)
- [대중교통 경로 제약](https://developers.google.com/maps/documentation/routes/transit-route)
- [Maps JavaScript 로딩](https://developers.google.com/maps/documentation/javascript/load-maps-js-api)
- [Maps URL](https://developers.google.com/maps/documentation/urls/get-started)
- [Places 데이터 저장·출처 표기 정책](https://developers.google.com/maps/documentation/places/web-service/policies)
