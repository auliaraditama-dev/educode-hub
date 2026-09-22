export function GET() {
  const worker = `self.onmessage = function(e) { const {code,fn,tests}=e.data; try { const solve = new Function('"use strict";'+code+';return '+fn)(); if(typeof solve!=='function')throw new Error('Fungsi tidak ditemukan.'); const results=tests.map(t=>{const actual=solve(...t.args);return {pass:JSON.stringify(actual)===JSON.stringify(t.expected),actual:JSON.stringify(actual)??'undefined'}}); self.postMessage({results}); } catch(err) {self.postMessage({error:String(err.message).slice(0,1000)})} };`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Sandbox</title></head><body><script>let worker,timer; addEventListener('message',function(e){ if(e.source!==parent)return; if(worker)worker.terminate();clearTimeout(timer); if(e.data.cancel)return;const data=e.data;if(typeof data.id!=='string'||typeof data.code!=='string'||data.code.length>20000||!Array.isArray(data.tests)||data.tests.length>20||!/^\\w+$/.test(data.fn))return;const url=URL.createObjectURL(new Blob([${JSON.stringify(worker)}],{type:'text/javascript'}));worker=new Worker(url);URL.revokeObjectURL(url);worker.onmessage=function(event){parent.postMessage({id:data.id,...event.data},'*');worker.terminate();clearTimeout(timer)};worker.onerror=function(){parent.postMessage({id:data.id,error:'Kode gagal dieksekusi.'},'*');worker.terminate();clearTimeout(timer)};timer=setTimeout(function(){worker.terminate();parent.postMessage({id:data.id,error:'Batas waktu 3 detik. Periksa perulangan tak berujung.'},'*')},3000);worker.postMessage(data)});</script></body></html>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy":
        "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'",
      "X-Frame-Options": "SAMEORIGIN",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
