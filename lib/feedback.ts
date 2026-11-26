export const WELCOME_SESSION_KEY='pogeun-welcome-v1';
export function shouldShowWelcome(search:string,seen:string|null):boolean{
  return seen!=='1'&&!new URLSearchParams(search).has('trip');
}
