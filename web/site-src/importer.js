// Letterboxd exports are read in the browser. The original ZIP/CSV never leaves the device.
(function(){
  const decoder=new TextDecoder('utf-8');
  const maxFileSize=20*1024*1024;
  const maxEntrySize=6*1024*1024;
  const supported=new Set(['diary','ratings','watched','watchlist']);

  function csvRows(text){
    const rows=[];let row=[],cell='',quoted=false;
    text=text.replace(/^\uFEFF/,'');
    for(let i=0;i<text.length;i++){
      const c=text[i];
      if(quoted){
        if(c==='"'&&text[i+1]==='"'){cell+='"';i++}
        else if(c==='\\'&&text[i+1]==='"'){cell+='"';i++}
        else if(c==='"')quoted=false;
        else cell+=c;
      }else if(c==='"'&&cell==='')quoted=true;
      else if(c===','){row.push(cell);cell=''}
      else if(c==='\n'||c==='\r'){
        if(c==='\r'&&text[i+1]==='\n')i++;
        row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';
      }else cell+=c;
    }
    row.push(cell);if(row.some(x=>x.trim()))rows.push(row);
    if(!rows.length)return [];
    const headers=rows.shift().map(x=>x.trim().toLowerCase().replace(/[\s_-]+/g,''));
    return rows.map(values=>Object.fromEntries(headers.map((header,i)=>[header,(values[i]||'').trim()])));
  }

  function kindOf(name){const parts=name.split(/[\\/]/).map(x=>x.toLowerCase());if(parts.slice(0,-1).some(x=>x.includes('deleted')||x==='__macosx'))return null;const match=parts.at(-1).match(/^(diary|ratings|watched|watchlist)\.csv$/);return match?.[1]||null}
  async function unzipCsv(file){
    const bytes=new Uint8Array(await file.arrayBuffer());
    const data=new DataView(bytes.buffer);
    let end=-1;
    for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--){if(data.getUint32(i,true)===0x06054b50){end=i;break}}
    if(end<0)throw Error('ZIP dosyası okunamadı.');
    const count=data.getUint16(end+10,true),offset=data.getUint32(end+16,true);
    if(count>1000)throw Error('ZIP içinde çok fazla dosya var.');
    let pos=offset;const found=[];
    for(let i=0;i<count;i++){
      if(pos+46>bytes.length||data.getUint32(pos,true)!==0x02014b50)throw Error('ZIP dosyası bozuk.');
      const method=data.getUint16(pos+10,true),compressed=data.getUint32(pos+20,true),size=data.getUint32(pos+24,true);
      const nameLength=data.getUint16(pos+28,true),extra=data.getUint16(pos+30,true),comment=data.getUint16(pos+32,true);
      const local=data.getUint32(pos+42,true),name=decoder.decode(bytes.subarray(pos+46,pos+46+nameLength));
      pos+=46+nameLength+extra+comment;
      const kind=kindOf(name);
      if(!kind||!supported.has(kind))continue;
      if(size>maxEntrySize||compressed>maxEntrySize)throw Error(`${name} dosyası çok büyük.`);
      if(local+30>bytes.length||data.getUint32(local,true)!==0x04034b50)throw Error('ZIP dosyası bozuk.');
      const start=local+30+data.getUint16(local+26,true)+data.getUint16(local+28,true);
      if(start+compressed>bytes.length)throw Error('ZIP dosyası eksik.');
      const content=bytes.slice(start,start+compressed);
      let plain;
      if(method===0)plain=content;
      else if(method===8){
        if(typeof DecompressionStream==='undefined')throw Error('Bu cihaz ZIP açamıyor. ZIP içindeki CSV dosyalarını seç.');
        try{plain=new Uint8Array(await new Response(new Blob([content]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())}
        catch{throw Error('ZIP açılamadı. ZIP içindeki CSV dosyalarını seç.')} 
      }else throw Error('ZIP sıkıştırma türü desteklenmiyor.');
      if(plain.length>maxEntrySize)throw Error(`${name} dosyası çok büyük.`);
      found.push({kind,name,rows:csvRows(decoder.decode(plain))});
    }
    return found;
  }

  function plainText(value){return new DOMParser().parseFromString(value||'','text/html').body.textContent?.trim()||''}
  function normalize(file){return file.rows.map((row,index)=>{
    const title=row.title||row.name||'';
    const tmdbId=Number(row.tmdbid)||null;
    if(!title&&!tmdbId)return null;
    const rawRating=Number(row.rating||0),rating10=Number(row.rating10||0);
    const rating=rawRating>=.5&&rawRating<=5?Math.round(rawRating*2)/2:rating10>=1&&rating10<=10?rating10/2:0;
    const rawDate=file.kind==='diary'?row.watcheddate||row.date:row.watcheddate;
    const date=/^\d{4}-\d{2}-\d{2}$/.test(rawDate||'')?rawDate:'';
    return {kind:file.kind,title:title.trim(),year:Number(row.year)||null,tmdbId,uri:row.letterboxduri||row.url||'',rating,date,review:plainText(row.review),rewatch:/^(true|yes|1)$/i.test(row.rewatch||''),sourceIndex:index};
  }).filter(Boolean)}

  async function readFiles(files){
    const parts=[];
    for(const file of files){
      if(file.size>maxFileSize)throw Error(`${file.name} çok büyük (en fazla 20 MB).`);
      if(/\.zip$/i.test(file.name))parts.push(...await unzipCsv(file));
      else if(/\.csv$/i.test(file.name)){
        const kind=kindOf(file.name)||'diary';
        parts.push({kind,name:file.name,rows:csvRows(await file.text())});
      }else throw Error('ZIP veya CSV dosyası seç.');
    }
    if(!parts.length)throw Error('Günlük, puan veya izlenen film CSV dosyası bulunamadı.');
    const rows=parts.flatMap(normalize);
    if(!rows.length)throw Error('Aktarılacak film satırı bulunamadı.');
    if(rows.length>1500)throw Error('Tek seferde en fazla 1500 film satırı aktarılabilir. ZIP içinden yalnızca diary.csv dosyasını seçebilirsin.');
    return {rows,files:parts.map(p=>p.name)};
  }
  window.DoguboxdImporter={readFiles,csvRows};
})();
