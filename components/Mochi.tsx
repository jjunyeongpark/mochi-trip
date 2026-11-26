export default function Mochi({className='',variant='travel'}:{className?:string;variant?:'travel'|'small'}){
 return <img className={`mascot-image ${className}`} src={`/assets/${variant==='small'?'front.png':'walking.png'}`} alt="여행 가방을 든 포근트립 캐릭터" width={1376} height={768} loading="lazy"/>;
}
