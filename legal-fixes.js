// ============================================================================
// HOOKOS — legal page mobile fixes
// Keeps legal pages isolated from dashboard-only UI and fixes narrow mobile flow.
// ============================================================================

(function installLegalPageFixes() {
  const isLegalPage = document.documentElement.classList.contains('legal-page')
    || !!document.querySelector('.legal-page');
  if (!isLegalPage) return;

  function removeDashboardDeleteUI() {
    document.getElementById('hookos-delete-modal')?.remove();
    document.getElementById('hookos-delete-backdrop')?.remove();
    document.getElementById('hookos-delete-modal-styles')?.remove();
    document.body.classList.remove('modal-open');
    if (!document.getElementById('hookos-history-detail')) document.body.style.overflow = '';
  }

  function installStyles() {
    if (document.getElementById('hookos-legal-fixes')) return;
    const style = document.createElement('style');
    style.id = 'hookos-legal-fixes';
    style.textContent = `
      /* Legal pages must never inherit dashboard-only delete UI. */
      .legal-page ~ .hookos-modal,
      .legal-page ~ .hookos-modal-backdrop,
      body > #hookos-delete-modal,
      body > #hookos-delete-backdrop { display:none!important; }

      /* Keep every legal page locked to the real viewport. */
      html,body{width:100%;max-width:100%;overflow-x:hidden;}
      .legal-page{display:block;width:100%;max-width:100%;min-width:0;overflow-x:clip;}
      .legal-page .container{display:block;width:calc(100% - 36px);max-width:760px;min-width:0;margin-inline:auto;box-sizing:border-box;}
      .legal-page p,.legal-page li{max-width:100%;overflow-wrap:anywhere;word-break:normal;}
      .legal-page img,.legal-page iframe,.legal-page table{max-width:100%;}
      .legal-page .btn{max-width:100%;}

      /* Cookie table: readable on desktop, stacked cards on phones. */
      .legal-page .legal-table{width:100%;max-width:100%;border-collapse:collapse;table-layout:fixed;margin:26px 0 34px;}
      .legal-page .legal-table th,
      .legal-page .legal-table td{padding:13px 12px;border-bottom:1px solid rgba(49,56,65,.18);text-align:left;vertical-align:top;overflow-wrap:anywhere;word-break:normal;}
      .legal-page .legal-table th{font-size:13px;font-weight:800;letter-spacing:.02em;}
      .legal-page .legal-table td{font-size:15px;line-height:1.5;}
      .legal-page .legal-table th:nth-child(1),.legal-page .legal-table td:nth-child(1){width:29%;}
      .legal-page .legal-table th:nth-child(2),.legal-page .legal-table td:nth-child(2){width:51%;}
      .legal-page .legal-table th:nth-child(3),.legal-page .legal-table td:nth-child(3){width:20%;}
      .legal-page .legal-table code{font-size:.9em;overflow-wrap:anywhere;word-break:break-word;}

      @media(max-width:700px){
        .legal-page{padding-block:32px 52px!important;}
        .legal-page .container{width:calc(100% - 32px);max-width:none;padding-inline:0;}
        .legal-page h1{font-size:36px!important;line-height:1.06!important;letter-spacing:-.045em!important;margin-bottom:10px!important;}
        .legal-page .legal-updated{font-size:14px!important;line-height:1.45!important;margin-bottom:22px!important;}
        .legal-page p,.legal-page li{font-size:16px!important;line-height:1.52!important;}
        .legal-page h2{font-size:23px!important;line-height:1.16!important;margin-top:24px!important;margin-bottom:9px!important;}
        .legal-page ul{padding-left:20px!important;}

        .legal-page .legal-table{display:block;width:100%;margin:22px 0 30px;}
        .legal-page .legal-table thead{display:none;}
        .legal-page .legal-table tbody,
        .legal-page .legal-table tr,
        .legal-page .legal-table td{display:block;width:100%;box-sizing:border-box;}
        .legal-page .legal-table tr{margin:0 0 12px;padding:12px 14px;border:1px solid rgba(49,56,65,.18);border-radius:14px;background:#EEEEEE;}
        .legal-page .legal-table td{padding:5px 0;border:0;font-size:15px!important;line-height:1.45!important;}
        .legal-page .legal-table td::before{display:block;margin-bottom:2px;font-size:10px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:rgba(49,56,65,.65);}
        .legal-page .legal-table td:nth-child(1)::before{content:'Cookie';}
        .legal-page .legal-table td:nth-child(2)::before{content:'Purpose';}
        .legal-page .legal-table td:nth-child(3)::before{content:'Duration';}
      }
    `;
    document.head.appendChild(style);
  }

  removeDashboardDeleteUI();
  installStyles();
})();
