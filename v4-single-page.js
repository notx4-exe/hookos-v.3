/* HookOS v4: keep the core creation flow on one page. */
(function initHookOSV4(){
  function wire(){
    const generator=document.getElementById('generator');
    const results=document.getElementById('results');
    if(generator){
      document.querySelectorAll('a[href="#generator"]').forEach((link)=>{
        link.addEventListener('click',()=>setTimeout(()=>document.getElementById('idea-input')?.focus(),250));
      });
    }
    if(results){
      const observer=new MutationObserver(()=>{
        if(!results.hidden){
          results.scrollIntoView({behavior:'smooth',block:'start'});
        }
      });
      observer.observe(results,{attributes:true,attributeFilter:['hidden']});
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',wire); else wire();
})();
