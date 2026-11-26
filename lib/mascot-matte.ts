/** A light runtime matte for the supplied warm cream mascots on a neutral studio background.
 * Original GIFs and their RGB values remain unchanged; only the canvas alpha is adjusted.
 */
export function removeNeutralBackdrop(pixels:Uint8ClampedArray,width:number,height:number):void{
 const mask=new Uint8Array(width*height),eroded=new Uint8Array(width*height),expanded=new Uint8Array(width*height);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const offset=(y*width+x)*4,nx=x/width,ny=y/height;
  if(nx<.13||nx>.86||ny<.07||ny>.98)continue;
  const r=pixels[offset],g=pixels[offset+1],b=pixels[offset+2];
  const warmth=(r+g)/2-b;
  const protectedCore=((nx-.5)/.175)**2+((ny-.515)/.277)**2<.9;
  mask[y*width+x]=protectedCore||Math.max(r,g,b)<185||warmth>(ny>.86?12:7.5)?1:0;
 }
 // Remove the GIF's isolated dither speckles, then close tiny gaps in cream highlights.
 for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
  let value=1;
  for(let dy=-1;dy<=1&&value;dy++)for(let dx=-1;dx<=1;dx++)if(!mask[(y+dy)*width+x+dx]){value=0;break;}
  eroded[y*width+x]=value;
 }
 for(let y=2;y<height-2;y++)for(let x=2;x<width-2;x++){
  let value=0;
  for(let dy=-2;dy<=2&&!value;dy++)for(let dx=-2;dx<=2;dx++)if(eroded[(y+dy)*width+x+dx]){value=1;break;}
  expanded[y*width+x]=value;
 }
 const visited=new Uint8Array(width*height),cleaned=new Uint8Array(width*height),queue=new Int32Array(width*height);
 const coreIndex=Math.round(height*.515)*width+Math.round(width*.5);
 for(let start=0;start<expanded.length;start++){
  if(!expanded[start]||visited[start])continue;
  let head=0,tail=1,sumX=0,sumY=0,hasCore=false;queue[0]=start;visited[start]=1;
  while(head<tail){
   const index=queue[head++],x=index%width,y=Math.floor(index/width);sumX+=x;sumY+=y;if(index===coreIndex)hasCore=true;
   const neighbors=[x>0?index-1:-1,x<width-1?index+1:-1,y>0?index-width:-1,y<height-1?index+width:-1];
   for(const next of neighbors)if(next>=0&&expanded[next]&&!visited[next]){visited[next]=1;queue[tail++]=next;}
  }
  const cx=sumX/tail/width,cy=sumY/tail/height;
  const suitcase=tail>Math.max(12,width*height*.001)&&cx>.18&&cx<.36&&cy>.5&&cy<.9;
  if(hasCore||suitcase)for(let i=0;i<tail;i++)cleaned[queue[i]]=1;
 }
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  let sum=0;
  if(x>0&&x<width-1&&y>0&&y<height-1)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)sum+=cleaned[(y+dy)*width+x+dx];
  pixels[(y*width+x)*4+3]=Math.round(sum*255/9);
 }
}
