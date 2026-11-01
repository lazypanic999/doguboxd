// The build inserts ASSETS before this module so the Worker can serve the UI
// and proxy TMDB requests without exposing the access token to visitors.
const mime={'/':'text/html; charset=utf-8','/index.html':'text/html; charset=utf-8','/styles.css':'text/css; charset=utf-8','/app.js':'text/javascript; charset=utf-8','/tmdb-seed.json':'application/json; charset=utf-8'};

function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8',...headers}})}
function movieSummary(m){return {tmdbId:m.id,title:m.title||m.original_title||'Başlıksız film',year:Number((m.release_date||'').slice(0,4))||null,blurb:m.overview||'',poster:m.poster_path?`https://image.tmdb.org/t/p/w500${m.poster_path}`:null,backdrop:m.backdrop_path?`https://image.tmdb.org/t/p/w780${m.backdrop_path}`:null,score:typeof m.vote_average==='number'?(m.vote_average/2).toFixed(1):null,genreIds:m.genre_ids||[]}}
async function tmdb(endpoint,env){const token=env.TMDB_READ_ACCESS_TOKEN;if(!token)return {error:'TMDB_NOT_CONFIGURED',status:503};const url=new URL(`https://api.themoviedb.org/3${endpoint}`);const response=await fetch(url,{headers:{authorization:`Bearer ${token}`,accept:'application/json'}});if(!response.ok)return {error:'TMDB_UPSTREAM_ERROR',status:response.status===429?429:502};return {data:await response.json()}}
export default {async fetch(request,env){
  const u=new URL(request.url),p=u.pathname;
  if(request.method!=='GET')return json({error:'METHOD_NOT_ALLOWED'},405);
  if(p==='/api/status')return json({configured:Boolean(env.TMDB_READ_ACCESS_TOKEN)});
  if(p==='/api/search'||p==='/api/discover'){
    const q=(u.searchParams.get('q')||'').trim().slice(0,100),page=Math.min(500,Math.max(1,Number(u.searchParams.get('page'))||1));
    if(p==='/api/search'&&q.length<2)return json({error:'QUERY_TOO_SHORT'},400);
    const endpoint=p==='/api/search'?`/search/movie?query=${encodeURIComponent(q)}&language=tr-TR&include_adult=false&page=${page}`:`/movie/popular?language=tr-TR&page=${page}`;
    const result=await tmdb(endpoint,env);if(result.error)return json({error:result.error},result.status);
    return json({page:result.data.page,totalPages:result.data.total_pages,results:(result.data.results||[]).map(movieSummary)},200,{'cache-control':'public, max-age=300'});
  }
  const detail=p.match(/^\/api\/movie\/(\d+)$/);
  if(detail){const result=await tmdb(`/movie/${detail[1]}?language=tr-TR&append_to_response=credits`,env);if(result.error)return json({error:result.error},result.status);const m=result.data;return json({...movieSummary(m),runtime:m.runtime||null,genres:(m.genres||[]).map(g=>g.name),cast:(m.credits?.cast||[]).slice(0,12).map(c=>({name:c.name,role:c.character||'',photo:c.profile_path?`https://image.tmdb.org/t/p/w185${c.profile_path}`:null})),crew:(m.credits?.crew||[]).filter(c=>['Director','Writer','Screenplay','Director of Photography','Original Music Composer','Producer'].includes(c.job)).slice(0,16).map(c=>({name:c.name,role:c.job}))},200,{'cache-control':'public, max-age=3600'});
  }
  const asset=ASSETS[p==='/'?'/index.html':p];if(asset!==undefined)return new Response(asset,{headers:{'content-type':mime[p]||mime['/index.html'],'cache-control':['/index.html','/app.js','/styles.css'].includes(p)?'no-cache':'public, max-age=3600'}});
  return new Response('Not found',{status:404});
}};
