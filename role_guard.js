(function(){
function getRole(){try{return (sessionStorage.getItem('wd_role')||localStorage.getItem('wd_role')||'admin').toLowerCase();}catch(e){return 'admin';}}
var role=getRole();var isStaff=role==='staff';
window.WD_ROLE=role;window.WD_IS_STAFF=isStaff;window.WD_IS_ADMIN=!isStaff;
function protectLookup(){var el=document.getElementById('wd-membership-lookup');if(el){el.style.setProperty('display','block','important');el.style.setProperty('visibility','visible','important');}}
setInterval(protectLookup,1000);
if(!isStaff){console.log('Admin mode - full');return;}
console.log('Staff mode - only طلبات جديدة');
function applyStaff(){
  var hideTexts=['لوحة التحكم','الفروع','إدارة النظام','قائمة الطلبات','استيراد شيت'];
  document.querySelectorAll('button, a').forEach(function(btn){
    var t=(btn.textContent||'').trim();if(!t||btn.closest('#wd-membership-lookup'))return;
    hideTexts.forEach(function(ht){
      if(t.includes(ht)&&t.length<50){
        if(t===ht||(t.includes(ht)&&['لوحة التحكم','الفروع','إدارة النظام'].includes(t))||t.includes('قائمة الطلبات')||t.includes('استيراد شيت')){
          btn.style.display='none';
        }
      }
    });
  });
  document.querySelectorAll('input[type="file"]').forEach(function(inp){
    if(inp.closest&&inp.closest('#wd-membership-lookup'))return;
    if(inp.parentElement&&inp.parentElement.textContent.includes('استيراد')){
      var c=inp.closest('div');if(c)c.style.display='none';
    }
  });
  document.querySelectorAll('[id*="edit" i], [class*="modal" i]').forEach(function(m){
    m.querySelectorAll('select').forEach(function(s){
      var pt=s.parentElement?s.parentElement.textContent:'';if(pt.includes('الحالة')||pt.includes('حالة الكارنيهات')){s.parentElement.style.display='none';}
    });
  });
  protectLookup();
}
function boot(){setTimeout(applyStaff,500);setTimeout(applyStaff,1500);setTimeout(applyStaff,3000);new MutationObserver(applyStaff).observe(document.body,{childList:true,subtree:true});setInterval(applyStaff,2000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
