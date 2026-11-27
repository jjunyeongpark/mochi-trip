'use client';
import {useEffect,useRef} from 'react';
export default function NativeMascot({src,fallbackSrc,alt,onReady}:{src:string;fallbackSrc:string;alt:string;onReady:()=>void}){
 const announced=useRef(false);useEffect(()=>{announced.current=false;},[src]);
 const ready=()=>{if(!announced.current){announced.current=true;onReady();}};
 return <img className="animation-native" src={src} alt={alt} width={640} height={360} onLoad={ready} onError={event=>{if(!event.currentTarget.src.endsWith(fallbackSrc))event.currentTarget.src=fallbackSrc;else ready();}}/>;
}
