(function(){
  try{
    var role = (localStorage.getItem('wd_role') || sessionStorage.getItem('wd_role') || 'admin').toLowerCase();
    if(role==='staff'){
      console.log('October 1 - hide status');
      setInterval(function(){
        try{
          var f=document.getElementById('wd-status-field');
          if(f) f.style.display='none';
          var s=document.getElementById('wd-status-select');
          if(s && s.parentElement) s.parentElement.style.display='none';
        }catch(e){}
      },1000);
      return;
    }
    console.log('Admin - show status');
    // Original status patch for admin only - simple version
    var currentEditId=null, currentRowStatus=null, currentRowElement=null;
    function getRequests(){ try{return JSON.parse(localStorage.getItem("wadi_degla_requests_final")||"[]");}catch(e){return [];} }
    function saveRequests(list){ try{ localStorage.setItem("wadi_degla_requests_final", JSON.stringify(list)); if(window.__wdFlush) window.__wdFlush(); }catch(e){} }
    document.addEventListener('click', function(e){
      var btn=e.target.closest('button'); if(!btn) return;
      var tr=btn.closest('tr'); if(!tr) return;
      currentRowElement=tr;
      var badges=tr.querySelectorAll('td div, td span');
      var found=null;
      badges.forEach(function(b){
        var txt=(b.textContent||'').trim();
        if(txt.indexOf('قيد انتظار')!==-1) found='قيد انتظار الكارنيهات';
        else if(txt.indexOf('تم الطباعة')!==-1) found='تم الطباعة';
        else if(txt.indexOf('تم الغاء')!==-1 || txt.indexOf('تم إلغاء')!==-1) found='تم الغاء الطلب';
        else if(txt.indexOf('تم الاستلام')!==-1) found='تم الاستلام';
        else if(txt.indexOf('تم الإرسال')!==-1) found='تم الإرسال';
      });
      if(found) currentRowStatus=found;
      try{
        var tds=tr.querySelectorAll('td');
        var mem='';
        for(var i=0;i<Math.min(4,tds.length);i++){
          var t=(tds[i].textContent||'').trim();
          if(t.length>=4 && /\d/.test(t) && t.length<20) mem=t;
        }
        if(mem){
          var reqs=getRequests();
          for(var k=0;k<reqs.length;k++){
            if(reqs[k].membershipNumber && mem.indexOf(reqs[k].membershipNumber)!==-1){
              currentEditId=reqs[k].id; break;
            }
          }
        }
      }catch(e){}
    }, true);
    function inject(){
      if(document.getElementById('wd-status-field')) return;
      var saveBtn=Array.from(document.querySelectorAll('button')).find(function(b){return (b.textContent||'').indexOf('حفظ التعديلات')!==-1;});
      if(!saveBtn) return;
      var wrapper=document.createElement('div');
      wrapper.id='wd-status-field';
      wrapper.style.cssText='margin:16px 0;';
      var cur=currentRowStatus||"قيد انتظار الكارنيهات";
      wrapper.innerHTML='<div style="font-size:13px;font-weight:700;margin-bottom:8px;color:#000;">📋 حالة الكارنيهات <span style="color:#dc2626">*</span></div><select id="wd-status-select" style="width:100%;height:48px;border:2px solid #000;border-radius:12px;padding:0 12px;font-size:14px;font-weight:700;background:#fff;color:#000;"><option value="قيد انتظار الكارنيهات" '+(cur==="قيد انتظار الكارنيهات"?'selected':'')+'>قيد انتظار الكارنيهات</option><option value="تم الطباعة" '+(cur==="تم الطباعة"?'selected':'')+'>تم الطباعة</option><option value="تم الاستلام" '+(cur==="تم الاستلام"?'selected':'')+'>تم الاستلام</option><option value="تم الإرسال" '+(cur==="تم الإرسال"?'selected':'')+'>تم الإرسال</option></select>';
      saveBtn.parentElement.parentNode.insertBefore(wrapper, saveBtn.parentElement);
      var sel=document.getElementById('wd-status-select');
      if(sel){
        sel.addEventListener('change', function(){ window.__wdEditStatus=this.value; });
        if(!saveBtn.dataset.hooked){
          saveBtn.dataset.hooked='1';
          saveBtn.addEventListener('click', function(){
            var s=document.getElementById('wd-status-select');
            var ns=s?s.value:null;
            var eid=currentEditId;
            if(ns && eid){
              setTimeout(function(){
                var reqs=getRequests();
                for(var r=0;r<reqs.length;r++){ if(reqs[r].id===eid){ reqs[r].status=ns; break; } }
                saveRequests(reqs);
              },800);
            }
          });
        }
      }
    }
    setInterval(function(){
      var saveBtn=Array.from(document.querySelectorAll('button')).find(function(b){return (b.textContent||'').indexOf('حفظ التعديلات')!==-1;});
      if(saveBtn && !document.getElementById('wd-status-field')) inject();
    },800);
  }catch(e){ console.log(e); }
})();
