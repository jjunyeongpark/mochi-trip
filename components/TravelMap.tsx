'use client';
import { useEffect,useRef,useState } from 'react';
import { LocateFixed,Minus,Plus,ExternalLink,MapPin,Layers } from 'lucide-react';
import { decodePolyline,mapsUrl,type Place,type RouteLeg } from '../lib/travel';
import Mochi from './Mochi';
declare global{interface Window{google:any;mochiMapReady?:()=>void;}}
let googlePromise:Promise<void>|undefined;
function loadGoogle(key:string){if(window.google?.maps)return Promise.resolve();if(!googlePromise)googlePromise=new Promise((resolve,reject)=>{window.mochiMapReady=resolve;const script=document.createElement('script');script.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=mochiMapReady&loading=async&v=weekly&language=ko&region=JP`;script.onerror=()=>{googlePromise=undefined;reject(Error('지도를 불러오지 못했습니다.'));};document.head.appendChild(script);});return googlePromise;}
export default function TravelMap({places,legs,city,live}:{places:Place[];legs:RouteLeg[];city:string;live:boolean}){
 const latest=useRef({places,legs});latest.current={places,legs};
 const markerKey=JSON.stringify(places.map(p=>[p.id,p.lat,p.lng,p.name]));const legKey=JSON.stringify(legs);const lastBounds=useRef('');
 const container=useRef<HTMLDivElement>(null),mapRef=useRef<any>(null),layers=useRef<any[]>([]);const [error,setError]=useState('');const [zoom,setZoom]=useState(1);const [offset,setOffset]=useState({x:0,y:0});const drag=useRef<any>(null);
 useEffect(()=>{let disposed=false;if(!live)return;async function init(){try{const r=await fetch('/api/map-access',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});const data:any=await r.json();if(!r.ok)throw Error(data.error);await loadGoogle(data.key);if(disposed||!container.current)return;mapRef.current=new window.google.maps.Map(container.current,{center:{lat:35.68,lng:139.76},zoom:12,mapTypeControl:false,streetViewControl:false,fullscreenControl:true,gestureHandling:'greedy',styles:[{featureType:'poi',stylers:[{saturation:-40}]},{featureType:'water',stylers:[{color:'#c9e6ef'}]},{featureType:'landscape',stylers:[{color:'#f8f6ef'}]}]});renderLayers();}catch(e){if(!disposed)setError(e instanceof Error?e.message:'지도 연결을 확인해주세요.');}}init();return()=>{disposed=true;};},[live]);
 function renderLayers(){if(!mapRef.current)return;const {places,legs}=latest.current;const g=window.google.maps;layers.current.forEach(l=>l.setMap(null));layers.current=[];const bounds=new g.LatLngBounds();places.forEach((p,i)=>{bounds.extend({lat:p.lat,lng:p.lng});const marker=new g.Marker({map:mapRef.current,position:{lat:p.lat,lng:p.lng},label:{text:String(i+1),color:'#fff',fontWeight:'700'},title:p.name,icon:{path:g.SymbolPath.CIRCLE,scale:17,fillColor:i===0?'#85a998':'#dc8d80',fillOpacity:1,strokeColor:'#fff',strokeWeight:4}});marker.addListener('click',()=>window.open(mapsUrl(p),'_blank','noopener,noreferrer'));layers.current.push(marker);});legs.filter(l=>l.status==='ok'&&l.polyline).forEach(l=>{try{const line=new g.Polyline({map:mapRef.current,path:decodePolyline(l.polyline!),strokeColor:'#a895d0',strokeWeight:5,strokeOpacity:.9});layers.current.push(line);}catch{}});const key=JSON.stringify(places.map(p=>[p.id,p.lat,p.lng]));if(places.length&&lastBounds.current!==key){mapRef.current.fitBounds(bounds,60);lastBounds.current=key;}}
 useEffect(()=>{renderLayers();},[markerKey,legKey]);
 const points=places.slice(0,7).map((p,i)=>({p,x:[24,44,64,76,54,31,83][i],y:[32,48,28,63,74,68,40][i]}));
 return <div className="map-frame">
  <div className="map-top"><span><span className="tiny-dot"/>{city} 여행 지도</span><span className="map-label">{live?'Google Maps':'ILLUSTRATED PREVIEW'}</span></div>
  <div className="map-canvas" ref={container} style={{display:live&&!error?'block':'none'}}/>
  {live&&error&&<div className="empty-state" role="alert">지도를 연결하지 못했습니다.<br/>{error}<br/>장소별 구글맵 링크에서 위치를 확인해주세요.</div>}
  {!live&&<div className="sample-map" onWheel={e=>setZoom(z=>Math.min(2,Math.max(.8,z-e.deltaY*.001)))} onPointerDown={e=>{if((e.target as HTMLElement).closest('button,a'))return;drag.current={x:e.clientX,y:e.clientY,offset};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(drag.current)setOffset({x:drag.current.offset.x+e.clientX-drag.current.x,y:drag.current.offset.y+e.clientY-drag.current.y});}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
   <div className="map-drawing" style={{transform:`translate(${offset.x}px,${offset.y}px) scale(${zoom})`}}>
    <svg className="map-art" viewBox="0 0 800 570" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
     <defs><pattern id="mapgrid" width="90" height="85" patternUnits="userSpaceOnUse"><rect x="8" y="8" width="70" height="65" rx="12" fill="#eeece4"/><path d="M0 0H90M0 0V85" stroke="#fffdf8" strokeWidth="13"/></pattern></defs>
     <rect width="800" height="570" fill="url(#mapgrid)"/><path d="M560 -20C450 100 620 160 525 260S555 420 450 590" stroke="#c6e2e8" strokeWidth="80" fill="none"/><path d="M-30 300L840 110M120 -20L710 590M-10 480L810 350" stroke="#fffdf8" strokeWidth="20"/><path d="M-30 300L840 110" stroke="#efddbd" strokeWidth="3" strokeDasharray="7 5"/>
     <path d="M20 50Q55 10 128 42L142 127Q75 159 21 119Z" fill="#d4e2bd"/><path d="M590 390Q690 340 754 406L735 517L617 520Z" fill="#d4e2bd"/><rect x="252" y="327" width="86" height="79" rx="20" fill="#d8e5c3"/><g fill="#a8c794"><circle cx="58" cy="70" r="14"/><circle cx="88" cy="98" r="18"/><circle cx="675" cy="428" r="19"/><circle cx="703" cy="472" r="15"/></g>
     <g fill="#9c9c8d" fontSize="15" fontFamily="sans-serif"><text x="56" y="183">북쪽 산책길</text><text x="306" y="103">작은 골목</text><text x="611" y="296">강변 산책로</text><text x="93" y="437">여행자의 거리</text></g>
    </svg>
    {points.map(({p,x,y},i)=><a key={p.id} className={`sample-pin pin-${i}`} style={{left:`${x}%`,top:`${y}%`}} href={mapsUrl(p)} target="_blank" rel="noreferrer" onPointerDown={e=>e.stopPropagation()}><span>{i+1}</span><b>{p.name}</b></a>)}
    <Mochi className="map-mochi"/>
   </div>
   <div className="sample-map-note"><MapPin size={15}/>{error||'체험용 일러스트 지도 · 실제 위치·길찾기와 다릅니다.'}</div>
  </div>}
  {!live&&<div className="map-controls"><button aria-label="지도 확대" onClick={()=>setZoom(z=>Math.min(2,z+.2))}><Plus size={18}/></button><button aria-label="지도 축소" onClick={()=>setZoom(z=>Math.max(.8,z-.2))}><Minus size={18}/></button><button aria-label="지도 초기화" onClick={()=>{setZoom(1);setOffset({x:0,y:0});}}><LocateFixed size={18}/></button></div>}
  <div className="map-bottom"><span><Layers size={15}/>{live?'실제 경로는 길찾기 후 표시됩니다.':'드래그로 움직여보고, 장소를 눌러보세요.'}</span><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city+' 일본')}`} target="_blank" rel="noreferrer">구글맵 열기 <ExternalLink size={13}/></a></div>
 </div>
}
