import {distance,type Day,type Place,type RouteLeg} from './travel.ts';
export const DAY_COLORS=['#718b60','#cf826b','#9981b0','#5d96a7','#c29b47','#b67394','#598a81'];
export const dayColor=(day:number)=>DAY_COLORS[day%DAY_COLORS.length];
export function routePoints(day:Day,origin?:Place):Place[]{const stops=day.stops.map(s=>s.place);return origin&&stops.length?[origin,...stops,origin]:stops;}
export function routeSignature(day:Day,origin:Place|undefined,mode:string,start:string){return JSON.stringify({date:day.date,mode,start,points:routePoints(day,origin).map(p=>[p.id,p.lat,p.lng]),stays:day.stops.map(s=>s.minutes)});}
export function validStartTime(value:string){return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);}
export function clockTime(minutes:number){return `${minutes>=1440?'다음날 ':''}${String(Math.floor(minutes/60)%24).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;}
export type TimelineRow={place:Place;kind:'stop'|'departure'|'return';stopIndex?:number;arrival:string;departure:string;estimated:boolean;travelKnown:boolean;travelMinutes?:number;minutes:number};
export function dayTimeline(day:Day,origin:Place|undefined,legs:RouteLeg[],start='09:30'):TimelineRow[]{
 const rows:TimelineRow[]=[];let clock=validStartTime(start)?Number(start.slice(0,2))*60+Number(start.slice(3)):570,estimated=false;
 if(origin)rows.push({place:origin,kind:'departure',arrival:clockTime(clock),departure:clockTime(clock),estimated:false,travelKnown:true,minutes:0});
 const items=[...day.stops.map((s,i)=>({place:s.place,minutes:s.minutes,stopIndex:i,kind:'stop' as const})),...(origin&&day.stops.length?[{place:origin,minutes:0,stopIndex:undefined,kind:'return' as const}]:[])];
 for(const item of items){const previous=rows.at(-1);let travelKnown=true,travelMinutes:number|undefined;
  if(previous){const leg=legs.find(l=>l.from===previous.place.id&&l.to===item.place.id);travelKnown=leg?.status==='ok';travelMinutes=travelKnown?leg!.duration:undefined;if(!travelKnown)estimated=true;clock+=travelMinutes??30;}
  const arrival=clockTime(clock);clock+=item.minutes;rows.push({...item,arrival,departure:clockTime(clock),estimated,travelKnown,travelMinutes});
 }return rows;
}
export function rankHotels(hotels:Place[],stops:Place[]){const center=stops.length?{lat:stops.reduce((s,p)=>s+p.lat,0)/stops.length,lng:stops.reduce((s,p)=>s+p.lng,0)/stops.length}:undefined;return hotels.filter(p=>p.source==='google'&&p.category==='숙소').map(p=>({...p,centerDistance:center?distance(p,center):undefined})).sort((a,b)=>center?(a.centerDistance!-b.centerDistance!):(b.rating??0)-(a.rating??0));}
export const STAY_AREAS:Record<string,string[]>={'도쿄':['아사쿠사','우에노','신주쿠'],'교토':['교토역','가와라마치','기온'],'오사카':['난바','우메다','덴노지'],'후쿠오카':['하카타','덴진'],'삿포로':['삿포로역','오도리','스스키노'],'나하':['국제거리','겐초마에','오모로마치']};
