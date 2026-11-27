import { validatePoint, type Place, type RouteLeg } from './travel.ts';
export type GoogleEnv={GOOGLE_MAPS_ENABLED?:string;GOOGLE_MAPS_BROWSER_KEY?:string;GOOGLE_MAPS_SERVER_KEY?:string;GOOGLE_MAP_ID?:string};
export function googleReady(env:GoogleEnv){return env.GOOGLE_MAPS_ENABLED==='true'&&Boolean(env.GOOGLE_MAPS_SERVER_KEY&&env.GOOGLE_MAPS_BROWSER_KEY);}
export function normalizePlace(p:any):Place {
 const point={id:p.id,lat:p.location?.latitude,lng:p.location?.longitude};validatePoint(point);
 const country=p.addressComponents?.find((c:any)=>c.types?.includes('country'));if(country&&country.shortText!=='JP')throw Error('일본 외 지역입니다.');
 const types:string[]=p.types??[];const category=types.some(t=>['lodging','hotel','hostel','japanese_inn','guest_house','resort_hotel','inn','motel','bed_and_breakfast','budget_japanese_inn'].includes(t))?'숙소':types.some(t=>['cafe','coffee_shop','tea_house'].includes(t))?'카페':types.some(t=>['restaurant','ramen_restaurant','sushi_restaurant','meal_takeaway','food'].includes(t))?'맛집':'명소';
 const photo=p.photos?.find((photo:any)=>typeof photo.name==='string'&&validPhotoName(photo.name));
 return {...point,name:p.displayName?.text||p.formattedAddress||'이름 미확인',address:p.formattedAddress,category,source:'google',rating:p.rating,reviewCount:p.userRatingCount,mapsUri:safeProviderUrl(p.googleMapsUri),types,hours:p.regularOpeningHours?.periods,checkedAt:new Date().toISOString(),photo:photo?{name:photo.name,authors:(photo.authorAttributions??[]).filter((a:any)=>typeof a.displayName==='string').map((a:any)=>({name:a.displayName,uri:safeProviderUrl(a.uri)}))}:undefined,attributions:p.attributions?.map((a:any)=>({displayName:a.provider||a.displayName,uri:safeProviderUrl(a.providerUri||a.uri)})).filter((a:any)=>a.displayName)};
}
function safeProviderUrl(value:unknown):string|undefined{if(typeof value!=='string')return;try{const url=new URL(value);return url.protocol==='https:'?url.href:undefined;}catch{return;}}
export function validPhotoName(name:string){return typeof name==='string'&&name.length<=3500&&/^places\/[\w-]{1,250}\/photos\/[\w-]{1,3200}$/.test(name);}
const placeFields='id,displayName,formattedAddress,location,types,googleMapsUri,rating,userRatingCount,addressComponents,attributions,regularOpeningHours,photos';
async function googleJson(url:string,key:string,fields:string,body?:unknown,fetcher:typeof fetch=fetch){
 const response=await fetcher(url,{method:body?'POST':'GET',headers:{'Content-Type':'application/json','X-Goog-Api-Key':key,'X-Goog-FieldMask':fields},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw Error(response.status===429?'구글 서비스 사용량 한도에 도달했습니다.':'구글 연결을 확인할 수 없습니다. 잠시 후 다시 시도해주세요.');
 return response.json() as Promise<any>;
}
export async function searchPlaces(key:string,query:string){const data=await googleJson('https://places.googleapis.com/v1/places:searchText',key,placeFields.split(',').map(f=>'places.'+f).join(','),{textQuery:query,languageCode:'ko',regionCode:'JP',pageSize:20});return (data.places??[]).flatMap((p:any)=>{try{return [normalizePlace(p)]}catch{return []}}) as Place[];}
export async function placeDetails(key:string,id:string){return normalizePlace(await googleJson(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=ko`,key,placeFields));}
export async function searchHotels(key:string,city:string,budget:string,fetcher:typeof fetch=fetch){const data=await googleJson('https://places.googleapis.com/v1/places:searchText',key,placeFields.split(',').map(f=>'places.'+f).join(','),{textQuery:`${city} 일본 ${budget==='low'?'가성비 ':budget==='high'?'고급 ':''}호텔 숙소`,languageCode:'ko',regionCode:'JP',includedType:'lodging',pageSize:12},fetcher);return (data.places??[]).flatMap((raw:any)=>{try{const p=normalizePlace(raw);return p.category==='숙소'?[p]:[];}catch{return [];}}) as Place[];}
export async function photoMediaUrl(key:string,name:string,width:number,fetcher:typeof fetch=fetch){
 if(!validPhotoName(name)||![160,320,640].includes(width))throw Error('사진 요청을 확인해주세요.');
 const url=new URL(`https://places.googleapis.com/v1/${name}/media`);url.searchParams.set('maxWidthPx',String(width));url.searchParams.set('skipHttpRedirect','true');
 const response=await fetcher(url,{headers:{'X-Goog-Api-Key':key},signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('사진을 불러오지 못했습니다.');
 const data:any=await response.json();const uri=new URL(data.photoUri);if(uri.protocol!=='https:'||!['googleusercontent.com','ggpht.com'].some(host=>uri.hostname===host||uri.hostname.endsWith('.'+host)))throw Error('사진 주소를 확인해주세요.');return uri.href;
}
export async function fetchRoute(key:string,from:{id:string;lat:number;lng:number},to:{id:string;lat:number;lng:number},mode:string,departure:string,fetcher:typeof fetch=fetch):Promise<RouteLeg>{
 const absent:RouteLeg={from:from.id,to:to.id,duration:0,distance:0,status:'unavailable'};
 try{
 const body:any={origin:{location:{latLng:{latitude:from.lat,longitude:from.lng}}},destination:{location:{latLng:{latitude:to.lat,longitude:to.lng}}},travelMode:mode,languageCode:'ko',units:'METRIC'};
 if(mode==='TRANSIT')body.departureTime=departure;
 const data=await googleJson('https://routes.googleapis.com/directions/v2:computeRoutes',key,'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',body,fetcher);const r=data.routes?.[0];
 if(!r||!r.polyline?.encodedPolyline)return absent;
 return {...absent,status:'ok',duration:Math.ceil(parseFloat(r.duration)/60),distance:r.distanceMeters,polyline:r.polyline.encodedPolyline,departure};
 }catch{return absent;}
}
