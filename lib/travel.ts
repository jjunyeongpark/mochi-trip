export type PlacePhotoData={name:string;authors:{name:string;uri?:string}[]};
export type Place = {id:string;name:string;lat:number;lng:number;category:string;source:'google'|'sample';address?:string;rating?:number;reviewCount?:number;mapsUri?:string;price?:string;photo?:PlacePhotoData;types?:string[];checkedAt?:string;hours?:{open:{day:number;hour:number;minute:number};close?:{day:number;hour:number;minute:number}}[];attributions?:{displayName:string;uri?:string}[]};
export type Settings = {city:string;startDate:string;nights:number;pace:'slow'|'normal'|'busy';budget:'low'|'normal'|'high';interests:string[];transport:'WALK'|'TRANSIT'|'DRIVE';companion:string;hotel:string;hotelId?:string;};
export type Stop = {place:Place;time:string;minutes:number};
export type Day = {date:string;stops:Stop[]};
export type RouteLeg = {from:string;to:string;duration:number;distance:number;polyline?:string;status:'ok'|'unavailable';departure?:string;summary?:string};
export function validateSettings(input:unknown):Settings {
 const s=input as Settings;
 if(!s || typeof s.city!=='string'||!s.city.trim()||s.city.length>60||/[<>\r\n]/.test(s.city))throw Error('여행 지역을 60자 이내로 입력해주세요.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(s.startDate)||isNaN(Date.parse(s.startDate))||new Date(s.startDate).toISOString().slice(0,10)!==s.startDate)throw Error('올바른 여행 날짜를 선택해주세요.');
 if(!Number.isInteger(s.nights)||s.nights<0||s.nights>6)throw Error('여행 기간은 1~7일로 선택해주세요.');
 if(!['slow','normal','busy'].includes(s.pace)||!['low','normal','high'].includes(s.budget)||!['WALK','TRANSIT','DRIVE'].includes(s.transport))throw Error('여행 옵션을 확인해주세요.');
 if(!Array.isArray(s.interests)||s.interests.length>6||s.interests.some(x=>typeof x!=='string'||x.length>20))throw Error('관심사를 확인해주세요.');
 if(typeof s.hotel!=='string'||s.hotel.length>150||typeof s.companion!=='string'||s.companion.length>20)throw Error('숙소와 동행인 정보를 확인해주세요.');
 if(s.hotelId!==undefined&&(typeof s.hotelId!=='string'||!/^[\w-]{5,250}$/.test(s.hotelId)))throw Error('선택한 숙소를 확인해주세요.');
 return {city:s.city.trim(),startDate:s.startDate,nights:s.nights,pace:s.pace,budget:s.budget,interests:s.interests,transport:s.transport,companion:s.companion,hotel:s.hotel.trim(),...(s.hotelId?{hotelId:s.hotelId}:{})};
}
export function distance(a:{lat:number;lng:number},b:{lat:number;lng:number}){const r=Math.PI/180;const x=(b.lng-a.lng)*r*Math.cos((a.lat+b.lat)*r/2);return 6371*Math.sqrt(x*x+((b.lat-a.lat)*r)**2);}
export function openAt(place:Pick<Place,'hours'>,date:string,start:number,duration:number):boolean|undefined{
 if(!place.hours)return undefined;
 const week=7*1440,visit=new Date(date+'T00:00:00Z').getUTCDay()*1440+start;
 return place.hours.some(period=>{if(!period.close)return true;const begin=period.open.day*1440+period.open.hour*60+period.open.minute;let end=period.close.day*1440+period.close.hour*60+period.close.minute;if(end<=begin)end+=week;return [-week,0,week].some(shift=>visit>=begin+shift&&visit+duration<=end+shift);});
}
export function buildDays(places:Place[],settings:Settings,origin?:Place):Day[]{
 const remaining=[...new Map(places.map(p=>[p.id,p])).values()];
 const slots=settings.pace==='slow'?['명소','맛집','카페']:settings.pace==='busy'?['명소','명소','맛집','카페','명소','맛집']:['명소','맛집','명소','카페','맛집'];
 return Array.from({length:settings.nights+1},(_,dayIndex)=>{
  const date=new Date(`${settings.startDate}T00:00:00Z`);date.setUTCDate(date.getUTCDate()+dayIndex);const dateStr=date.toISOString().slice(0,10);
  let last=origin;let clock=9*60+30;let meals=0;const stops:Stop[]=[];
  for(const slot of slots){
   if(slot==='맛집')clock=Math.max(clock,meals?18*60:12*60);
   const minutes=slot==='명소'?75:slot==='맛집'?60:45;
   let candidates=remaining.filter(p=>p.category===slot&&openAt(p,dateStr,clock,minutes)!==false);
   if(!candidates.length){const later=remaining.filter(p=>p.category===slot).flatMap(p=>{for(let t=clock+15;t<=21*60;t+=15)if(openAt(p,dateStr,t,minutes)===true)return [{p,t}];return [];}).sort((a,b)=>a.t-b.t);if(!later.length)continue;clock=later[0].t;candidates=[later[0].p];}
   candidates.sort((a,b)=>last?distance(last,a)-distance(last,b):0);
   const place=candidates[0];remaining.splice(remaining.findIndex(p=>p.id===place.id),1);
   if(slot==='맛집')meals++;
   stops.push({place,time:`${String(Math.floor(clock/60)).padStart(2,'0')}:${String(clock%60).padStart(2,'0')}`,minutes});clock+=minutes+30;last=place;
  }
  return {date:dateStr,stops};
 });
}
export function mapsUrl(place:Place){const u=new URL('https://www.google.com/maps/search/');u.searchParams.set('api','1');u.searchParams.set('query',place.name);if(place.source==='google')u.searchParams.set('query_place_id',place.id);return u.toString();}
export function directionsUrl(places:Place[],mode:string){const u=new URL('https://www.google.com/maps/dir/');u.searchParams.set('api','1');if(!places.length)return 'https://www.google.com/maps';u.searchParams.set('origin',`${places[0].lat},${places[0].lng}`);u.searchParams.set('destination',`${places.at(-1)!.lat},${places.at(-1)!.lng}`);u.searchParams.set('travelmode',mode==='TRANSIT'?'transit':mode==='DRIVE'?'driving':'walking');if(places.length>2&&mode!=='TRANSIT')u.searchParams.set('waypoints',places.slice(1,-1).map(p=>`${p.lat},${p.lng}`).join('|'));return u.toString();}
export function decodePolyline(encoded:string){const points:{lat:number;lng:number}[]=[];let index=0,lat=0,lng=0;while(index<encoded.length){const read=()=>{let result=0,shift=0,b:number;do{if(index>=encoded.length||shift>30)throw Error('Invalid polyline');b=encoded.charCodeAt(index++)-63;if(b<0||b>63)throw Error('Invalid polyline');result|=(b&31)<<shift;shift+=5;}while(b>=32);return result&1?~(result>>1):result>>1;};lat+=read();lng+=read();points.push({lat:lat/1e5,lng:lng/1e5});}return points;}
export function sharePayload(settings:Settings,days:Day[]){return {settings:settings.hotelId?{...settings,hotel:''}:settings,days:days.map(d=>({date:d.date,stops:d.stops.map(s=>({id:s.place.id,source:s.place.source,time:s.time,minutes:s.minutes}))}))};}
export function validatePoint(p:unknown){const v=p as {lat:number;lng:number;id:string};if(!v||!Number.isFinite(v.lat)||!Number.isFinite(v.lng)||v.lat<20||v.lat>46.5||v.lng<122||v.lng>154||typeof v.id!=='string'||v.id.length>250)throw Error('일본 내 장소를 선택해주세요.');return v;}
