'use client';
import {useEffect,useRef,useState} from 'react';
import {LoaderCircle,X} from 'lucide-react';
import {shouldShowWelcome,WELCOME_SESSION_KEY} from '../lib/feedback';
import AnimatedMascot from './NativeMascot';

type Scene='welcome'|'loading'|'complete';
const content={
 welcome:{title:'반가워요, 여행자님',description:'포근한 일본 여행을 함께 시작해요.',animation:'pogeun-hello.webp',still:'smile.png',action:'여행 시작하기'},
 loading:{title:'설레는 여행을 준비해요',description:'명소와 맛집을 모아, 나만의 하루를 만들고 있어요.',animation:'pogeun-hello.webp',still:'walking.png',action:'일정 화면 보기'},
 complete:{title:'우리의 여행이 준비됐어요',description:'마음에 드는 곳을 더하며, 나답게 완성해보세요.',animation:'pogeun-bye.webp',still:'smile.png',action:'일정 보러 가기'},
};

export default function JourneyFeedback({creating,completed}:{creating:boolean;completed:number}){
 const [scene,setScene]=useState<Scene|null>(null);
 const [longLoad,setLongLoad]=useState(false);
 const [loadingDismissed,setLoadingDismissed]=useState(false);
 const [reducedMotion,setReducedMotion]=useState(true);
 const dialog=useRef<HTMLDialogElement>(null);
 const previousCompleted=useRef(completed);
 const autoTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const visibleScene:Scene|null=creating?(longLoad&&!loadingDismissed?'loading':null):scene;
 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const sync=()=>setReducedMotion(media.matches);
  sync();media.addEventListener('change',sync);
  try{if(shouldShowWelcome(location.search,sessionStorage.getItem(WELCOME_SESSION_KEY))){sessionStorage.setItem(WELCOME_SESSION_KEY,'1');setScene('welcome');}}catch{/* Travel stays usable when storage is blocked. */}
  return()=>media.removeEventListener('change',sync);
 },[]);
 useEffect(()=>{
  if(!creating){setLongLoad(false);return;}
  setScene(null);setLoadingDismissed(false);
  const timer=setTimeout(()=>setLongLoad(true),450);
  return()=>clearTimeout(timer);
 },[creating]);
 useEffect(()=>{if(completed>previousCompleted.current)setScene('complete');previousCompleted.current=completed;},[completed]);
 useEffect(()=>{
  if(!visibleScene)return;
  const element=dialog.current,previousFocus=document.activeElement as HTMLElement|null;element?.showModal();
  if(visibleScene!=='loading'&&!autoTimer.current)autoTimer.current=setTimeout(()=>{element?.close();setScene(null);},10000);
  return()=>{
   if(autoTimer.current)clearTimeout(autoTimer.current);autoTimer.current=null;element?.close();
   requestAnimationFrame(()=>{if(!document.querySelector('.journey-overlay[open]')){const target=previousFocus?.isConnected&&previousFocus.matches('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]')?previousFocus:document.querySelector<HTMLElement>(visibleScene==='complete'?'button.generate':'.brand');target?.focus({preventScroll:true});}});
  };
 },[visibleScene]);
 function dismiss(){dialog.current?.close();if(visibleScene==='loading')setLoadingDismissed(true);setScene(null);}
 function mediaReady(){if(visibleScene==='loading')return;if(autoTimer.current)clearTimeout(autoTimer.current);autoTimer.current=setTimeout(()=>{dialog.current?.close();setScene(null);},3200);}
 if(!visibleScene)return null;
 const current=content[visibleScene];
 return <dialog ref={dialog} className={`journey-overlay journey-${visibleScene}`} aria-labelledby="journey-title" aria-describedby="journey-description" onCancel={event=>{event.preventDefault();dismiss();}}>
  <div className="journey-top"><span className="journey-brand">포근트립<small>pogeun trip</small></span><button type="button" className="journey-skip" onClick={dismiss} aria-label={visibleScene==='welcome'?'첫 인사 건너뛰기':'캐릭터 안내 닫기'}>{visibleScene==='welcome'?'건너뛰기':'닫기'}<X size={18}/></button></div>
  <div className="journey-body"><h2 id="journey-title">{current.title}</h2><p id="journey-description">{current.description}</p>
   <div className={`journey-mascot ${reducedMotion?'is-still':''}`}>{reducedMotion?<img src={`/assets/${current.still}`} alt="포근트립 캐릭터" width={1376} height={768} onLoad={mediaReady} onError={mediaReady}/>:<AnimatedMascot key={visibleScene} src={`/assets/${current.animation}`} fallbackSrc={`/assets/${current.still}`} alt={visibleScene==='complete'?'다녀오라고 손을 흔드는 포근트립 캐릭터':'환하게 인사하는 포근트립 캐릭터'} onReady={mediaReady}/>}</div>
   {visibleScene==='loading'&&<p className="journey-progress" role="status"><LoaderCircle className="spin" size={18}/>조금만 기다려주세요</p>}
   <button className="primary-btn journey-action" type="button" onClick={dismiss}>{current.action}</button>
  </div>
 </dialog>;
}
