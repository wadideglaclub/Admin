
(function(){
  function getRole(){
    try{return (sessionStorage.getItem('wd_role')||localStorage.getItem('wd_role')||'admin').toLowerCase();}catch(e){return 'admin';}
  }
  function isAdmin(){return getRole()!=='staff';}
  
  function getDeleteRequests(){
    try{
      let s=localStorage.getItem('wadi_degla_delete_requests');
      if(s){let arr=JSON.parse(s); if(Array.isArray(arr)) return arr;}
    }catch(e){}
    return [];
  }
  function getRequests(){
    try{
      let s=localStorage.getItem('wadi_degla_requests_final');
      if(s){let arr=JSON.parse(s); if(Array.isArray(arr)) return arr;}
    }catch(e){}
    return [];
  }
  function saveDeleteRequests(arr){
    try{localStorage.setItem('wadi_degla_delete_requests', JSON.stringify(arr));}catch(e){}
  }
  function saveRequests(arr){
    try{localStorage.setItem('wadi_degla_requests_final', JSON.stringify(arr));}catch(e){}
  }
  
  function approveDelete(delId){
    let delReqs=getDeleteRequests();
    let req=delReqs.find(r=>r.id===delId);
    if(!req) return;
    if(!confirm(`تأكيد الموافقة على حذف الطلب؟\nرقم العضوية: ${req.membershipNumber}\nالاسم: ${req.ownerName}\nطلب بواسطة: ${req.requestedBy}`)) return;
    
    // Remove from main requests
    let mainReqs=getRequests();
    let filtered=mainReqs.filter(r=>r.id!==req.requestId);
    saveRequests(filtered);
    
    // Remove from delete requests (or mark approved)
    let remaining=delReqs.filter(r=>r.id!==delId);
    saveDeleteRequests(remaining);
    
    // Show toast if possible
    try{
      if(window.WD_SHOW_TOAST) window.WD_SHOW_TOAST(`تم حذف الطلب ${req.membershipNumber} بموافقة الادمن`, 'success');
    }catch(e){}
    
    alert(`✅ تمت الموافقة وحذف الطلب ${req.membershipNumber} بنجاح`);
    render();
    // Reload to update React state
    setTimeout(()=>{location.reload();}, 500);
  }
  
  function rejectDelete(delId){
    if(!confirm('رفض طلب الحذف؟')) return;
    let delReqs=getDeleteRequests();
    let remaining=delReqs.filter(r=>r.id!==delId);
    saveDeleteRequests(remaining);
    render();
    setTimeout(()=>{location.reload();}, 300);
  }
  
  function clearAll(){
    if(!confirm('حذف جميع طلبات الحذف المعلقة؟')) return;
    saveDeleteRequests([]);
    render();
    location.reload();
  }
  
  function createStyles(){
    if(document.getElementById('wd-del-approval-styles')) return;
    let style=document.createElement('style');
    style.id='wd-del-approval-styles';
    style.textContent=`
      #wd-del-bell{
        position:fixed; bottom:20px; right:20px; z-index:9999;
        width:60px; height:60px; border-radius:50%;
        background:#DC2626; color:white; border:3px solid white;
        box-shadow:0 4px 20px rgba(0,0,0,0.3);
        display:flex; align-items:center; justify-content:center;
        font-size:28px; cursor:pointer; font-weight:bold;
      }
      #wd-del-bell-count{
        position:absolute; top:-5px; right:-5px;
        background:#FFD700; color:black; border-radius:50%;
        width:26px; height:26px; display:flex; align-items:center; justify-content:center;
        font-size:12px; font-weight:900; border:2px solid white;
      }
      #wd-del-modal{
        position:fixed; inset:0; z-index:10000; background:rgba(0,0,0,0.6);
        backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center;
        padding:16px;
      }
      #wd-del-modal-box{
        background:white; border-radius:24px; width:100%; max-width:600px;
        max-height:85vh; overflow:hidden; display:flex; flex-direction:column;
        box-shadow:0 20px 60px rgba(0,0,0,0.3);
      }
      .wd-del-header{
        background:#0F0F0F; color:white; padding:16px 20px; display:flex; justify-content:space-between; align-items:center;
      }
      .wd-del-body{ padding:16px; overflow-y:auto; flex:1; }
      .wd-del-card{
        border:2px solid #e5e7eb; border-radius:16px; padding:12px; margin-bottom:12px; background:#fff;
      }
      .wd-del-card:hover{ border-color:#FFD700; }
      .wd-del-actions{ display:flex; gap:8px; margin-top:10px; }
      .wd-btn-approve{ flex:1; height:40px; border-radius:12px; background:#16a34a; color:white; border:none; font-weight:bold; cursor:pointer; }
      .wd-btn-reject{ flex:1; height:40px; border-radius:12px; background:#e5e7eb; color:#374151; border:none; font-weight:bold; cursor:pointer; }
      .wd-del-empty{ text-align:center; padding:40px 20px; color:#6b7280; }
    `;
    document.head.appendChild(style);
  }
  
  function render(){
    createStyles();
    
    // Remove old bell/modal
    let oldBell=document.getElementById('wd-del-bell');
    if(oldBell) oldBell.remove();
    let oldModal=document.getElementById('wd-del-modal');
    // keep modal if open, else remove
    
    let delReqs=getDeleteRequests();
    let pending=delReqs.filter(r=>r.status==='pending');
    
    if(!isAdmin()){
      // Staff: don't show bell, but show pending count in console
      return;
    }
    
    // Admin: show bell if pending
    if(pending.length>0){
      let bell=document.createElement('div');
      bell.id='wd-del-bell';
      bell.innerHTML=`🔔<div id="wd-del-bell-count">${pending.length}</div>`;
      bell.title=`${pending.length} طلب حذف في انتظار الموافقة`;
      bell.onclick=openModal;
      document.body.appendChild(bell);
    }
    
    // Also inject button into sidebar nav for admin
    try{
      let nav=document.querySelector('nav');
      if(nav && !document.getElementById('wd-del-nav-btn')){
        let btn=document.createElement('button');
        btn.id='wd-del-nav-btn';
        btn.className='h-[52px] lg:h-[48px] rounded-2xl flex items-center gap-3 px-4 font-bold text-[14px] transition border w-full mt-2 ' + (pending.length>0 ? 'bg-red-600 text-white border-red-600 animate-pulse' : 'bg-[#F8F8F5] border-zinc-200');
        btn.innerHTML=`🗑️ طلبات الحذف ${pending.length>0 ? `<span class="mr-auto bg-white text-red-600 text-[11px] px-2 py-0.5 rounded-full">${pending.length}</span>` : ''}`;
        btn.onclick=openModal;
        nav.appendChild(btn);
      } else if(document.getElementById('wd-del-nav-btn')){
        let btn=document.getElementById('wd-del-nav-btn');
        if(pending.length>0){
          btn.innerHTML=`🗑️ طلبات الحذف <span class="mr-auto bg-white text-red-600 text-[11px] px-2 py-0.5 rounded-full">${pending.length}</span>`;
          btn.className='h-[52px] lg:h-[48px] rounded-2xl flex items-center gap-3 px-4 font-bold text-[14px] transition border w-full mt-2 bg-red-600 text-white border-red-600';
        } else {
          btn.innerHTML=`🗑️ طلبات الحذف`;
          btn.className='h-[52px] lg:h-[48px] rounded-2xl flex items-center gap-3 px-4 font-bold text-[14px] transition border w-full mt-2 bg-[#F8F8F5] border-zinc-200';
        }
      }
    }catch(e){}
  }
  
  function openModal(){
    createStyles();
    let existing=document.getElementById('wd-del-modal');
    if(existing) existing.remove();
    
    let delReqs=getDeleteRequests();
    let pending=delReqs.filter(r=>r.status==='pending');
    
    let modal=document.createElement('div');
    modal.id='wd-del-modal';
    
    let box=document.createElement('div');
    box.id='wd-del-modal-box';
    
    let header=document.createElement('div');
    header.className='wd-del-header';
    header.innerHTML=`<div><div style="font-weight:900; font-size:16px;">🗑️ طلبات الحذف المعلقة (${pending.length})</div><div style="font-size:11px; opacity:0.7; margin-top:2px;">موظفين طلبوا حذف طلبات - اضغط موافقة للحذف</div></div><button id="wd-del-close" style="width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.1); border:none; color:white; cursor:pointer;">✕</button>`;
    
    let body=document.createElement('div');
    body.className='wd-del-body';
    
    if(pending.length===0){
      body.innerHTML=`<div class="wd-del-empty"><div style="font-size:48px;">✅</div><div style="font-weight:bold; margin-top:8px;">لا يوجد طلبات حذف معلقة</div><div style="font-size:12px; margin-top:4px;">عندما يطلب موظف حذف طلب، سيظهر هنا</div></div>`;
    } else {
      pending.forEach(req=>{
        let card=document.createElement('div');
        card.className='wd-del-card';
        card.innerHTML=`
          <div style="display:flex; justify-content:space-between; align-items:start;">
            <div style="font-weight:900; font-size:14px;">${req.membershipNumber} - ${req.ownerName||'بدون اسم'}</div>
            <div style="font-size:10px; background:#FEF3C7; color:#92400E; padding:2px 8px; border-radius:20px; font-weight:bold;">${req.requestedAt}</div>
          </div>
          <div style="font-size:12px; color:#4b5563; margin-top:6px; line-height:1.6;">
            <div>📋 <b>من:</b> ${req.fromBranch||'-'} → <b>إلى:</b> ${req.toBranch||'-'}</div>
            <div>💳 <b>نوع:</b> ${req.cardType||'-'} | 📞 <b>تليفون:</b> ${req.phone||'-'}</div>
            <div>👤 <b>الموظف:</b> ${req.employee||'-'}</div>
            <div style="margin-top:4px; padding:6px 8px; background:#F3F4F6; border-radius:8px;">👨‍💼 <b>طلب الحذف بواسطة:</b> ${req.requestedBy}</div>
          </div>
          <div class="wd-del-actions">
            <button class="wd-btn-reject" data-action="reject" data-id="${req.id}">❌ رفض</button>
            <button class="wd-btn-approve" data-action="approve" data-id="${req.id}">✅ موافقة وحذف</button>
          </div>
        `;
        body.appendChild(card);
      });
      
      let clearBtn=document.createElement('button');
      clearBtn.textContent='مسح الكل';
      clearBtn.style.cssText='width:100%; margin-top:12px; height:36px; border-radius:10px; border:1px solid #e5e7eb; background:white; font-size:12px; font-weight:bold; cursor:pointer;';
      clearBtn.onclick=clearAll;
      body.appendChild(clearBtn);
    }
    
    box.appendChild(header);
    box.appendChild(body);
    modal.appendChild(box);
    document.body.appendChild(modal);
    
    document.getElementById('wd-del-close').onclick=()=>{modal.remove();};
    modal.onclick=(e)=>{if(e.target===modal) modal.remove();};
    
    body.querySelectorAll('[data-action="approve"]').forEach(btn=>{
      btn.onclick=()=>{approveDelete(btn.getAttribute('data-id'));};
    });
    body.querySelectorAll('[data-action="reject"]').forEach(btn=>{
      btn.onclick=()=>{rejectDelete(btn.getAttribute('data-id'));};
    });
  }
  
  // Expose globally for debugging
  window.WD_DELETE_APPROVAL={
    getRequests:getDeleteRequests,
    approve:approveDelete,
    reject:rejectDelete,
    open:openModal,
    render:render
  };
  
  function boot(){
    render();
    setInterval(render, 2000);
    // Listen for storage changes
    window.addEventListener('storage', render);
  }
  
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    setTimeout(boot, 1000);
  }
})();
