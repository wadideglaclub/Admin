(function() {
  function getRole() {
    try { return (sessionStorage.getItem('wd_role') || localStorage.getItem('wd_role') || 'admin').toLowerCase(); }
    catch (e) { return 'admin'; }
  }
  var role = getRole();
  var isStaff = role === 'staff';
  if (!isStaff) return;

  function hideByText(substrings) {
    document.querySelectorAll('button, a, [role="button"]').forEach(function(el){
      var txt = (el.textContent || '').trim();
      if(!txt) return;
      substrings.forEach(function(s){
        if(txt.includes(s)){
          if(el.closest && el.closest('#wd-membership-lookup')) return;
          el.style.setProperty('display','none','important');
        }
      });
    });
  }

  function applyStaffRestrictions() {
    hideByText(['إدارة النظام', 'ادارة النظام', 'الفروع - 12 فرع', 'عرض جميع الفروع', 'لوحة التحكم', 'استيراد شيت']);
    var adminBtn = document.getElementById('wd-admin-btn');
    if(adminBtn) adminBtn.style.setProperty('display','none','important');

    document.querySelectorAll('button, a').forEach(function(el){
      var txt = (el.textContent || '').toLowerCase();
      var inner = el.innerHTML || '';
      if(txt.includes('واتساب') || txt.includes('whatsapp') || inner.includes('whatsapp')){
        if(el.closest && el.closest('#wd-membership-lookup')) return;
        el.style.setProperty('display','none','important');
      }
    });

    document.querySelectorAll('[role="dialog"], [class*="modal"], div[style*="fixed"]').forEach(function(modal){
      modal.querySelectorAll('select').forEach(function(sel){
        var hasStatus = false;
        for(var i=0;i<sel.options.length;i++){
          var opt = sel.options[i].text;
          if(opt.includes('تم الإرسال') || opt.includes('قيد انتظار') || opt.includes('تم الاستلام')){
            hasStatus = true; break;
          }
        }
        if(hasStatus){
          var wrap = sel.closest('div');
          if(wrap) wrap.style.setProperty('display','none','important');
          sel.style.setProperty('display','none','important');
        }
      });
    });
  }

  function navigateToNewRequests(){
    if(window._staffNavigated) return;
    document.querySelectorAll('button').forEach(function(b){
      var txt = (b.textContent||'').trim();
      if(txt === 'طلبات جديدة' || txt.includes('طلبات جديدة')){
        if(b.offsetParent!== null){ b.click(); window._staffNavigated = true; }
      }
    });
  }

  function boot(){
    applyStaffRestrictions();
    setTimeout(navigateToNewRequests,1500);
    new MutationObserver(applyStaffRestrictions).observe(document.body,{childList:true,subtree:true});
    setInterval(applyStaffRestrictions,1200);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else setTimeout(boot,800);
})();
