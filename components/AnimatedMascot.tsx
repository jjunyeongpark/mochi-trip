'use client';
import {useEffect,useRef,useState} from 'react';
import {removeNeutralBackdrop} from '../lib/mascot-matte';

type Decoder={tracks:{ready:Promise<void>;selectedTrack:{frameCount:number}|null};decode:(options:{frameIndex:number})=>Promise<{image:VideoFrame}>;close:()=>void};
type DecoderConstructor=new(options:{data:ArrayBuffer;type:string})=>Decoder;

export default function AnimatedMascot({src,fallbackSrc,alt,onReady}:{src:string;fallbackSrc:string;alt:string;onReady:()=>void}){
 const canvas=useRef<HTMLCanvasElement>(null),readyCallback=useRef(onReady);
 readyCallback.current=onReady;
 const [cutoutReady,setCutoutReady]=useState(false);
 useEffect(()=>{
  const ImageDecoder=(window as typeof window&{ImageDecoder?:DecoderConstructor}).ImageDecoder;
  const context=canvas.current?.getContext('2d',{willReadFrequently:true});
  if(!ImageDecoder||!context)return;
  const controller=new AbortController();let active=true,decoder:Decoder|undefined,timer:ReturnType<typeof setTimeout>|undefined;
  let frameIndex=0,announced=false;
  async function start(){
   try{
    const response=await fetch(src,{signal:controller.signal});
    if(!response.ok)throw new Error('Animation unavailable');
    const data=await response.arrayBuffer();if(!active)return;
    decoder=new ImageDecoder!({data,type:'image/gif'});await decoder.tracks.ready;
    const frameCount=decoder.tracks.selectedTrack?.frameCount||1;
    async function frame(){
     if(!active||!decoder||!context)return;
     try{
      const started=performance.now();const result=await decoder.decode({frameIndex});
      const image=result.image;
      if(!active){image.close();return;}
      const duration=(image.duration||100000)/1000;
      context.clearRect(0,0,640,360);context.drawImage(image,0,0,640,360);image.close();
      const pixels=context.getImageData(0,0,640,360);removeNeutralBackdrop(pixels.data,640,360);context.putImageData(pixels,0,0);
      if(!announced){announced=true;setCutoutReady(true);readyCallback.current();}
      frameIndex=(frameIndex+1)%frameCount;
      timer=setTimeout(()=>void frame(),Math.max(16,duration-(performance.now()-started)));
     }catch{if(active)setCutoutReady(false);}
    }
    await frame();
   }catch{/* Browsers without this decoder retain the original animated GIF. */}
  }
  void start();
  return()=>{active=false;controller.abort();clearTimeout(timer);decoder?.close();};
 },[src]);
 return <>
  <img className={cutoutReady?'animation-fallback is-hidden':'animation-fallback'} src={src} alt={cutoutReady?'':alt} aria-hidden={cutoutReady} width={640} height={360} onLoad={()=>readyCallback.current()} onError={event=>{if(!event.currentTarget.src.endsWith(fallbackSrc))event.currentTarget.src=fallbackSrc;else readyCallback.current();}}/>
  <canvas className={cutoutReady?'animation-cutout':'animation-cutout is-hidden'} ref={canvas} width={640} height={360} role="img" aria-label={alt} aria-hidden={!cutoutReady}/>
 </>;
}
