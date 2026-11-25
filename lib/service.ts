import { googleReady, searchPlaces, placeDetails, fetchRoute, type GoogleEnv } from './google.ts';
import { reserveSpend, monthKey, MONTHLY_BUDGET_KRW, API_CAP_KRW } from './budget.ts';
import { validateSettings, validatePoint, buildDays, type Place, type RouteLeg } from './travel.ts';
type Env=GoogleEnv&{DB?:D1Database};
class ApiError extends Error{status:number;constructor(message:string,status=400){super(message);this.status=status;}}
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function body(request:Request){const reader=request.body?.getReader();if(!reader)return {};let size=0;const chunks:Uint8Array[]=[];while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>24000){await reader.cancel();throw new ApiError('요청 크기가 너무 큽니다.',413);}chunks.push(value);}const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new ApiError('요청 형식을 확인해주세요.');}}
async function limit(env:Env,request:Request,global=false){if(!env.DB)throw new ApiError('저장소 연결을 준비 중입니다.',503);const now=Math.floor(Date.now()/1000);const bucket=Math.floor(now/(global?86400:3600));const identity=global?'all':request.headers.get('cf-connecting-ip')||request.headers.get('oai-authenticated-user-id')||'local';const hashed=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(identity));const key=`${global?'global':'visitor'}:${bucket}:`+Array.from(new Uint8Array(hashed)).slice(0,12).map(v=>v.toString(16).padStart(2,'0')).join('');const row=await env.DB.prepare('INSERT INTO rate_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count < ? RETURNING count').bind(key,now+172800,global?1000:45).first();if(!row)throw new ApiError('이용량 제한에 도달했습니다. 잠시 후 다시 이용해주세요.',429);}
async function spend(env:Env,kind:'search'|'details'|'route'|'map',units=1){if(!googleReady(env))throw new ApiError('구글맵 연결을 준비 중입니다. 지금은 예시 여행을 체험할 수 있습니다.',503);if(!await reserveSpend(env.DB as any,kind,units))throw new ApiError('이번 달 여행 만들기 한도에 도달했습니다. 저장된 일정은 계속 볼 수 있습니다.',429);}
export async function handleApi(request:Request,env:Env):Promise<Response>{
 try{
 const path=new URL(request.url).pathname.replace(/\/$/,'');
 if(path==='/api/config'&&request.method==='GET')return json({live:googleReady(env)&&Boolean(env.DB),budget:MONTHLY_BUDGET_KRW,apiBudget:API_CAP_KRW,mode:googleReady(env)?'live':'sample'});
 if(request.method==='POST'){const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)throw new ApiError('허용되지 않은 요청입니다.',403);}
 if(request.method==='GET'&&path.startsWith('/api/share/')){
  const id=path.split('/').at(-1)!;if(!/^[a-f0-9]{32}$/.test(id))throw new ApiError('공유 주소를 확인해주세요.',404);
  await limit(env,request);const row=await env.DB!.prepare('SELECT payload FROM trips WHERE id=? AND expires>?').bind(id,Date.now()).first<{payload:string}>();if(!row)throw new ApiError('일정이 만료되었거나 존재하지 않습니다.',404);return json(JSON.parse(row.payload));
 }
 if(request.method!=='POST')return json({error:'찾을 수 없는 기능입니다.'},404);
 if(!['/api/map-access','/api/plan','/api/search','/api/routes','/api/share','/api/resolve'].includes(path))return json({error:'찾을 수 없는 기능입니다.'},404);
 const input=await body(request);await limit(env,request);await limit(env,request,true);
 if(path==='/api/map-access'){await spend(env,'map');return json({key:env.GOOGLE_MAPS_BROWSER_KEY,mapId:env.GOOGLE_MAP_ID});}
 if(path==='/api/plan'){
  const settings=validateSettings(input);await spend(env,'search',settings.hotel?4:3);
  const qualifiers=settings.budget==='low'?'저렴한 ':settings.budget==='high'?'특별한 ':'';
  const attraction=settings.interests.includes('쇼핑')?'쇼핑 명소':settings.interests.includes('자연')?'공원 자연 명소':settings.interests.includes('문화')?'박물관 문화 명소':'관광 명소';
  const groups=await Promise.all([`${settings.city} 일본 ${settings.companion==='가족'?'가족 여행 ':''}${attraction}`,`${settings.city} 일본 ${qualifiers}맛집`,`${settings.city} 일본 카페`,...(settings.hotel?[`${settings.hotel} ${settings.city} 일본 숙소`]:[])].map(q=>searchPlaces(env.GOOGLE_MAPS_SERVER_KEY!,q)));
  const origin=settings.hotel?groups[3]?.[0]:undefined;
  if(settings.hotel&&!origin)throw new ApiError('숙소를 찾지 못했습니다. 구체적인 숙소명이나 주소를 입력해주세요.');
  const places=[...new Map(groups.slice(0,3).flat().map(p=>[p.id,p])).values()];if(!places.length)throw new ApiError('이 지역의 장소를 찾지 못했습니다. 지역명을 구체적으로 입력해주세요.');
  return json({settings,days:buildDays(places,settings,origin),origin,places,source:'google',notice:'방문 시간은 초안입니다. 영업시간·예약·대기시간은 각 장소에서 확인해주세요.'});
 }
 if(path==='/api/search'){
  if(typeof input.query!=='string'||!input.query.trim()||input.query.length>100||typeof input.city!=='string'||input.city.length>60)throw new ApiError('검색어를 100자 이내로 입력해주세요.');await spend(env,'search');return json({places:await searchPlaces(env.GOOGLE_MAPS_SERVER_KEY!,`${input.city} 일본 ${input.query}`)});
 }
 if(path==='/api/routes'){
  if(!Array.isArray(input.points)||input.points.length<2||input.points.length>8||!['WALK','DRIVE','TRANSIT'].includes(input.mode))throw new ApiError('경로는 2~8개 장소로 계산해주세요.');
  const points=input.points.map(validatePoint);const dep=Date.parse(input.departure);if(!Number.isFinite(dep))throw new ApiError('출발 시간을 확인해주세요.');
  const stays=input.stays;if(!Array.isArray(stays)||stays.length!==points.length||stays.some((v:any)=>!Number.isInteger(v)||v<0||v>360))throw new ApiError('체류시간을 확인해주세요.');
  if(input.mode==='TRANSIT'&&(dep<Date.now()-7*86400000||dep>Date.now()+100*86400000))throw new ApiError('대중교통은 현재 기준 과거 7일~미래 100일 범위에서 조회할 수 있습니다.');
  await spend(env,'route',points.length-1);const legs:RouteLeg[]=[];let clock=dep;
  for(let i=1;i<points.length;i++){clock+=stays[i-1]*60000;const leg=await fetchRoute(env.GOOGLE_MAPS_SERVER_KEY!,points[i-1],points[i],input.mode,new Date(clock).toISOString());legs.push(leg);if(leg.status==='ok')clock+=leg.duration*60000;else break;}
  return json({legs,notice:legs.some(l=>l.status!=='ok')?'일부 경로는 확인되지 않았습니다. 이후 구간은 출발 시간이 확정되면 다시 계산해주세요.':undefined});
 }
 if(path==='/api/resolve'){
  if(!Array.isArray(input.ids)||input.ids.length>45||input.ids.some((id:any)=>typeof id!=='string'||!/^[\w-]{5,250}$/.test(id)))throw new ApiError('저장된 장소 정보를 확인해주세요.');
  if(!input.ids.length)return json({places:[]});await spend(env,'details',input.ids.length);
  const places:Place[]=[];for(let i=0;i<input.ids.length;i+=5){const results=await Promise.allSettled(input.ids.slice(i,i+5).map((id:string)=>placeDetails(env.GOOGLE_MAPS_SERVER_KEY!,id)));for(const r of results)if(r.status==='fulfilled')places.push(r.value);}return json({places});
 }
 if(path==='/api/share'){
  const settings=validateSettings(input.settings);if(!Array.isArray(input.days)||input.days.length!==settings.nights+1)throw new ApiError('일정을 확인해주세요.');
  const days=input.days.map((d:any)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||!Array.isArray(d.stops)||d.stops.length>7)throw new ApiError('일정을 확인해주세요.');return {date:d.date,stops:d.stops.map((s:any)=>{if(typeof s.id!=='string'||s.id.length>250||!['sample','google'].includes(s.source)||(s.time!=='미정'&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(s.time))||!Number.isInteger(s.minutes)||s.minutes<0||s.minutes>360)throw new ApiError('방문 정보를 확인해주세요.');return {id:s.id,source:s.source,time:s.time,minutes:s.minutes};})};});
  if(input.originId!==undefined&&(typeof input.originId!=='string'||input.originId.length>250))throw new ApiError('숙소 정보를 확인해주세요.');const id=crypto.randomUUID().replaceAll('-','');const now=Date.now();await env.DB!.batch([env.DB!.prepare('DELETE FROM trips WHERE expires < ?').bind(now),env.DB!.prepare('DELETE FROM rate_limits WHERE expires < ?').bind(Math.floor(now/1000)),env.DB!.prepare('INSERT INTO trips (id,payload,created,expires) VALUES (?,?,?,?)').bind(id,JSON.stringify({settings,days,originId:input.originId}),now,now+30*86400000)]);return json({id,expires:new Date(now+30*86400000).toISOString()});
 }
 return json({error:'찾을 수 없는 기능입니다.'},404);
 }catch(error){const status=error instanceof ApiError?error.status:400;return json({error:error instanceof Error?error.message:'요청을 처리하지 못했습니다.'},status);}
}
