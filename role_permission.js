(function() {
  function getRole() {
    try { return (sessionStorage.getItem('wd_role') || localStorage.getItem('wd_role') || 'admin').toLowerCase(); }
    catch (e) { return 'admin'; }
  }
  var role = getRole();
  var isStaff = role === 'staff';
  window.WD_ROLE = role;
  window.WD_IS_STAFF = isStaff;
  window.WD_IS_ADMIN = !isStaff;
  
  if (!isStaff) {
    // Admin - keep everything as is, protect lookup box
    setInterval(function() {
      var el = document.getElementById('wd-membership-lookup');
      if (el) { el.style.setProperty('display', 'block', 'important'); }
    }, 1000);
    return;
  }
  
  // === STAFF MODE ===
  // المطلوب لليوزر October 1:
  // 1- احذف زرار ادارة النظام
  // 2- احذف زرار الفروع
  // 3- احذف زرار لوحه التحكم
  // 4- خلي طلبات جديدة هي الصفحه الرئيسيه بدلا من لوحه التحكم
  // 5- في قائمة الطلبات شيل علامة الواتساب خالص
  // 6- في تعديل القلم احذف خانة حالة الكارنيهات الـ drop list
  
  function hideByText(substrings) {
    var all = document.querySelectorAll('button, a, [role="button"]');
    all.forEach(function(el) {
      var txt = (el.textContent || '').trim();
      if (!txt) return;
      for (var i = 0; i < substrings.length; i++) {
        var s = substrings[i];
        if (txt.includes(s)) {
          // don't hide if it's inside lookup box
          if (el.closest && el.closest('#wd-membership-lookup')) continue;
          // For لوحة التحكم - hide exact match only if short
          if (s === 'لوحة التحكم' && txt.length > 30) continue;
          el.style.setProperty('display', 'none', 'important');
          // also hide wrapper if needed
          var parent = el.parentElement;
          if (parent && parent.querySelectorAll('button').length === 1 && parent.tagName !== 'BODY') {
            // keep parent if it has other stuff, else hide parent
          }
        }
      }
    });
  }
  
  function applyStaffRestrictions() {
    // 1,2,3 - Hide admin buttons
    hideByText(['إدارة النظام', 'ادارة النظام', 'الفروع - 12 فرع', 'عرض جميع الفروع', 'لوحة التحكم', 'استيراد شيت', 'استيراد شيت أماكن']);
    
    // Hide specific admin button by id
    var adminBtn = document.getElementById('wd-admin-btn');
    if (adminBtn) adminBtn.style.setProperty('display', 'none', 'important');
    
    // Hide dashboard cards for staff (لوحة التحكم) - hide elements that contain تلك العناوين
    // Keep طلبات جديدة visible - we will auto navigate to it
    // Hide WhatsApp icon completely in قائمة الطلبات
    var whatsappSelectors = [
      'button[title*="واتساب"]', 'button[title*="واتساب"]',
      '[aria-label*="واتساب"]',
      'button:has(svg)', // we will filter by content
    ];
    // Hide any button containing واتساب text or whatsapp icon
    document.querySelectorAll('button, a').forEach(function(el) {
      var txt = (el.textContent || '').toLowerCase();
      var inner = el.innerHTML || '';
      if (txt.includes('واتساب') || txt.includes('whatsapp') || inner.includes('whatsapp') || inner.includes('WhatsApp') || (el.getAttribute && (el.getAttribute('title') || '').includes('واتساب'))) {
        // check if not in edit modal note
        if (el.closest && el.closest('#wd-membership-lookup')) return;
        el.style.setProperty('display', 'none', 'important');
      }
      // Hide green whatsapp buttons (often bg-green)
      var style = window.getComputedStyle(el);
      if (el.querySelector && el.querySelector('svg')) {
        // if button has whatsapp path, hide
        if (inner.includes('M19.07') || inner.includes('wa-') || txt.includes('ارسال رسالة واتساب')) {
          el.style.setProperty('display', 'none', 'important');
        }
      }
    });
    
    // More aggressive: hide any element with 📩 or 💬 that is whatsapp
    document.querySelectorAll('[class*="whatsapp"], [id*="whatsapp"], [class*="whats"]').forEach(function(el) {
      el.style.setProperty('display', 'none', 'important');
    });
    
    // Hide status dropdown in edit modal (حالة الكارنيهات)
    var modals = document.querySelectorAll('[role="dialog"], [class*="modal"], [id*="modal"], div[style*="fixed"]');
    modals.forEach(function(modal) {
      if (modal.offsetParent === null && !modal.querySelector('select')) return;
      var labels = modal.querySelectorAll('label, div, span');
      labels.forEach(function(lbl) {
        var t = (lbl.textContent || '').trim();
        if (t.includes('حالة الكارنيهات') || t.includes('حالة الكارنيه') || t === 'الحالة') {
          // find select near it
          var container = lbl.parentElement;
          if (container) {
            var sel = container.querySelector('select');
            if (sel) {
              // hide whole field
              var fieldWrapper = container.closest('div');
              if (fieldWrapper) fieldWrapper = fieldWrapper.parentElement;
              container.style.setProperty('display', 'none', 'important');
              if (fieldWrapper && fieldWrapper.querySelectorAll('select').length === 1) {
                fieldWrapper.style.setProperty('display', 'none', 'important');
              }
            }
          }
        }
      });
      // direct select hiding by options containing those statuses
      modal.querySelectorAll('select').forEach(function(sel) {
        var hasStatusOptions = false;
        for (var i = 0; i < sel.options.length; i++) {
          var opt = sel.options[i].text;
          if (opt.includes('تم الإرسال') || opt.includes('قيد انتظار') || opt.includes('تم الاستلام')) {
            hasStatusOptions = true;
            break;
          }
        }
        if (hasStatusOptions) {
          var wrap = sel.closest('div');
          if (wrap) wrap.style.setProperty('display', 'none', 'important');
          sel.style.setProperty('display', 'none', 'important');
        }
      });
    });
    
    // Also directly hide status select anywhere for staff (not just modal) - except filter dropdowns? requirement says only in تعديل القلم
    // So we only hide in modals/dialogs
    
    // Always protect lookup box visible
    var lookup = document.getElementById('wd-membership-lookup');
    if (lookup) {
      lookup.style.setProperty('display', 'block', 'important');
      lookup.style.setProperty('visibility', 'visible', 'important');
    }
  }
  
  function navigateToNewRequestsForStaff() {
    // Try to click "طلبات جديدة" button to make it main page
    if (window._staffNavigated) return;
    var buttons = document.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      var txt = (b.textContent || '').trim();
      if (txt.includes('طلبات جديدة') || txt.includes('طلب جديد') && !txt.includes('إنشاء')) {
        // if it's the tab, not the create button
        if (txt === 'طلبات جديدة' || txt.includes('طلبات جديدة')) {
          if (b.offsetParent !== null) {
            b.click();
            window._staffNavigated = true;
            console.log('Staff auto-navigated to طلبات جديدة');
            break;
          }
        }
      }
    }
  }
  
  function boot() {
    applyStaffRestrictions();
    setTimeout(navigateToNewRequestsForStaff, 1500);
    setTimeout(navigateToNewRequestsForStaff, 3000);
    
    new MutationObserver(function() {
      applyStaffRestrictions();
    }).observe(document.body, { childList: true, subtree: true });
    
    setInterval(function() {
      applyStaffRestrictions();
    }, 1200);
    
    // Protect lookup
    setInterval(function() {
      var el = document.getElementById('wd-membership-lookup');
      if (el) { el.style.setProperty('display', 'block', 'important');
        el.style.setProperty('visibility', 'visible', 'important'); }
    }, 800);
  }
  
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 800);
  
  console.log('Staff mode: October 1 restrictions active');
})();