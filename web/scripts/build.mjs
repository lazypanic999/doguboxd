import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const read=p=>readFile(new URL(p,root),'utf8');
const files=['index.html','styles.css','app.js','tmdb-seed.json'];
const assets=Object.fromEntries(await Promise.all(files.map(async f=>['/'+f,await read('site-src/'+f)])));
for(const f of ['styles.css','app.js']){
  const hash=createHash('sha256').update(assets['/'+f]).digest('hex').slice(0,10);
  assets['/index.html']=assets['/index.html'].replace(`./${f}`,`./${f}?v=${hash}`);
}
const worker=`const ASSETS=${JSON.stringify(assets)};\n`+await read('worker/index.js');
const out=new URL('dist/',root);
await rm(out,{recursive:true,force:true});
await mkdir(new URL('server/',out),{recursive:true});
await mkdir(new URL('.openai/',out),{recursive:true});
await writeFile(new URL('server/index.js',out),worker);
await writeFile(new URL('.openai/hosting.json',out),await read('.openai/hosting.json'));
console.log('Built Doguboxd Worker with '+files.length+' assets');
