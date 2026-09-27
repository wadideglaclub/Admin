// SAFE ENFORCEMENT - مستحيل يعمل شاشة بيضا - CSS فقط
(function() {
  try {
    var role = (localStorage.getItem('wd_role') || sessionStorage.getItem('wd_role') || 'admin').toLowerCase();
    var isStaff = role === 'staff';
    if (!isStaff) {
      // Admin: أ أندرو أكرم ادمن
      setTimeout(function() {
        try {
          document.querySelectorAll('div').forEach(function(d) {
            if (d.textContent.trim() === 'خدمة عملاء موظفين') { d.textContent = 'أندرو أكرم ادمن'; }
            if (d.textContent.trim() === 'خدمة عملاء' && d.offsetWidth < 200) { d.textContent = 'أندرو أكرم ادمن'; }
          });
        } catch (e) {}
      }, 1000);
      return;
    }
    console.log('October 1 staff mode');
    // Staff: CSS to hide
    var style = document.createElement('style');
    style.id = 'staff-hide-style';
    style.innerHTML = `
      /* Hide dashboard, branches, admin management for October 1 */
      nav button:nth-child(1) { display: none !important; } /* لوحة التحكم */
    `;
    document.head.appendChild(style);
    
    function hide() {
      try {
        // Hide by text - only nav buttons
        document.querySelectorAll('nav button').forEach(function(btn) {
          var t = (btn.textContent || '').trim();
          if (t === 'لوحة التحكم' || t.indexOf('الفروع') !== -1 || t.indexOf('إدارة النظام') !== -1) {
            if (t.indexOf('طلبات جديدة') !== -1) return;
            btn.style.display = 'none';
          }
        });
        var ab = document.getElementById('wd-admin-btn');
        if (ab) ab.style.display = 'none';
        
        // Hide whatsapp for staff only
        document.querySelectorAll('button').forEach(function(b) {
          var txt = b.textContent || '';
          var html = b.innerHTML || '';
          if (txt.indexOf('واتساب') !== -1 || html.toLowerCase().indexOf('whatsapp') !== -1) {
            b.style.display = 'none';
          }
        });
        
        // Fix header to خ خدمة عملاء موظفين
        document.querySelectorAll('div').forEach(function(d) {
          if (d.children.length === 0) {
            var t = d.textContent.trim();
            if (t === 'أندرو أكرم أدمن' || t === 'أندرو أكرم') { d.textContent = 'خدمة عملاء موظفين'; }
            if (t === 'خدمة عملاء') { d.textContent = 'خدمة عملاء موظفين'; }
            if ((t === 'أ' || t === 'خ') && d.className.indexOf('rounded-full') !== -1) { d.textContent = 'خ'; }
          }
        });
      } catch (e) { console.log(e); }
    }
    
    function goNewRequests() {
      if (window._done) return;
      document.querySelectorAll('button').forEach(function(b) {
        if (b.textContent.trim() === 'طلبات جديدة' && b.offsetParent !== null) {
          b.click();
          window._done = true;
        }
      });
    }
    
    setTimeout(hide, 500);
    setTimeout(hide, 1500);
    setTimeout(goNewRequests, 1000);
    setTimeout(goNewRequests, 2500);
    setInterval(hide, 2000);
  } catch (e) { console.log('Safe error', e); }
})();