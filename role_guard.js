(function(){
function getRole(){try{return (sessionStorage.getItem('wd_role')||localStorage.getItem('wd_role')||'admin').toLowerCase();}catch(e){return 'admin';}}
var role=getRole();
var isStaff=role==='staff';
window.WD_ROLE=role;window.WD_IS_STAFF=isStaff;window.WD_IS_ADMIN=!isStaff;
function protectLookup(){var el=document.getElementById('wd-membership-lookup');if(el){el.style.setProperty('display','block','important');el.style.setProperty('visibility','visible','important');}}
setInterval(protectLookup,800);
if(!isStaff){console.log('Admin full');return;}
function applyStaff(){
  var btns=document.querySelectorAll('button,a');
  btns.forEach(function(b){
    var t=(b.textContent||'').trim();
    if(['لوحة التحكم','الفروع','إدارة النظام'].includes(t)){
      if(!b.closest('#wd-membership-lookup')) b.style.display='none';
    }
    if(t.includes('استيراد شيت أماكن')){
      if(!b.closest('#wd-membership-lookup')){
        var p=b.closest('div'); if(p) p.style.display='none';
      }
    }
  });
  protectLookup();
}
function boot(){setTimeout(applyStaff,800);setTimeout(applyStaff,2000);new MutationObserver(applyStaff).observe(document.body,{childList:true,subtree:true});setInterval(applyStaff,1500);}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();