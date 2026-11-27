'use client';
import {useEffect,useState} from 'react';
import {BedDouble,Coffee,MapPin,Utensils} from 'lucide-react';
import type {Place} from '../lib/travel';
export default function PlacePhoto({place,large=false}:{place:Place;large?:boolean}){
 const [failed,setFailed]=useState(false);useEffect(()=>setFailed(false),[place.id,place.photo?.name]);const Icon=place.category==='숙소'?BedDouble:place.category==='맛집'?Utensils:place.category==='카페'?Coffee:MapPin;
 return <div className={`place-photo ${large?'is-large':''}`}>{place.photo&&!failed?<img src={`/api/photo?ref=${encodeURIComponent(place.photo.name)}&width=${large?640:160}`} alt={`${place.name} 장소 사진`} width={large?640:160} height={large?400:160} loading="lazy" onError={()=>setFailed(true)}/>:<div className="photo-placeholder"><Icon size={large?38:24}/><span>{place.source==='sample'?'체험 장소':failed?'사진을 불러오지 못했습니다':'장소 사진 준비 중'}</span></div>}</div>;
}
export function PhotoCredits({place}:{place:Place}){return place.photo?<div className="photo-credits"><span translate="no">Google Maps</span>{place.photo.authors.map((a,i)=>a.uri?<a key={i} href={a.uri} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}>{a.name}</a>:<span key={i}>{a.name}</span>)}</div>:null;}
