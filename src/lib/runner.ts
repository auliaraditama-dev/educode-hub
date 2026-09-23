// The iframe has a unique opaque origin. Its Blob worker cannot access the app's
// DOM or storage, and the restrictive CSP blocks outgoing network requests.
export const runnerPolicy =
  "default-src 'none'; script-src 'unsafe-inline'; worker-src blob:; connect-src 'none'; base-uri 'none'; form-action 'none'";
export const runnerHtml = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${runnerPolicy}"><title>Sandbox</title></head><body><script>
let worker,timer;
addEventListener('message',function(e){
  if(e.source!==parent)return;
  if(worker)worker.terminate(); clearTimeout(timer);
  if(e.data.cancel)return;
  const data=e.data;
  if(typeof data.id!=='string'||typeof data.code!=='string'||data.code.length>20000||!Array.isArray(data.tests)||data.tests.length>20||!/^\\w+$/.test(data.fn))return;
  const suffix='\\n;self.onmessage=function(event){try{const solve='+data.fn+';if(typeof solve!=="function")throw new Error("Fungsi tidak ditemukan.");const results=event.data.tests.map(t=>{const actual=solve(...t.args);return {pass:JSON.stringify(actual)===JSON.stringify(t.expected),actual:JSON.stringify(actual)??"undefined"}});self.postMessage({results});}catch(err){self.postMessage({error:String(err.message).slice(0,1000)})}};';
  const url=URL.createObjectURL(new Blob(['"use strict";\\n'+data.code+suffix],{type:'text/javascript'}));
  try{worker=new Worker(url);}catch(err){parent.postMessage({id:data.id,error:'Sandbox tidak tersedia: '+String(err.message).slice(0,300)},'*');URL.revokeObjectURL(url);return;}
  URL.revokeObjectURL(url);
  worker.onmessage=function(event){parent.postMessage({id:data.id,...event.data},'*');worker.terminate();clearTimeout(timer)};
  worker.onerror=function(){parent.postMessage({id:data.id,error:'Kode gagal dieksekusi. Periksa sintaks.'},'*');worker.terminate();clearTimeout(timer)};
  timer=setTimeout(function(){worker.terminate();parent.postMessage({id:data.id,error:'Batas waktu 3 detik. Periksa perulangan tak berujung.'},'*')},3000);
  worker.postMessage({tests:data.tests});
});
</script></body></html>`;
