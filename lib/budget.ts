export const MONTHLY_BUDGET_KRW=30000;
export const API_CAP_KRW=20000;
export const UNIT_KRW={search:100,details:60,route:25,map:25} as const;
export type DbLike={prepare:(sql:string)=>{bind:(...args:any[])=>{first:()=>Promise<any>}}};
export function monthKey(date=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit'}).format(date).replace('/','-');}
export async function reserveSpend(db:DbLike,kind:keyof typeof UNIT_KRW,units=1,date=new Date()){
 if(!db||!Number.isSafeInteger(units)||units<1||!UNIT_KRW[kind])throw Error('비용 보호 장치를 사용할 수 없습니다.');
 const cost=UNIT_KRW[kind]*units;if(cost>API_CAP_KRW)return false;
 const row=await db.prepare('INSERT INTO monthly_spend (month, amount) VALUES (?, ?) ON CONFLICT(month) DO UPDATE SET amount = monthly_spend.amount + excluded.amount WHERE monthly_spend.amount + excluded.amount <= ? RETURNING amount').bind(monthKey(date),cost,API_CAP_KRW).first();
 return Boolean(row);
}
