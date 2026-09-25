
(function(){
  function getRole(){ try{return (sessionStorage.getItem('wd_role')||localStorage.getItem('wd_role')||'admin').toLowerCase();}catch(e){return 'admin';} }
  var role = getRole();
  var isStaff = role === 'staff';

  // For STAFF: completely disable this patch (which adds حالة الكارنيهات)
  if(isStaff){
    console.log('STAFF - status patch disabled (حالة الكارنيهات محذوفة)');
    // Also hide any existing status field if already injected
    setInterval(function(){
      var field = document.getElementById('wd-status-field');
      if(field) field.style.setProperty('display','none','important');
    }, 500);
    return;
  }

  console.log('ADMIN - WD Patch v9 - status enabled');
  var currentEditId = null;
  var currentRowStatus = null;
  var currentRowElement = null;

  function getRequests(){
    try{ return JSON.parse(localStorage.getItem("wadi_degla_requests_final")||"[]"); }catch(e){ return []; }
  }
  function saveRequests(list){
    try{
      localStorage.setItem("wadi_degla_requests_final", JSON.stringify(list));
      if(window.__wdFlush) window.__wdFlush();
      window.dispatchEvent(new Event('storage'));
    }catch(e){}
  }

  function updateRowBadgeInPlace(newStatus){
    if(!currentRowElement) return;
    var badges = currentRowElement.querySelectorAll('td div, td span');
    badges.forEach(function(badge){
      if(badge.children.length>0) return;
      var txt = (badge.textContent||'').trim();
      if(txt.indexOf('قيد انتظار')!==-1 || txt.indexOf('تم الطباعة')!==-1 || txt.indexOf('تم الغاء')!==-1 || txt.indexOf('تم إلغاء')!==-1 || txt.indexOf('تم الاستلام')!==-1 || txt.indexOf('تم الارسال')!==-1 || txt.indexOf('تم الإرسال')!==-1){
        badge.textContent = newStatus;
        if(newStatus === 'تم الغاء الطلب'){
          badge.style.setProperty('background', '#FEE2E2', 'important');
          badge.style.setProperty('color', '#DC2626', 'important');
        } else if(newStatus === 'تم الطباعة'){
          badge.style.setProperty('background', '#E5E7EB', 'important');
          badge.style.setProperty('color', '#4B5563', 'important');
        } else if(newStatus === 'تم الاستلام'){
          badge.style.setProperty('background', '#DCFCE7', 'important');
          badge.style.setProperty('color', '#166534', 'important');
        } else {
          badge.style.setProperty('background', '#FEF9C3', 'important');
          badge.style.setProperty('color', '#854D0E', 'important');
        }
      }
    });
  }

  function closeEditModal(){
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', code: 'Escape'}));
    var field = document.getElementById('wd-status-field');
    if(field) field.remove();
    currentRowStatus = null;
  }

  document.addEventListener('click', function(e){
    var btn = e.target.closest('button');
    if(!btn) return;
    var tr = btn.closest('tr');
    if(!tr) return;
    currentRowElement = tr;
    var badges = tr.querySelectorAll('td div, td span');
    var foundStatus = null;
    badges.forEach(function(b){
      var txt = (b.textContent||'').trim();
      if(txt.indexOf('قيد انتظار')!==-1) foundStatus='قيد انتظار الكارنيهات';
      else if(txt.indexOf('تم الطباعة')!==-1) foundStatus='تم الطباعة';
      else if(txt.indexOf('تم الغاء')!==-1 || txt.indexOf('تم إلغاء')!==-1) foundStatus='تم الغاء الطلب';
      else if(txt.indexOf('تم الاستلام')!==-1) foundStatus='تم الاستلام';
      else if(txt.indexOf('تم الإرسال')!==-1) foundStatus='تم الإرسال';
    });
    if(foundStatus){
      currentRowStatus = foundStatus;
      var sel = document.getElementById('wd-status-select');
      if(sel){
        sel.value = currentRowStatus;
        window.__wdEditStatus = currentRowStatus;
      }
    }
    try{
      var tds = tr.querySelectorAll('td');
      var membershipText = '';
      for(var i=0;i<Math.min(4, tds.length); i++){
        var t = (tds[i].textContent||'').trim();
        if(t.length>=4 && /\d/.test(t) && t.length<20){
          membershipText = t;
        }
      }
      if(membershipText){
        var reqs = getRequests();
        for(var k=0;k<reqs.length;k++){
          if(reqs[k].membershipNumber && membershipText.indexOf(reqs[k].membershipNumber)!==-1 && reqs[k].status === foundStatus){
            currentEditId = reqs[k].id;
            break;
          }
        }
        if(!currentEditId){
          for(var k=0;k<reqs.length;k++){
            if(reqs[k].membershipNumber && membershipText.indexOf(reqs[k].membershipNumber)!==-1){
              currentEditId = reqs[k].id;
              break;
            }
          }
        }
      }
    }catch(e){}
  }, true);

  function injectStatusField(){
    if(isStaff) return;
    if(document.getElementById('wd-status-field')) return;
    var saveBtn = Array.from(document.querySelectorAll('button')).find(b => (b.textContent||'').indexOf('حفظ التعديلات')!==-1);
    if(!saveBtn) return;
    var formContainer = saveBtn.parentElement;
    var attempts=0;
    while(formContainer && attempts<5){
      if(formContainer.querySelectorAll('input').length>=2) break;
      formContainer=formContainer.parentElement;
      attempts++;
    }
    if(!formContainer) return;
    var inputs = formContainer.querySelectorAll('input');
    var membershipNumber = inputs[0] ? inputs[0].value.trim() : '';
    var requests = getRequests();
    var currentStatus = currentRowStatus || "قيد انتظار الكارنيهات";
    if(membershipNumber && !currentRowStatus){
      for(var k=0;k<requests.length;k++){
        if(requests[k].membershipNumber===membershipNumber){
          if(!currentEditId) currentEditId=requests[k].id;
          currentStatus = requests[k].status;
          break;
        }
      }
    } else if(currentEditId && !currentRowStatus){
      for(var k=0;k<requests.length;k++){
        if(requests[k].id===currentEditId){
          currentStatus = requests[k].status;
          break;
        }
      }
    }
    if(currentRowStatus) currentStatus = currentRowStatus;
    var wrapper = document.createElement('div');
    wrapper.id='wd-status-field';
    wrapper.style.cssText='margin:16px 0;';
    var showOldSent = (currentStatus === 'تم الإرسال' || currentStatus === 'تم الارسال');
    wrapper.innerHTML=`
      <div style="font-size:13px;font-weight:700;margin-bottom:8px;color:#000;">📋 حالة الكارنيهات <span style="color:#dc2626">*</span></div>
      <select id="wd-status-select" style="width:100%;height:48px;border:2px solid #000;border-radius:12px;padding:0 12px;font-size:14px;font-weight:700;background:#fff;color:#000;">
        ${showOldSent ? `<option value="تم الإرسال" selected>تم الإرسال</option>` : ''}
        <option value="قيد انتظار الكارنيهات" ${currentStatus==="قيد انتظار الكارنيهات"?'selected':''}>قيد انتظار الكارنيهات</option>
        <option value="تم الطباعة" ${currentStatus==="تم الطباعة"?'selected':''}>تم الطباعة</option>
        <option value="تم ارسال الإيميل" ${currentStatus==="تم ارسال الإيميل"?'selected':''}>تم ارسال الإيميل</option>
        <option value="تم الاستلام" ${currentStatus==="تم الاستلام"?'selected':''}>تم الاستلام</option>
        <option value="تم الإرسال" ${currentStatus==="تم الإرسال"?'selected':''}>تم الإرسال</option>
      </select>
      <div style="font-size:11px;color:#666;margin-top:6px;">الحالة الحالية: ${currentStatus}</div>
    `;
    saveBtn.parentElement.parentNode.insertBefore(wrapper, saveBtn.parentElement);
    var select=document.getElementById('wd-status-select');
    if(select){
      window.__wdEditStatus=select.value;
      select.addEventListener('change', function(){ window.__wdEditStatus=this.value; });
      if(!saveBtn.dataset.statusHooked){
        saveBtn.dataset.statusHooked='1';
        saveBtn.addEventListener('click', function(){
          var sel=document.getElementById('wd-status-select');
          var newStatus=sel?sel.value:null;
          var editId=currentEditId;
          if(newStatus && editId){
            setTimeout(function(){
              var reqs=getRequests();
              for(var r=0;r<reqs.length;r++){
                if(reqs[r].id===editId){ 
                  reqs[r].status=newStatus; 
                  break; 
                }
              }
              saveRequests(reqs);
              updateRowBadgeInPlace(newStatus);
              setTimeout(function(){
                closeEditModal();
                currentRowStatus = null;
              }, 400);
            }, 800);
          }
        });
      }
    }
  }

  var observer = new MutationObserver(function(){
    if(isStaff) return;
    var saveBtn = Array.from(document.querySelectorAll('button')).find(b => (b.textContent||'').indexOf('حفظ التعديلات')!==-1);
    if(saveBtn && !document.getElementById('wd-status-field')){
      setTimeout(injectStatusField, 200);
    }
  });
  observer.observe(document.body, {childList:true, subtree:true});
  setInterval(function(){
    if(isStaff) return;
    var saveBtn = Array.from(document.querySelectorAll('button')).find(b => (b.textContent||'').indexOf('حفظ التعديلات')!==-1);
    if(saveBtn && !document.getElementById('wd-status-field')){
      injectStatusField();
    }
  }, 800);
})();
