(function(){
var C=window.Capacitor;if(!C||!C.isNativePlatform||!C.isNativePlatform())return;
var P=C.Plugins,FS=P.Filesystem,K="syndic_v1",FA="syndic-data.json",DIR="Syndic",KS="syndic_bk_status";
function st(o){try{var s=JSON.parse(localStorage.getItem(KS)||"{}");for(var k in o)s[k]=o[k];localStorage.setItem(KS,JSON.stringify(s))}catch(e){}}
function ok(t){try{var d=JSON.parse(t);return !!(d&&d.units&&d.res)}catch(e){return false}}
var _set=Storage.prototype.setItem,timer=null;
Storage.prototype.setItem=function(k,v){_set.call(this,k,v);if(k===K){clearTimeout(timer);timer=setTimeout(function(){backup(false)},1500)}};
var AB=window.AndroidBackup;
async function bwrite(n,t){if(AB){var r=AB.write(n,t);if(r==="ok")return;if(r!=="unsupported")throw new Error(r)}await FS.writeFile({path:DIR+"/"+n,data:t,directory:"DOCUMENTS",encoding:"utf8",recursive:true})}
async function bread(n){if(AB){var s=AB.read(n);if(s!=="unsupported")return s}var r=await FS.readFile({path:DIR+"/"+n,directory:"DOCUMENTS",encoding:"utf8"});return r.data}
async function bdel(n){if(AB){var s=AB.remove(n);if(s!=="unsupported")return}await FS.deleteFile({path:DIR+"/"+n,directory:"DOCUMENTS"})}
async function list(){var names;if(AB){var s=AB.list();if(s!=="unsupported")names=JSON.parse(s)}if(!names){var r=await FS.readdir({path:DIR,directory:"DOCUMENTS"});names=r.files.map(function(f){return f.name||f})}return names.filter(function(n){return /^syndic-\d{4}-\d{2}-\d{2}( \(\d+\))?\.json$/.test(n)}).sort().reverse()}
async function prune(){try{var l=await list();for(var i=7;i<l.length;i++)await bdel(l[i])}catch(e){}}
function idb(){return new Promise(function(res,rej){var r=indexedDB.open("syndic_media",1);r.onupgradeneeded=function(){r.result.createObjectStore("i")};r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}})}
async function igGet(k){var d=await idb();return new Promise(function(res){var q=d.transaction("i").objectStore("i").get(k);q.onsuccess=function(){res(q.result)};q.onerror=function(){res(null)}})}
async function igPut(k,v){var d=await idb();return new Promise(function(res,rej){var t=d.transaction("i","readwrite");t.objectStore("i").put(v,k);t.oncomplete=res;t.onerror=rej})}
function refsOf(t){try{var S=JSON.parse(t),r=[];(S.exps||[]).concat(S.docs||[]).forEach(function(x){if(x.img&&String(x.img).indexOf("i:")===0)r.push(x.img)});return r}catch(e){return []}}
async function syncImgs(t){try{var rs=refsOf(t),done=JSON.parse(localStorage.getItem("syndic_imgsync")||"{}");for(var i=0;i<rs.length;i++){var r=rs[i];if(done[r])continue;var v=await igGet(r);if(!v)continue;await bwrite("img-"+r.slice(2)+".json",v);done[r]=1}localStorage.setItem("syndic_imgsync",JSON.stringify(done))}catch(e){}}
async function imgRestore(){try{var t=localStorage.getItem(K);if(!t)return;var rs=refsOf(t),ch=false;for(var i=0;i<rs.length;i++){if(await igGet(rs[i]))continue;var v=await bread("img-"+rs[i].slice(2)+".json");if(v&&v.indexOf("data:")===0){await igPut(rs[i],v);ch=true}}if(ch&&window.synHydrate)window.synHydrate()}catch(e){}}
async function backup(full){var t=localStorage.getItem(K);if(!t||!ok(t))return;
 try{await FS.writeFile({path:FA,data:t,directory:"DATA",encoding:"utf8"});st({a:Date.now(),aErr:""})}catch(e){st({aErr:String(e&&e.message||e)})}
 if(localStorage.getItem("syndic_b2")==="0")return;
 var s={};try{s=JSON.parse(localStorage.getItem(KS)||"{}")}catch(e){}var day=new Date().toISOString().slice(0,10);
 if(full||s.bDay!==day||Date.now()-(s.b||0)>6*3600*1000){
  try{await bwrite("syndic-"+day+".json",t);st({b:Date.now(),bDay:day,bErr:""});prune();await syncImgs(t)}catch(e){st({bErr:String(e&&e.message||e)})}}}
async function restore(){if(localStorage.getItem(K)||sessionStorage.getItem("syn_rs"))return;var txt=null;
 try{var r=await FS.readFile({path:FA,directory:"DATA",encoding:"utf8"});if(ok(r.data))txt=r.data}catch(e){}
 if(!txt){try{var l=await list();for(var i=0;i<l.length&&!txt;i++){var r2=await bread(l[i]);if(ok(r2))txt=r2}}catch(e){}}
 if(txt){_set.call(localStorage,K,txt);sessionStorage.setItem("syn_rs","1");st({restored:Date.now()});location.reload()}}
restore();
setTimeout(imgRestore,2500);
try{P.App.addListener("appStateChange",function(s){if(!s.isActive)backup(true)})}catch(e){}
async function share(href,name){try{var b=await (await fetch(href)).blob();var d=await new Promise(function(res){var r=new FileReader();r.onload=function(){res(r.result.split(",")[1])};r.readAsDataURL(b)});await FS.writeFile({path:name,data:d,directory:"CACHE"});var u=await FS.getUri({path:name,directory:"CACHE"});await P.Share.share({title:name,url:u.uri,dialogTitle:name})}catch(e){alert("تعذر المشاركة: "+(e&&e.message||e))}}
window.synShare=share;var _click=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.hasAttribute("download")&&this.href){share(this.href,this.getAttribute("download"));return}_click.call(this)};
function ext(u){try{P.App.openUrl({url:u})}catch(e){location.href=u}}
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a");if(!a||!a.href)return;if(a.hasAttribute("download")){e.preventDefault();share(a.href,a.getAttribute("download"))}else if(a.target==="_blank"&&/^https?:/.test(a.href)){e.preventDefault();ext(a.href)}},true);
var _open=window.open;window.open=function(u){if(u&&/^https?:/.test(u))ext(u);else _open.apply(window,arguments)};
window.print=function(){if(window.AndroidPrint)window.AndroidPrint.print();else alert("الطباعة غير متاحة")};
window.synB2Toggle=function(){localStorage.setItem("syndic_b2",localStorage.getItem("syndic_b2")==="0"?"1":"0");window.setForm()};
window.synBackupNow=async function(){await backup(true);alert("تمت النسخة الاحتياطية");window.setForm()};
window.synRestoreList=async function(){try{var l=await list();show('<h3>استرجاع نسخة</h3>'+(l.map(function(n){return '<button class="btn s bl" onclick="synRestore(\''+n+'\')">'+n.slice(7,17)+'</button>'}).join('')||'<small>لا توجد نسخ</small>'))}catch(e){alert("تعذّر قراءة المجلد: "+e)}};
window.synRestore=async function(n){if(!confirm("سيتم استبدال البيانات الحالية بنسخة "+n.slice(7,17)+". متابعة؟"))return;var r=await bread(n);if(ok(r)){_set.call(localStorage,K,r);location.reload()}else alert("ملف غير صالح")};
window.addEventListener("load",function(){
 var os=window.setForm;window.setForm=function(){os();var s={};try{s=JSON.parse(localStorage.getItem(KS)||"{}")}catch(e){}
  var f=function(t){return t?new Date(t).toLocaleString("ar-MA"):"—"};
  var d=document.createElement("div");d.className="cd";d.innerHTML='<h3>💾 النسخ الاحتياطي التلقائي</h3><div class="al '+(s.aErr?"ko":"ok")+'">النسخة الداخلية: '+f(s.a)+(s.aErr?"<br>خطأ: "+s.aErr:"")+'</div><div class="al '+(s.bErr?"ko":"ok")+'">النسخة الثانوية (Documents/Syndic): '+f(s.b)+(s.bErr?"<br>تعذّرت: "+s.bErr+" — استعمل المشاركة إلى Drive":"")+'</div><button class="btn s bl" onclick="synB2Toggle()">'+(localStorage.getItem("syndic_b2")==="0"?"النسخة الثانوية: موقوفة":"النسخة الثانوية: مفعّلة")+'</button><button class="btn bl" onclick="synBackupNow()">نسخ احتياطي الآن</button><button class="btn s bl" onclick="synRestoreList()">استرجاع من نسخة سابقة</button>';
  var sh=document.getElementById("sh");sh.insertBefore(d,sh.children[1])};
 window.shareBackup=function(){window.exportData()};
});
})();
