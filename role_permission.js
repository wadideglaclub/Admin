
(function() {
  function getRole() {
    try { 
      let r = (sessionStorage.getItem('wd_role') || localStorage.getItem('wd_role') || '').toLowerCase();
      if(!r) return 'admin';
      return r;
    }
    catch (e) { return 'admin'; }
  }
  function isStaffRole(role){
    return role==='staff' || role.indexOf('october')!==-1;
  }
  var role = getRole();
  var isStaff = isStaffRole(role);
  window.WD_ROLE = role;
  window.WD_IS_STAFF = isStaff;
  window.WD_IS_ADMIN = !isStaff;

  if (!isStaff) {
    // Admin - keep everything, protect lookup box, show delete approval
    setInterval(function() {
      var el = document.getElementById('wd-membership-lookup');
      if (el) { el.style.setProperty('display', 'block', 'important'); }
    }, 1000);
    return;
  }

  // === STAFF MODE - October 1 ===
  function hideByText(substrings) {
    var all = document.querySelectorAll('button, a, [role="button"]');
    all.forEach(function(el){
      var txt = (el.textContent || '').trim();
      if(!txt) return;
      for(var i=0;i<substrings.length;i++){
        var s = substrings[i];
        if(txt.includes(s)){
          if(el.closest && el.closest('#wd-membership-lookup')) continue;
          if(s === 'لوحة التحكم' && txt.length > 30) continue;
          el.style.setProperty('display','none','important');
        }
      }
    });
  }

  function applyStaffRestrictions() {
    // Hide admin buttons + delete approval for staff
    hideByText(['إدارة النظام', 'ادارة النظام', 'الفروع - 12 فرع', 'عرض جميع الفروع', 'لوحة التحكم', 'استيراد شيت', 'استيراد شيت أماكن', 'طلبات الحذف', 'طلبات حذف', '🗑️ طلبات الحذف']);

    // Hide specific admin button by id
    var adminBtn = document.getElementById('wd-admin-btn');
    if(adminBtn) adminBtn.style.setProperty('display','none','important');
    
    // Hide delete approval elements for staff
    var delBell = document.getElementById('wd-del-bell');
    if(delBell) delBell.style.setProperty('display','none','important');
    var delNavBtn = document.getElementById('wd-del-nav-btn');
    if(delNavBtn) delNavBtn.style.setProperty('display','none','important');
    var delModal = document.getElementById('wd-del-modal');
    if(delModal) delModal.style.setProperty('display','none','important');

    // Hide WhatsApp
    document.querySelectorAll('button, a').forEach(function(el){
      var txt = (el.textContent || '').toLowerCase();
      var inner = el.innerHTML || '';
      if(txt.includes('واتساب') || txt.includes('whatsapp') || inner.includes('whatsapp') || inner.includes('WhatsApp') || (el.getAttribute && (el.getAttribute('title')||'').includes('واتساب'))){
        if(el.closest && el.closest('#wd-membership-lookup')) return;
        el.style.setProperty('display','none','important');
      }
      var style = window.getComputedStyle(el);
      if(el.querySelector && el.querySelector('svg')){
        if(inner.includes('M19.07') || inner.includes('wa-') || txt.includes('ارسال رسالة واتساب')){
          el.style.setProperty('display','none','important');
        }
      }
    });

    document.querySelectorAll('[class*="whatsapp"], [id*="whatsapp"], [class*="whats"]' ).forEach(function(el){
      el.style.setProperty('display','none','important');
    });

    // Hide status dropdown in edit modal
    var modals = document.querySelectorAll('[role="dialog"], [class*="modal"], [id="modal"], div[style*="fixed"]');
    modals.forEach(function(modal){
      if(modal.offsetParent === null && !modal.querySelector('select')) return;
      var labels = modal.querySelectorAll('label, div, span');
      labels.forEach(function(lbl){
        var t = (lbl.textContent||'').trim();
        if(t.includes('حالة الكارنيهات') || t.includes('حالة الكارنيه') || t === 'الحالة'){
          var container = lbl.parentElement;
          if(container){
            var sel = container.querySelector('select');
            if(sel){
              var fieldWrapper = container.closest('div');
              if(fieldWrapper) fieldWrapper = fieldWrapper.parentElement;
              container.style.setProperty('display','none','important');
              if(fieldWrapper && fieldWrapper.querySelectorAll('select').length===1){
                fieldWrapper.style.setProperty('display','none','important');
              }
            }
          }
        }
      });
      modal.querySelectorAll('select').forEach(function(sel){
        var hasStatusOptions = false;
        for(var i=0;i<sel.options.length;i++){
          var opt = sel.options[i].text;
          if(opt.includes('تم الإرسال') || opt.includes('قيد انتظار') || opt.includes('تم الاستلام')){
            hasStatusOptions = true;
            break;
          }
        }
        if(hasStatusOptions){
          var wrap = sel.closest('div');
          if(wrap) wrap.style.setProperty('display','none','important');
          sel.style.setProperty('display','none','important');
        }
      });
    });

    var lookup = document.getElementById('wd-membership-lookup');
    if(lookup){
      lookup.style.setProperty('display','block','important');
      lookup.style.setProperty('visibility','visible','important');
    }
  }

  function navigateToNewRequestsForStaff(){
    if(window._staffNavigated) return;
    var buttons = document.querySelectorAll('button');
    for(var i=0;i<buttons.length;i++){
      var b = buttons[i];
      var txt = (b.textContent||'').trim();
      if(txt === 'طلبات جديدة' || txt.includes('طلبات جديدة')){
        if(b.offsetParent !== null){
          b.click();
          window._staffNavigated = true;
          console.log('Staff auto-navigated to طلبات جديدة');
          break;
        }
      }
    }
  }

  function boot() {
    applyStaffRestrictions();
    setTimeout(navigateToNewRequestsForStaff, 800);
    setTimeout(navigateToNewRequestsForStaff, 2000);
    setTimeout(navigateToNewRequestsForStaff, 3500);

    new MutationObserver(function(){
      applyStaffRestrictions();
    }).observe(document.body, { childList: true, subtree: true });

    setInterval(function(){
      applyStaffRestrictions();
    }, 1000);
    
    setInterval(function(){
      var el = document.getElementById('wd-membership-lookup');
      if(el){ el.style.setProperty('display','block','important'); el.style.setProperty('visibility','visible','important'); }
    }, 800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 500);

  console.log('Staff mode: October 1 restrictions active - FIXED VERSION');
})();
