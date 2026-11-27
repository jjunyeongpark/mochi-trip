export const REGIONS=['홋카이도','도호쿠','간토','주부','간사이','주고쿠','시코쿠','규슈','오키나와'];
export function regionFor(id:number){return id===1?'홋카이도':id<=7?'도호쿠':id<=14?'간토':id<=23?'주부':id<=30?'간사이':id<=35?'주고쿠':id<=39?'시코쿠':id<=46?'규슈':'오키나와';}
export const CITY_REGION:Record<string,string>={'삿포로':'홋카이도','도쿄':'간토','교토':'간사이','오사카':'간사이','후쿠오카':'규슈','나하':'오키나와'};
export const THEMES=[{name:'맛집·카페',description:'골목의 한 끼와 느긋한 커피 한 잔',interests:['맛집','카페','명소']},{name:'자연·산책',description:'공원과 강변을 따라 조금 느리게',interests:['자연','명소','카페']},{name:'온천·휴식',description:'따뜻한 쉼을 찾아 떠나는 여행',interests:['온천','자연','카페']},{name:'쇼핑·문화',description:'취향과 도시의 이야기를 만나는 시간',interests:['쇼핑','문화','맛집']}];
