import { env } from 'cloudflare:workers';
import { handleApi } from '../../../lib/service';
export const dynamic='force-dynamic';
export const GET=(request:Request)=>handleApi(request,env as any);
export const POST=(request:Request)=>handleApi(request,env as any);
