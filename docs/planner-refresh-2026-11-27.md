# 포근트립 일정·지도 개선

## 반영 범위

- 원본에서 프레임별 재분리한 투명 캐릭터 두 개를 네이티브 WebP로 재생합니다. 기존 실시간 색상 제거는 활성 화면에서 사용하지 않습니다.
- 모바일은 지도와 사진 시간표를 함께 표시하며 지도 영역이 스크롤에 고정됩니다. 장소 선택은 사이트 안의 핀 강조와 상세 화면으로 연결됩니다.
- 날짜마다 고유 색상을 쓰고 선택 날짜/전체 날짜의 실제 Google 경로를 표시합니다. 미확인 이동은 30분을 가정한 예상으로 명시하며 가짜 실제 경로를 생성하지 않습니다.
- 숙박 지역 안내와 실제 Google 숙소 검색을 제공합니다. 선택한 숙소는 매일 출발·복귀 지점이 됩니다. 가격·예약 가능 여부는 제공하지 않습니다.
- 일본 지역 전체의 호버·키보드 포커스·클릭 강조, 여섯 도시(삿포로·나하 포함), 네 가지 테마와 다섯 메뉴를 제공합니다.
- Google 장소 사진과 제공자 출처를 표시합니다. 사진 누락/실패 시 관련 카테고리 대체 화면으로 유지합니다.

## 검증

- 기존 baseline 19개 테스트 통과.
- 신규 회귀 사례의 실패를 확인한 뒤 수정했습니다. 최종 전체 테스트 40/40, TypeScript 오류 없음.
- 390×844 모바일: 가로 넘침 없음, 고정 지도와 일정 동시 표시, 일정 선택과 핀 선택 일치 확인.
- 실제 시간 입력 위젯의 키보드 조작 → 시간표 갱신 → 저장 → 저장 여행 복원 후 10:30 유지 확인.
- 전체 날짜의 서로 다른 세 가지 색상, 숙박 지역 안내, 1440px PC에서 간사이 전체 7개 도도부현 강조와 여섯 도시 표시 확인.
- 독립 코드 검토의 중요 사항 4개(도시 변경 시 숙소 초기화, 전체 보기 갱신, 출발시각 보존, 기존 숙소 ID 승격)를 회귀 테스트로 수정했습니다. 도시-지역 강조 불일치도 브라우저에서 재현 후 수정·검증했습니다.
- 사진 프록시 입력·크기·외부 호스트 차단, 별도 사진 요청 한도, 서버 키 비노출, 숙소 복귀 포함 9개 경로 지점, ID만 저장하는 공유를 테스트했습니다.
- 공개 범위, 기존 사이트 project_id, D1 스키마, 월 비용 보호 상한은 유지합니다. 사진 요청도 비용 보호에 포함됩니다.

## 자료와 출처

조회일: 2026-11-27. 다음 원문/데이터를 직접 확인했습니다.

- Google 장소 사진과 사진 제공자 표시: https://developers.google.com/maps/documentation/places/web-service/place-photos
- 숙소 검색·유형: https://developers.google.com/maps/documentation/places/web-service/text-search / https://developers.google.com/maps/documentation/places/web-service/place-types
- Google 제공 콘텐츠의 저장·출처 정책: https://developers.google.com/maps/documentation/places/web-service/policies
- 일본 지도 데이터: https://github.com/dataofjapan/land/blob/master/japan.geojson (d3-geo로 투영한 기존 승인 시안의 도도부현 윤곽)
- 삿포로·나하 카드의 사진은 지역 분위기용 여행 이미지이며 특정 장소의 실사라고 표시하지 않습니다. 출처: https://images.unsplash.com/photo-1485594050903-8e8ee7b071a8 / https://images.unsplash.com/photo-1507525428034-b723cf961d3e
