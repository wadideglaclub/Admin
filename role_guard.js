
(function(){
  function getRole(){
    try{ return (sessionStorage.getItem('wd_role') || localStorage.getItem('wd_role') || 'admin').toLowerCase(); }
    catch(e){ return 'admin'; }
  }
  var role = getRole();
  var isStaff = role === 'staff';
  window.WD_ROLE = role;
  window.WD_IS_STAFF = isStaff;
  window.WD_IS_ADMIN = !isStaff;

  function protectLookup(){
    var el = document.getElementById('wd-membership-lookup');
    if(el){
      el.style.setProperty('display','block','important');
      el.style.setProperty('visibility','visible','important');
      el.style.setProperty('max-width','100%','important');
    }
  }
  setInterval(protectLookup, 800);

  if(!isStaff){
    console.log('Admin mode - full access');
    return;
  }

  console.log('Staff mode - only new requests');

  function applyStaff(){
    // Hide admin-only buttons: لوحة التحكم, الفروع, إدارة النظام, قائمة الطلبات, استيراد شيت
    var hideTexts = ['لوحة التحكم', 'الفروع', 'إدارة النظام', 'قائمة الطلبات', 'استيراد شيت', 'استيراد شيت أماكن'];
    var btns = document.querySelectorAll('button, a');
    btns.forEach(function(btn){
      var t = (btn.textContent||'').trim();
      if(!t) return;
      if(btn.closest('#wd-membership-lookup')) return;
      for(var i=0;i<hideTexts.length;i++){
        if(t.includes(hideTexts[i])){
          // Hide the button itself or its container if it's a tab
          if(t.length < 40){ // avoid hiding long texts
            btn.style.display='none';
            // Also hide parent if it's a wrapper
            var parent = btn.parentElement;
            if(parent && parent.tagName === 'DIV' && parent.children.length === 1){
              // Don't hide if parent contains other important stuff
            }
          }
          break;
        }
      }
      // Exact matches
      if(['لوحة التحكم','الفروع','إدارة النظام'].includes(t)){
        if(!btn.closest('#wd-membership-lookup')) btn.style.display='none';
      }
    });

    // Hide import file input and its label
    var allDivs = document.querySelectorAll('div, label');
    allDivs.forEach(function(div){
      var txt = (div.textContent||'');
      if(txt.includes('استيراد شيت أماكن الكارنيهات') || txt.includes('لم يتم اختيار أي ملف') || txt.includes('اختيار ملف')){
        // Don't hide if inside lookup box
        if(div.closest && div.closest('#wd-membership-lookup')) return;
        // Only hide the import section, not the search
        if(txt.includes('استيراد شيت') && txt.length < 100){
          var container = div.closest('div');
          if(container){
            // Find the file input nearby
            var fileInput = container.querySelector('input[type="file"]');
            if(fileInput){
              container.style.display='none';
            }
          }
        }
      }
      if(txt.includes('البيانات الحالية:') && txt.includes('مكان محفوظ في الخلفية')){
        // Keep this but update? Let lookup.js handle it
      }
    });

    // Hide file input for import
    var fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(function(inp){
      if(inp.closest && inp.closest('#wd-membership-lookup')) return;
      var label = inp.parentElement ? inp.parentElement.textContent : '';
      if(label.includes('استيراد') || inp.id.includes('import') || inp.id.includes('sheet')){
        inp.closest('div').style.display='none';
      }
    });

    // Hide status dropdown in edit modal
    var modals = document.querySelectorAll('[id*="edit" i], [class*="edit" i], [id*="modal" i], [class*="modal" i], [role="dialog"]');
    modals.forEach(function(modal){
      if(modal.style.display==='none') return;
      var selects = modal.querySelectorAll('select');
      selects.forEach(function(sel){
        var pText = sel.parentElement ? sel.parentElement.textContent : '';
        if(pText.includes('الحالة') || pText.includes('حالة الكارنيهات')){
          sel.parentElement.style.display='none';
        }
      });
      // Also hide by label
      var labels = modal.querySelectorAll('label');
      labels.forEach(function(lbl){
        if(lbl.textContent.includes('الحالة') || lbl.textContent.includes('حالة الكارنيهات')){
          var next = lbl.nextElementSibling;
          if(next && next.tagName==='SELECT') next.style.display='none';
          lbl.style.display='none';
        }
      });
    });

    // Ensure new requests tab is visible and active
    var newReqBtns = document.querySelectorAll('button, a');
    newReqBtns.forEach(function(b){
      var t=(b.textContent||'').trim();
      if(t.includes('طلبات جديدة')){
        b.style.display='';
        b.style.setProperty('display','flex','important');
      }
    });

    protectLookup();
  }

  function boot(){
    setTimeout(applyStaff, 500);
    setTimeout(applyStaff, 1500);
    setTimeout(applyStaff, 3000);
    new MutationObserver(applyStaff).observe(document.body, {childList:true, subtree:true, attributes:true, attributeFilter:['style','class']});
    setInterval(applyStaff, 2000);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();