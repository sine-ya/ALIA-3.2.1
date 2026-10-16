(function(){
var C=window.Capacitor;if(!C||!C.isNativePlatform||!C.isNativePlatform())return;
var P=C.Plugins,LN=P.LocalNotifications,B=window.AndroidBio,K="syndic_v1",L=localStorage.getItem("syndic_ui")||"ar";
var M={ar:{elev:"غداً: الفحص الشهري للمصعد",task:"غداً: ",due8:"تذكير: آخر أجل لأداء واجب الشهر هو 10 من الشهر",due11:"انتهى أجل الأداء. راجع الشقق المتأخرة وأرسل التذكيرات",bk:"💾 شارك نسخة احتياطية من بياناتك (⚙️ ← مشاركة النسخة الاحتياطية)",doc:"وثيقة تنتهي قريباً: "},
fr:{elev:"Demain : contrôle mensuel de l'ascenseur",task:"Demain : ",due8:"Rappel : date limite de paiement des charges le 10 du mois",due11:"Délai de paiement dépassé. Vérifiez les appartements en retard et envoyez les relances",bk:"💾 Partagez une sauvegarde de vos données (⚙️)",doc:"Document bientôt expiré : "},
en:{elev:"Tomorrow: monthly elevator inspection",task:"Tomorrow: ",due8:"Reminder: dues payment deadline is the 10th of the month",due11:"Payment deadline passed. Check late apartments and send reminders",bk:"💾 Share a backup of your data (⚙️)",doc:"Document expiring soon: "}}[L]||{};
function data(){try{return JSON.parse(localStorage.getItem(K))}catch(e){return null}}
function at(y,m,d,h){return new Date(y,m,d,h,0,0)}
async function sched(){
 if(localStorage.getItem("syndic_notif")!=="1"||!LN)return;
 var S=data();if(!S||!S.res)return;
 var now=new Date(),end=new Date(now.getTime()+95*864e5),items=[],id=1,ttl=(L!=="ar"&&S.res.nameL)||S.res.name||"Alia 3";
 function add(d,body){if(d>now&&d<end&&items.length<120)items.push({id:id++,title:ttl,body:body,schedule:{at:d,allowWhileIdle:true}})}
 for(var i=0;i<4;i++){var y=now.getFullYear(),m=now.getMonth()+i;
  if(S.res.elev)add(at(y,m,S.res.elev-1,18),M.elev);
  add(at(y,m,8,10),M.due8);add(at(y,m,11,10),M.due11);add(at(y,m,1,10),M.bk)}
 (S.tasks||[]).forEach(function(t){var p=t.next.split("-");add(at(+p[0],+p[1]-1,+p[2]-1,9),M.task+t.name)});
 (S.docs||[]).forEach(function(x){if(!x.exp)return;var p=x.exp.split("-");[30,7].forEach(function(n){add(at(+p[0],+p[1]-1,+p[2]-n,9),M.doc+x.title)})});
 try{var pd=await LN.getPending();if(pd.notifications.length)await LN.cancel({notifications:pd.notifications.map(function(n){return{id:n.id}})});
  if(items.length)await LN.schedule({notifications:items})}catch(e){}}
async function initN(){try{var st=localStorage.getItem("syndic_notif");
 if(st===null){var r=await LN.requestPermissions();localStorage.setItem("syndic_notif",r.display==="granted"?"1":"0")}
 else if(st==="1"){var c=await LN.checkPermissions();if(c.display!=="granted")return}
 sched()}catch(e){}}
var _s=Storage.prototype.setItem,tm=null;
Storage.prototype.setItem=function(k,v){_s.call(this,k,v);if(k===K){clearTimeout(tm);tm=setTimeout(sched,4000)}};
try{P.App.addListener("appStateChange",function(s){if(s.isActive)sched()})}catch(e){}
try{P.App.addListener("backButton",function(){var h=false;try{h=window.synBack&&window.synBack()}catch(x){}if(!h)P.App.exitApp()})}catch(e){}
window.synNotifToggle=async function(){var on=localStorage.getItem("syndic_notif")==="1";
 if(on){localStorage.setItem("syndic_notif","0");try{var pd=await LN.getPending();if(pd.notifications.length)await LN.cancel({notifications:pd.notifications.map(function(n){return{id:n.id}})})}catch(e){}}
 else{try{var r=await LN.requestPermissions();if(r.display==="granted"){localStorage.setItem("syndic_notif","1");sched()}else alert("الإذن مرفوض: فعّل الإشعارات من إعدادات الهاتف ← التطبيقات")}catch(e){alert("تعذّر: "+e)}}
 window.setForm()};
document.documentElement.classList.add("native");
window.synPdf=async function(){var el=document.querySelector("#docbox .doc");if(!el||!window.html2canvas||!window.jspdf){window.print();return}
 try{toast("جارٍ إنشاء PDF...");var wr=document.createElement("div");wr.style.cssText="position:fixed;left:-10000px;top:0;width:794px";wr.innerHTML=el.outerHTML;wr.firstChild.classList.add("cmp");document.body.appendChild(wr);var cv;try{cv=await html2canvas(wr.firstChild,{scale:2,backgroundColor:"#ffffff"})}finally{wr.remove()}
  var pdf=new window.jspdf.jsPDF({unit:"pt",format:"a4"}),W=pdf.internal.pageSize.getWidth(),H=pdf.internal.pageSize.getHeight(),M=24,Wu=W-2*M,Hu=H-2*M,fh=cv.height*Wu/cv.width,s=Math.min(1,Hu/fh);
  if(s>=0.7){var w=Wu*s,h=fh*s;pdf.addImage(cv.toDataURL("image/jpeg",0.92),"JPEG",M+(Wu-w)/2,M,w,h)}
  else{var ph=Math.floor(Hu*cv.width/Wu);for(var y=0,p=0;y<cv.height;y+=ph,p++){var h2=Math.min(ph,cv.height-y),sl=document.createElement("canvas");sl.width=cv.width;sl.height=h2;sl.getContext("2d").drawImage(cv,0,y,cv.width,h2,0,0,cv.width,h2);if(p)pdf.addPage();pdf.addImage(sl.toDataURL("image/jpeg",0.92),"JPEG",M,M,Wu,h2*Wu/cv.width)}}
  var cd=(typeof curDoc!=="undefined"&&curDoc)?curDoc.no:"",np=pdf.getNumberOfPages();for(var i=1;i<=np;i++){pdf.setPage(i);pdf.setFontSize(9);pdf.setTextColor(120);pdf.text((cd?cd+"   |   ":"")+i+" / "+np,W/2,H-10,{align:"center"})}
  window.synShare(URL.createObjectURL(pdf.output("blob")),"alia3-"+new Date().toISOString().slice(0,10)+".pdf")}catch(err){alert("تعذّر إنشاء PDF: "+err);window.print()}};
function bioOn(){return B&&localStorage.getItem("syndic_bio")==="1"}
window.synBio=function(){if(B)B.auth()};
window.synBioResult=function(ok){if(window.synBioTest){window.synBioTest=false;if(ok){localStorage.setItem("syndic_bio","1");window.setForm()}return}
 if(ok){var l=document.getElementById("lk");if(l)l.hidden=true}};
window.synBioToggle=function(){if(bioOn()){localStorage.setItem("syndic_bio","0");window.setForm();return}
 var S=data();if(!S||!S.res||!S.res.pin){alert("فعّل رمز PIN أولاً من ⚙️");return}
 if(!B||!B.available()){alert("لا توجد بصمة مسجلة في هذا الهاتف");return}
 window.synBioTest=true;B.auth()};
window.addEventListener("load",function(){
 var lk=document.getElementById("lk"),bb=null;
 if(lk&&B){bb=document.createElement("button");bb.className="btn s";bb.textContent="🔓 البصمة";bb.onclick=window.synBio;lk.appendChild(bb)}
 var ol=window.lockShow;window.lockShow=function(){ol();if(bb)bb.style.display=bioOn()?"":"none";if(bioOn())setTimeout(window.synBio,300)};
 if(lk&&!lk.hidden){if(bb)bb.style.display=bioOn()?"":"none";if(bioOn())setTimeout(window.synBio,300)}
 var os=window.setForm;window.setForm=function(){os();var n=localStorage.getItem("syndic_notif")==="1";
  var d=document.createElement("div");d.className="cd";
  d.innerHTML='<h3>🔔 الإشعارات</h3><div class="al '+(n?"ok":"wn")+'">'+(n?"مفعّلة":"موقوفة")+'</div><button class="btn s bl" onclick="synNotifToggle()">'+(n?"إيقاف":"تفعيل")+'</button>'+(B?'<h3>🔓 فتح بالبصمة</h3><div class="al '+(bioOn()?"ok":"wn")+'">'+(bioOn()?"مفعّل":"موقوف")+'</div><button class="btn s bl" onclick="synBioToggle()">'+(bioOn()?"إيقاف":"تفعيل")+'</button>':"");
  var sh=document.getElementById("sh");sh.insertBefore(d,sh.children[1])};
 initN()});
})();
