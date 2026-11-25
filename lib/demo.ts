import { buildDays, type Place, type Settings } from './travel';
export const CITY_DATA=[
 {name:'도쿄',en:'TOKYO',tag:'반짝이는 도시 산책',emoji:'🗼',color:'pink',image:'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=85'},
 {name:'교토',en:'KYOTO',tag:'천천히 머무는 골목',emoji:'⛩️',color:'green',image:'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=85'},
 {name:'오사카',en:'OSAKA',tag:'맛있는 순간 수집',emoji:'🍡',color:'yellow',image:'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=800&q=85'},
 {name:'후쿠오카',en:'FUKUOKA',tag:'가볍게 떠나는 휴식',emoji:'🍜',color:'blue',image:'https://images.unsplash.com/photo-1575862924838-c166e3814df7?auto=format&fit=crop&w=800&q=85'},
];
const list:Record<string,[string,number,number,string][]>= {
 '도쿄':[['센소지',35.7148,139.7967,'명소'],['아사쿠사 점심 장소',35.7115,139.7934,'맛집'],['스미다 공원',35.7135,139.8012,'명소'],['강변 카페',35.7118,139.8002,'카페'],['우에노 저녁 장소',35.7105,139.777,'맛집'],['우에노 공원',35.7153,139.773,'명소'],['우에노 점심 장소',35.7101,139.775,'맛집'],['도쿄 국립박물관',35.7188,139.7765,'명소'],['공원 근처 카페',35.714,139.774,'카페'],['도쿄역 저녁 장소',35.6812,139.7671,'맛집'],['메이지 신궁',35.6764,139.6993,'명소'],['하라주쿠 점심 장소',35.6703,139.703,'맛집'],['요요기 공원',35.6717,139.6949,'명소'],['오모테산도 카페',35.6655,139.712,'카페'],['시부야 저녁 장소',35.6595,139.7004,'맛집']],
 '교토':[['기요미즈데라',34.9949,135.785,'명소'],['히가시야마 점심 장소',34.998,135.781,'맛집'],['니넨자카',34.9983,135.7808,'명소'],['기온 카페',35.001,135.778,'카페'],['기온 저녁 장소',35.003,135.777,'맛집'],['후시미 이나리 신사',34.9671,135.7727,'명소'],['후시미 점심 장소',34.969,135.769,'맛집'],['도후쿠지',34.976,135.774,'명소'],['교토역 카페',34.986,135.759,'카페'],['교토역 저녁 장소',34.9858,135.7588,'맛집']],
 '오사카':[['오사카성',34.6873,135.5262,'명소'],['모리노미야 점심 장소',34.681,135.534,'맛집'],['나카노시마 공원',34.6938,135.506,'명소'],['기타하마 카페',34.69,135.506,'카페'],['도톤보리 저녁 장소',34.6687,135.501,'맛집'],['신세카이',34.6525,135.5063,'명소'],['덴노지 점심 장소',34.648,135.513,'맛집'],['덴노지 공원',34.65,135.509,'명소'],['난바 카페',34.663,135.501,'카페'],['난바 저녁 장소',34.665,135.5,'맛집']],
 '후쿠오카':[['오호리 공원',33.5865,130.3766,'명소'],['오호리 점심 장소',33.589,130.378,'맛집'],['마이즈루 공원',33.5856,130.383,'명소'],['다이묘 카페',33.588,130.394,'카페'],['덴진 저녁 장소',33.59,130.399,'맛집'],['구시다 신사',33.593,130.4109,'명소'],['하카타 점심 장소',33.59,130.418,'맛집'],['캐널시티 하카타',33.5898,130.4115,'명소'],['나카스 카페',33.593,130.406,'카페'],['나카스 저녁 장소',33.592,130.406,'맛집']],
};
export function demoPlaces(city:string):Place[]{return (list[city]||list['도쿄']).map(([name,lat,lng,category],i)=>({id:`sample-${city}-${i}`,name,lat,lng,category,source:'sample',address:category==='명소'?`${city} · 체험용 장소 정보`:'예시 슬롯 · 실제 가게 추천이 아닙니다.'}));}
export function sampleTrip(settings:Settings){const city=list[settings.city]?settings.city:'도쿄';const places=demoPlaces(city);return {settings:{...settings,city},days:buildDays(places,{...settings,city}),places};}
export const DEFAULT_SETTINGS:Settings={city:'도쿄',startDate:'2026-12-01',nights:2,pace:'normal',budget:'normal',interests:['명소','맛집','카페'],transport:'TRANSIT',companion:'친구',hotel:''};
