import { useEffect, useState } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --red:#E63946;--red-glow:rgba(230,57,70,0.35);--red-dim:rgba(230,57,70,0.15);
    --bg:#080810;--glass:rgba(255,255,255,0.04);--glass-h:rgba(255,255,255,0.07);
    --border:rgba(255,255,255,0.09);--border-red:rgba(230,57,70,0.4);
    --text:#f0f0f8;--muted:#7a7a9a;--muted2:#4a4a6a;
    --success:#22d3a0;--warn:#f59e0b;--f:'Inter',sans-serif;--nh:62px;
  }
  body{font-family:var(--f);background:var(--bg);color:var(--text);overflow-x:hidden;}
  ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:var(--muted2);border-radius:2px;}
  .orb{position:fixed;border-radius:50%;filter:blur(120px);pointer-events:none;z-index:0;}
  .orb1{width:500px;height:500px;background:rgba(230,57,70,0.07);top:-180px;right:-80px;}
  .orb2{width:420px;height:420px;background:rgba(100,80,230,0.06);bottom:-120px;left:-80px;}
  .glass{background:var(--glass);border:1px solid var(--border);backdrop-filter:blur(20px);border-radius:20px;}

  /* BUTTONS */
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 22px;border-radius:12px;font-family:var(--f);font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;border:none;outline:none;white-space:nowrap;min-height:42px;}
  .btn-p{background:linear-gradient(135deg,#E63946,#c42836);color:#fff;box-shadow:0 0 24px var(--red-glow);}
  .btn-p:hover{transform:translateY(-1px);box-shadow:0 0 36px var(--red-glow);}
  .btn-g{background:var(--glass);border:1px solid var(--border);color:var(--text);}
  .btn-g:hover{background:var(--glass-h);}
  .btn-o{background:transparent;border:1px solid var(--border);color:var(--muted);}
  .btn-o:hover{border-color:rgba(255,255,255,0.25);color:var(--text);background:var(--glass);}
  .btn-danger{background:rgba(230,57,70,0.1);border:1px solid var(--border-red);color:var(--red);}
  .btn-danger:hover{background:rgba(230,57,70,0.2);}
  .btn-success{background:rgba(34,211,160,0.1);border:1px solid rgba(34,211,160,0.3);color:var(--success);}
  .btn-sm{padding:7px 14px;font-size:13px;border-radius:9px;min-height:36px;}
  .btn-icon{width:42px;height:42px;padding:0;border-radius:10px;}
  .btn:disabled{opacity:.4;cursor:not-allowed;}

  /* INPUTS */
  .inp{width:100%;padding:12px 15px;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:12px;color:var(--text);font-family:var(--f);font-size:14px;transition:all .2s;outline:none;min-height:46px;}
  .inp::placeholder{color:var(--muted2);}
  .inp:focus{border-color:var(--border-red);box-shadow:0 0 0 3px rgba(230,57,70,0.1);}
  textarea.inp{min-height:80px;resize:vertical;}
  select.inp{cursor:pointer;}

  /* BADGES */
  .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.04em;}
  .bu{background:rgba(34,211,160,0.12);color:var(--success);border:1px solid rgba(34,211,160,0.2);}
  .bc{background:rgba(255,255,255,0.06);color:var(--muted);border:1px solid var(--border);}
  .bx{background:rgba(230,57,70,0.1);color:var(--red);border:1px solid var(--border-red);}
  .ba{background:rgba(230,57,70,0.15);color:var(--red);border:1px solid var(--border-red);}
  .bw{background:rgba(245,158,11,0.12);color:var(--warn);border:1px solid rgba(245,158,11,0.3);}

  /* NAV — PUBLIC HEADER */
  .nav{position:fixed;top:0;left:0;right:0;z-index:200;height:var(--nh);display:flex;align-items:center;padding:0 clamp(16px,4vw,32px);gap:10px;background:rgba(8,8,16,0.92);backdrop-filter:blur(24px);border-bottom:1px solid var(--border);}
  .nav-logo{display:inline-flex;align-items:center;cursor:pointer;flex-shrink:0;line-height:0;}
  .brand-logo-img{display:block;width:auto;object-fit:contain;}
  .nav-right{display:flex;align-items:center;gap:8px;margin-left:auto;}
  .nav-hide-sm{display:flex;}
  @media(max-width:580px){.nav-hide-sm{display:none!important;}}

  /* NAV — ADMIN / STAFF (dedicated dashboards) */
  .dnav{position:sticky;top:0;z-index:200;height:var(--nh);display:flex;align-items:center;padding:0 clamp(16px,4vw,32px);gap:12px;backdrop-filter:blur(24px);border-bottom:1px solid var(--border);}
  .dnav-admin{background:rgba(10,8,20,0.95);}
  .dnav-staff{background:rgba(8,10,20,0.95);}

  /* MOBILE DRAWER */
  .dov{position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:300;animation:fi .2s ease;}
  .drw{position:fixed;top:0;right:0;bottom:0;width:min(280px,85vw);background:#0d0d1a;border-left:1px solid var(--border);z-index:301;padding:18px 14px;display:flex;flex-direction:column;gap:3px;animation:sl .25s ease;overflow-y:auto;}
  .drw-left{left:0;right:auto;border-left:none;border-right:1px solid var(--border);animation:sll .25s ease;}
  @keyframes sl{from{transform:translateX(100%);}to{transform:translateX(0);}}
  @keyframes sll{from{transform:translateX(-100%);}to{transform:translateX(0);}}
  @keyframes fi{from{opacity:0;}to{opacity:1;}}
  .di{display:flex;align-items:center;gap:11px;padding:13px 14px;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;transition:all .14s;color:var(--muted);min-height:46px;}
  .di:hover{background:var(--glass);color:var(--text);}
  .di.act{background:var(--red-dim);color:var(--red);border:1px solid var(--border-red);}
  .mi{min-width:24px;height:20px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.04);border:1px solid var(--border);font-size:10px;font-weight:800;letter-spacing:.04em;color:var(--muted);}
  .emb-inline{padding:10px 14px 0;display:flex;align-items:center;justify-content:flex-end;}
  .emb-hmb{position:relative;z-index:2;width:42px;height:42px;border-radius:12px;border:1px solid var(--border);background:rgba(13,13,26,.94);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:pointer;backdrop-filter:blur(10px);}
  .emb-hmb span,.hmb-bars span{display:block;width:16px;height:2px;border-radius:2px;background:#e7e7f4;}
  .hmb-bars{display:none!important;flex-direction:column;align-items:center;justify-content:center;gap:4px;}
  @media(max-width:580px){.hmb-bars{display:flex!important;}}

  /* HOME LAYOUT */
  .home{padding-top:var(--nh);padding-inline:clamp(14px,3vw,28px);padding-bottom:clamp(16px,3vw,28px);min-height:100vh;}
  .home-form{max-width:960px;margin:0 auto;background:rgba(8,8,16,0.7);backdrop-filter:blur(20px);padding:clamp(22px,4vw,36px);border:1px solid var(--border);border-radius:20px;}
  .hero-tag{display:inline-flex;align-items:center;gap:8px;background:var(--red-dim);border:1px solid var(--border-red);border-radius:20px;padding:5px 14px;font-size:12px;color:var(--red);font-weight:600;margin-bottom:22px;width:fit-content;}
  .hero-h1{font-size:clamp(34px,5.5vw,70px);font-weight:900;line-height:1.05;letter-spacing:-.035em;margin-bottom:18px;}
  .hero-sub{font-size:clamp(14px,1.8vw,16px);color:var(--muted);line-height:1.75;max-width:420px;margin-bottom:28px;}
  .hero-stats{display:flex;gap:clamp(16px,3vw,32px);flex-wrap:wrap;}
  .hstat-v{font-size:clamp(18px,3vw,26px);font-weight:900;letter-spacing:-.03em;}
  .hstat-l{font-size:11px;color:var(--muted);margin-top:2px;}

  /* AUTH PAGES */
  .auth-page{min-height:calc(100vh - var(--nh));display:flex;align-items:center;justify-content:center;padding:40px 16px;padding-top:calc(var(--nh) + 40px);}
  .auth-card{background:#0f0f1e;border:1px solid var(--border);border-radius:24px;padding:clamp(24px,4vw,40px);width:100%;max-width:420px;}
  .auth-brand{text-align:center;margin-bottom:28px;}
  .auth-logo{display:inline-flex;align-items:center;justify-content:center;margin-bottom:8px;line-height:0;}
  .auth-badge{display:inline-flex;align-items:center;gap:6px;background:var(--glass);border:1px solid var(--border);border-radius:20px;padding:4px 14px;font-size:12px;color:var(--muted);}

  /* MODAL */
  .mov{position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);z-index:500;display:flex;align-items:center;justify-content:center;padding:16px;animation:fi .2s ease;}
  .modal{background:#0f0f1f;border:1px solid var(--border);border-radius:24px;padding:clamp(20px,4vw,32px);width:100%;max-width:460px;position:relative;animation:su .25s ease;max-height:92vh;overflow-y:auto;}
  .modal-lg{max-width:560px;}
  @keyframes su{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
  .tabs{display:flex;background:rgba(255,255,255,0.04);border-radius:12px;padding:4px;margin-bottom:18px;}
  .tab{flex:1;padding:9px;text-align:center;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;color:var(--muted);}
  .tab.act{background:var(--red);color:#fff;box-shadow:0 0 14px var(--red-glow);}

  /* PROGRESS */
  .prog{display:flex;align-items:flex-start;margin-bottom:36px;}
  .prog-step{display:flex;align-items:center;flex:1;flex-direction:column;}
  .prog-lw{display:flex;align-items:center;width:100%;}
  .pdot{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;transition:all .3s;z-index:1;}
  .pd{background:var(--red);color:#fff;box-shadow:0 0 12px var(--red-glow);}
  .pa{background:var(--red-dim);border:2px solid var(--red);color:var(--red);}
  .pf{background:rgba(255,255,255,0.06);border:1px solid var(--border);color:var(--muted2);}
  .pline{flex:1;height:1px;background:var(--border);margin:0 2px;transition:background .3s;}
  .pline.done{background:var(--red);}
  .plbl{margin-top:5px;font-size:9px;white-space:nowrap;color:var(--muted2);font-weight:500;}
  .plbl.act{color:var(--red);}.plbl.done{color:var(--muted);}
  .prog-mini{display:none;align-items:center;justify-content:space-between;margin-bottom:22px;padding:13px 16px;border-radius:14px;background:var(--glass);border:1px solid var(--border);}
  .pm-dots{display:flex;gap:4px;}
  .pm{width:7px;height:7px;border-radius:50%;background:var(--muted2);transition:all .2s;}
  .pm.done{background:var(--red);width:16px;border-radius:4px;}
  .pm.act{background:var(--red);box-shadow:0 0 8px var(--red-glow);}
  @media(max-width:640px){.prog{display:none;}.prog-mini{display:flex;}}

  /* SERVICE & STAFF CARDS */
  .sg{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
  @media(max-width:860px){.sg{grid-template-columns:repeat(2,1fr);}}
  @media(max-width:460px){.sg{grid-template-columns:1fr;}}
  .scard{background:var(--glass);border:1px solid var(--border);border-radius:16px;overflow:hidden;cursor:pointer;transition:all .25s;}
  .scard:hover{border-color:rgba(230,57,70,.3);transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,.3);}
  .scard.sel{border-color:var(--red);box-shadow:0 0 0 1px var(--red),0 8px 28px var(--red-glow);background:rgba(230,57,70,.06);}
  .simg{width:100%;height:120px;overflow:hidden;background:#0d0d1a;}
  .simg img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s ease;}
  .scard:hover .simg img,.scard.sel .simg img{transform:scale(1.06);}
  .simg-fb{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px;background:linear-gradient(135deg,rgba(230,57,70,.14),rgba(100,60,180,.14));}
  .sbody{padding:12px;}
  .sname{font-size:13px;font-weight:700;margin-bottom:3px;letter-spacing:-.01em;}
  .sdesc{font-size:11px;color:var(--muted);margin-bottom:9px;line-height:1.5;}
  .smeta{display:flex;justify-content:space-between;align-items:center;}
  .sprice{font-size:16px;font-weight:800;color:var(--red);}
  .sdur{font-size:10px;color:var(--muted);background:rgba(255,255,255,0.06);padding:3px 7px;border-radius:5px;}
  .staffg{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
  @media(max-width:700px){.staffg{grid-template-columns:repeat(2,1fr);}}
  .stcard{background:var(--glass);border:1px solid var(--border);border-radius:14px;padding:16px 12px;cursor:pointer;transition:all .25s;text-align:center;}
  .stcard:hover{border-color:rgba(230,57,70,.3);transform:translateY(-2px);}
  .stcard.sel{border-color:var(--red);box-shadow:0 0 0 1px var(--red),0 8px 24px var(--red-glow);background:rgba(230,57,70,.06);}
  .avt{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;}

  /* CALENDAR */
  .calg{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}
  .cdn{text-align:center;font-size:11px;color:var(--muted2);font-weight:600;padding:4px 0;}
  .cd{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:12px;cursor:pointer;transition:all .15s;font-weight:500;min-height:30px;}
  .cd:hover:not(.cpast):not(.cem){background:var(--glass-h);}
  .cd.csel{background:var(--red);color:#fff;box-shadow:0 0 12px var(--red-glow);}
  .cd.ctoday:not(.csel){border:1px solid var(--border-red);color:var(--red);}
  .cd.cpast{color:var(--muted2);cursor:default;opacity:.3;}
  .cd.cem{cursor:default;}
  .tg{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;}
  .ts{padding:10px 6px;border-radius:9px;border:1px solid var(--border);background:var(--glass);font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;text-align:center;min-height:40px;display:flex;align-items:center;justify-content:center;}
  .ts:hover:not(.tbk){border-color:rgba(230,57,70,.4);background:var(--red-dim);color:var(--red);}
  .ts.tsel{background:var(--red);border-color:var(--red);color:#fff;box-shadow:0 0 12px var(--red-glow);}
  .ts.tbk{opacity:.3;cursor:not-allowed;text-decoration:line-through;}
  .dtg{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
  @media(max-width:660px){.dtg{grid-template-columns:1fr;}}

  /* BOOKING FOOTER */
  .bfoot{display:flex;justify-content:space-between;align-items:center;margin-top:28px;padding-top:18px;border-top:1px solid var(--border);gap:10px;flex-wrap:wrap;}
  @media(max-width:400px){.bfoot .btn{flex:1;}}

  /* DASHBOARD */
  .dash{display:flex;min-height:calc(100vh - var(--nh));}
  .sidebar{width:210px;flex-shrink:0;padding:16px 12px;padding-bottom:70px;border-right:1px solid var(--border);background:rgba(8,8,16,.7);backdrop-filter:blur(20px);position:sticky;top:var(--nh);height:calc(100vh - var(--nh));overflow-y:auto;}
  @media(max-width:820px){.sidebar{display:none;}}
  .sitem{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:11px;font-size:13px;font-weight:500;cursor:pointer;transition:all .15s;color:var(--muted);margin-bottom:2px;min-height:42px;}
  .sitem:hover{background:var(--glass);color:var(--text);}
  .sitem.act{background:var(--red-dim);color:var(--red);border:1px solid var(--border-red);}
  .ssec{font-size:10px;font-weight:700;color:var(--muted2);letter-spacing:.1em;padding:12px 12px 5px;}
  .bnav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:150;background:rgba(8,8,16,.95);backdrop-filter:blur(20px);border-top:1px solid var(--border);padding:6px 0 max(8px,env(safe-area-inset-bottom));flex-direction:row;justify-content:space-around;}
  @media(max-width:820px){.bnav{display:flex;}}
  .bni{display:flex;flex-direction:column;align-items:center;gap:2px;padding:5px 8px;border-radius:10px;cursor:pointer;color:var(--muted);font-size:10px;font-weight:600;min-width:52px;}
  .bni.act{color:var(--red);}
  .ca{flex:1;padding:24px;overflow-y:auto;min-width:0;}
  @media(max-width:820px){.ca{padding:16px;padding-bottom:80px;}}

  /* GRIDS */
  .g2{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;}
  .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
  @media(max-width:900px){.g4{grid-template-columns:repeat(2,1fr);}}
  @media(max-width:580px){.g2{grid-template-columns:1fr;}}

  /* TABLE */
  .tw{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:18px;}
  table{width:100%;border-collapse:collapse;min-width:480px;}
  th{text-align:left;font-size:11px;font-weight:700;color:var(--muted2);letter-spacing:.06em;padding:10px 12px;border-bottom:1px solid var(--border);white-space:nowrap;}
  td{padding:12px 12px;font-size:13px;border-bottom:1px solid rgba(255,255,255,.04);}
  tr:hover td{background:rgba(255,255,255,.02);}

  /* MISC */
  .lbl{font-size:11px;color:var(--muted);font-weight:700;letter-spacing:.07em;display:block;margin-bottom:5px;}
  .sh{font-size:clamp(18px,4vw,24px);font-weight:800;letter-spacing:-.02em;}
  .ss{color:var(--muted);font-size:13px;margin-bottom:20px;margin-top:3px;}
  .stat{padding:16px;border-radius:14px;background:var(--glass);border:1px solid var(--border);}
  .stat-v{font-size:26px;font-weight:900;letter-spacing:-.03em;}
  .stat-l{font-size:12px;color:var(--muted);margin-top:3px;}
  .stat-c{font-size:11px;color:var(--success);font-weight:600;margin-top:5px;}
  .srow{display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--border);}
  .srow:last-child{border-bottom:none;}
  .slbl{font-size:13px;color:var(--muted);}
  .sval{font-size:13px;font-weight:600;text-align:right;}
  .check-c{width:68px;height:68px;border-radius:50%;background:linear-gradient(135deg,var(--red),#c42836);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;box-shadow:0 0 36px var(--red-glow);font-size:30px;}
  .refcode{font-family:monospace;font-size:clamp(13px,3.5vw,17px);letter-spacing:.1em;color:var(--red);background:var(--red-dim);border:1px solid var(--border-red);border-radius:9px;padding:9px 16px;display:inline-block;margin:5px 0;}
  .sinp{width:100%;padding:13px 14px;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:11px;color:var(--text);font-family:monospace;font-size:15px;letter-spacing:.07em;min-height:46px;outline:none;}
  .sinp::placeholder{color:var(--muted2);}
  .sinp:focus{border-color:var(--border-red);}
  .ata{color:var(--red);cursor:pointer;font-size:13px;font-weight:600;}
  .tog{width:38px;height:21px;border-radius:11px;background:var(--muted2);position:relative;cursor:pointer;transition:background .2s;flex-shrink:0;}
  .tog.on{background:var(--red);}
  .tog::after{content:'';width:15px;height:15px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:transform .2s;}
  .tog.on::after{transform:translateX(17px);}
  .ld span{animation:bk 1.2s infinite;display:inline-block;}
  .ld span:nth-child(2){animation-delay:.2s;}.ld span:nth-child(3){animation-delay:.4s;}
  @keyframes bk{0%,80%,100%{opacity:0;}40%{opacity:1;}}
  .se{animation:su .3s ease;}
  .filter-pill{padding:6px 13px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;border:1px solid var(--border);background:var(--glass);color:var(--muted);}
  .filter-pill:hover{background:var(--glass-h);color:var(--text);}
  .filter-pill.on{background:var(--red-dim);border-color:var(--border-red);color:var(--red);}
  .drow{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border);font-size:13px;}
  .drow:last-child{border-bottom:none;}

  /* TOAST */
  .toast-wrap{position:fixed;bottom:80px;right:20px;z-index:999;display:flex;flex-direction:column;gap:8px;pointer-events:none;}
  .toast{padding:11px 15px;border-radius:13px;font-size:13px;font-weight:600;backdrop-filter:blur(20px);animation:su .3s ease;display:flex;align-items:center;gap:8px;max-width:280px;box-shadow:0 8px 28px rgba(0,0,0,.4);}
  .toast-success{background:rgba(34,211,160,.15);border:1px solid rgba(34,211,160,.3);color:var(--success);}
  .toast-error{background:rgba(230,57,70,.15);border:1px solid var(--border-red);color:var(--red);}
  .toast-info{background:rgba(255,255,255,.08);border:1px solid var(--border);color:var(--text);}

  /* PENDING APPROVAL SCREEN */
  .pending-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:calc(100vh - var(--nh));padding:40px 20px;text-align:center;}
  .pending-icon{width:84px;height:84px;border-radius:50%;background:rgba(245,158,11,.12);border:2px solid rgba(245,158,11,.35);display:flex;align-items:center;justify-content:center;margin:0 auto 22px;font-size:38px;}

  /* SERVICE PILL (staff self-assign) */
  .svc-pill{padding:7px 13px;border-radius:11px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;border:1px solid var(--border);background:var(--glass);color:var(--muted);display:flex;align-items:center;gap:8px;}
  .svc-pill:hover{background:var(--glass-h);color:var(--text);}
  .svc-pill.on{background:var(--red-dim);border-color:var(--border-red);color:var(--red);}
  .svc-thumb{width:26px;height:20px;border-radius:4px;overflow:hidden;flex-shrink:0;background:#0d0d1a;}
  .svc-thumb img{width:100%;height:100%;object-fit:cover;}
`;

// ─── DATA ──────────────────────────────────────────────────────────────────────
const LOGO_URL = "https://snippo.nextbusinesssolution.com/wp-content/uploads/2026/02/tmpd7p765pj-1.webp";

function BrandLogo({ size = 30, className = "", onClick = null }) {
  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", lineHeight: 0, cursor: onClick ? "pointer" : "default" }}
      onClick={onClick || undefined}
    >
      <img
        src={LOGO_URL}
        alt="Logo"
        className="brand-logo-img"
        style={{ height: size }}
      />
    </span>
  );
}

const SVCS = [
  {id:1,name:"Luxury Facial",desc:"Deep cleanse, exfoliation & LED therapy",price:120,dur:"60",img:"https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",active:true},
  {id:2,name:"Hot Stone Massage",desc:"Full-body relaxation with volcanic basalt stones",price:180,dur:"120",img:"https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",active:true},
  {id:3,name:"Hair Styling",desc:"Cut, wash, blowout & professional styling",price:85,dur:"60",img:"https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",active:true},
  {id:4,name:"Nail Art Studio",desc:"Gel manicure & pedicure with custom nail art",price:65,dur:"90",img:"https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80",active:true},
  {id:5,name:"Deep Tissue Massage",desc:"Therapeutic massage targeting muscle tension",price:150,dur:"90",img:"https://images.unsplash.com/photo-1552693673-1bf958298935?w=600&q=80",active:true},
  {id:6,name:"Couple's Spa Day",desc:"Complete spa experience for two in private suite",price:340,dur:"180",img:"https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80",active:true},
];
const STAFF0 = [
  {id:1,name:"Aria Chen",role:"Senior Aesthetician",email:"aria@lumaspa.com",i:"AC",c:"#E63946",services:[1,4],avail:[true,true,true,true,true,false,false],active:true},
  {id:2,name:"Marcus Roy",role:"Massage Therapist",email:"marcus@lumaspa.com",i:"MR",c:"#7c3aed",services:[2,5],avail:[true,true,true,true,true,false,false],active:true},
  {id:3,name:"Sofia Lane",role:"Hair Stylist",email:"sofia@lumaspa.com",i:"SL",c:"#0891b2",services:[3],avail:[false,true,true,true,true,true,false],active:true},
  {id:4,name:"James Park",role:"Nail Technician",email:"james@lumaspa.com",i:"JP",c:"#059669",services:[4],avail:[true,true,true,true,true,true,false],active:true},
];
const BKGS0 = [
  {id:"BK-2401",userId:"u1",svc:"Luxury Facial",stf:"Aria Chen",dt:"Mar 3, 2026",t:"11:00 AM",p:"$120",s:"upcoming",paid:true,u:"Alex Morgan"},
  {id:"BK-2400",userId:"u2",svc:"Hot Stone Massage",stf:"Marcus Roy",dt:"Mar 3, 2026",t:"2:00 PM",p:"$180",s:"active",paid:true,u:"Jamie Liu"},
  {id:"BK-2399",userId:"u3",svc:"Nail Art Studio",stf:"James Park",dt:"Mar 4, 2026",t:"10:00 AM",p:"$65",s:"upcoming",paid:true,u:"Sam Torres"},
  {id:"BK-2398",userId:"u4",svc:"Hair Styling",stf:"Sofia Lane",dt:"Mar 5, 2026",t:"1:00 PM",p:"$85",s:"upcoming",paid:false,u:"Casey Wu"},
  {id:"BK-2388",userId:"u1",svc:"Hot Stone Massage",stf:"Marcus Roy",dt:"Feb 22, 2026",t:"2:00 PM",p:"$180",s:"completed",paid:true,u:"Alex Morgan"},
  {id:"BK-2371",userId:"u1",svc:"Hair Styling",stf:"Sofia Lane",dt:"Feb 10, 2026",t:"10:00 AM",p:"$85",s:"completed",paid:true,u:"Alex Morgan"},
];
const MNS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DS=["Su","Mo","Tu","We","Th","Fr","Sa"];
const DAYS=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const TIMES=["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];
const BOOKED=["10:00","13:00","16:00"];
const STEPS=["Service","Staff","Date & Time","Details","Summary","Payment","Confirm"];
const COLORS=["#E63946","#7c3aed","#0891b2","#059669","#f59e0b","#ec4899"];

const cal=(y,m)=>{const f=new Date(y,m,1).getDay(),d=new Date(y,m+1,0).getDate();return[...Array(f).fill(null),...Array.from({length:d},(_,i)=>i+1)];};
const fmtDur=m=>{const n=parseInt(m);if(n<60)return`${n}m`;const h=Math.floor(n/60),r=n%60;return r?`${h}h ${r}m`:`${h}h`;};
const initials=n=>n.split(" ").filter(Boolean).map(w=>w[0]).join("").slice(0,2).toUpperCase();
const API_BASE=(import.meta.env.VITE_API_URL||"http://localhost:4000/api").replace(/\/+$/,"");
const SESSION_KEY="lumaspa_session";

async function apiRequest(path,{method="GET",body,token}={}){
  const res=await fetch(`${API_BASE}${path.startsWith("/")?path:`/${path}`}`,{
    method,
    headers:{
      "Content-Type":"application/json",
      ...(token?{Authorization:`Bearer ${token}`}:{})
    },
    ...(body!==undefined?{body:JSON.stringify(body)}:{})
  });
  const data=await res.json().catch(()=>null);
  if(!res.ok){
    throw new Error(data?.error||`Request failed (${res.status})`);
  }
  return data;
}

const readSession=()=>{
  try{
    const raw=localStorage.getItem(SESSION_KEY);
    if(!raw)return null;
    return JSON.parse(raw);
  }catch{return null;}
};

const saveSession=s=>{
  if(!s)return;
  localStorage.setItem(SESSION_KEY,JSON.stringify(s));
};

const clearSession=()=>localStorage.removeItem(SESSION_KEY);

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useToast(){
  const [ts,setTs]=useState([]);
  const toast=(msg,type="success")=>{const id=Date.now();setTs(t=>[...t,{id,msg,type}]);setTimeout(()=>setTs(t=>t.filter(x=>x.id!==id)),3000);};
  return{toasts:ts,toast};
}
function Toasts({toasts}){
  return <div className="toast-wrap">{toasts.map(t=><div key={t.id} className={`toast toast-${t.type}`}>{t.type==="success"?"✓":t.type==="error"?"✕":"ℹ"} {t.msg}</div>)}</div>;
}
function Confirm({msg,onOk,onCancel}){
  return <div className="mov" onClick={onCancel}><div className="modal" style={{maxWidth:340,textAlign:"center"}} onClick={e=>e.stopPropagation()}>
    <div style={{fontSize:38,marginBottom:12}}>⚠️</div>
    <div style={{fontWeight:800,fontSize:17,marginBottom:9,letterSpacing:"-.02em"}}>Are you sure?</div>
    <p style={{color:"var(--muted)",fontSize:13,marginBottom:20}}>{msg}</p>
    <div style={{display:"flex",gap:9,justifyContent:"center"}}>
      <button className="btn btn-g" onClick={onCancel}>Cancel</button>
      <button className="btn btn-danger" onClick={onOk}>Delete</button>
    </div>
  </div></div>;
}

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
// Used for User login/register — popup stays on current page
function AuthModal({onClose,onAuth,initTab="login"}){
  const [tab,setTab]=useState(initTab);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const [f,setF]=useState({name:"",email:"",pass:"",phone:""});
  const submit=async()=>{
    setErr("");
    if(!f.email.includes("@")){setErr("Enter a valid email address");return;}
    if(f.pass.length<6){setErr("Password must be at least 6 characters");return;}
    if(tab==="register"&&!f.name.trim()){setErr("Please enter your full name");return;}
    setLoading(true);
    try{
      const payload=tab==="login"
        ?await apiRequest("/auth/login-user",{method:"POST",body:{email:f.email,password:f.pass}})
        :await apiRequest("/auth/register-user",{method:"POST",body:{name:f.name,email:f.email,password:f.pass,phone:f.phone}});
      onAuth(payload);
    }catch(e){
      setErr(e.message||"Authentication failed");
    }finally{
      setLoading(false);
    }
  };
  return <div className="mov" onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal">
      <button onClick={onClose} style={{position:"absolute",top:12,right:12,background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:20,width:34,height:34,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      <div style={{marginBottom:18}}>
        <div style={{fontWeight:900,fontSize:21,letterSpacing:"-.03em",marginBottom:3}}>{tab==="login"?"Welcome back":"Create account"}</div>
        <div style={{fontSize:13,color:"var(--muted)"}}>{tab==="login"?"Sign in to your account":"Join LumaSpa today"}</div>
      </div>
      <div className="tabs">
        <div className={`tab ${tab==="login"?"act":""}`} onClick={()=>{setTab("login");setErr("");}}>Login</div>
        <div className={`tab ${tab==="register"?"act":""}`} onClick={()=>{setTab("register");setErr("");}}>Register</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:11}}>
        {tab==="register"&&<input className="inp" placeholder="Full Name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>}
        <input className="inp" type="email" placeholder="Email address" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/>
        <input className="inp" type="password" placeholder="Password" value={f.pass} onChange={e=>setF({...f,pass:e.target.value})} onKeyDown={e=>e.key==="Enter"&&submit()}/>
        {tab==="register"&&<input className="inp" type="tel" placeholder="Phone number (optional)" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/>}
      </div>
      {err&&<div style={{color:"var(--red)",fontSize:12,marginTop:9,padding:"9px 11px",background:"rgba(230,57,70,.08)",borderRadius:8,whiteSpace:"pre-line"}}>⚠ {err}</div>}
      {tab==="login"&&<div style={{fontSize:11,color:"var(--muted)",marginTop:8,padding:"7px 10px",background:"rgba(255,255,255,.04)",borderRadius:8}}>Demo: <strong style={{color:"var(--text)"}}>alex@example.com</strong> / <strong style={{color:"var(--text)"}}>password123</strong></div>}
      <button className="btn btn-p" style={{width:"100%",marginTop:15,padding:13}} onClick={submit} disabled={loading}>
        {loading?<span className="ld"><span>●</span><span>●</span><span>●</span></span>:(tab==="login"?"Sign In →":"Create Account →")}
      </button>
    </div>
  </div>;
}

// ─── PROGRESS ─────────────────────────────────────────────────────────────────
function Progress({step}){
  return <>
    <div className="prog">
      {STEPS.map((l,i)=><div className="prog-step" key={i}>
        <div className="prog-lw">
          <div className={`pdot ${i<step?"pd":i===step?"pa":"pf"}`}>{i<step?"✓":i+1}</div>
          {i<STEPS.length-1&&<div className={`pline ${i<step?"done":""}`}/>}
        </div>
        <div className={`plbl ${i===step?"act":i<step?"done":""}`}>{l}</div>
      </div>)}
    </div>
    <div className="prog-mini">
      <div><div style={{fontSize:13,fontWeight:700,marginBottom:1}}>{STEPS[step]}</div><div style={{fontSize:11,color:"var(--muted)"}}>Step {step+1} of {STEPS.length}</div></div>
      <div className="pm-dots">{STEPS.map((_,i)=><div key={i} className={`pm ${i<step?"done":i===step?"act":""}`}/>)}</div>
    </div>
  </>;
}

// ─── BOOKING STEPS ────────────────────────────────────────────────────────────
function S1({sel,onSel,services}){
  return <div className="se">
    <h2 className="sh">Choose a Service</h2><p className="ss">Select the treatment you'd like to book</p>
    <div className="sg">
      {services.filter(s=>s.active).map(s=>(
        <div key={s.id} className={`scard ${sel?.id===s.id?"sel":""}`} onClick={()=>onSel(s)}>
          <div className="simg">{s.img?<img src={s.img} alt={s.name} loading="lazy"/>:<div className="simg-fb">🧖</div>}</div>
          <div className="sbody">
            <div className="sname">{s.name}</div>
            <div className="sdesc">{s.desc}</div>
            <div className="smeta"><span className="sprice">${s.price}</span><span className="sdur">⏱ {fmtDur(s.dur)}</span></div>
          </div>
        </div>
      ))}
    </div>
  </div>;
}
function S2({sel,onSel,staff,svcId}){
  const list=staff.filter(s=>s.active&&(!svcId||s.services.includes(svcId)));
  return <div className="se">
    <h2 className="sh">Choose Your Specialist</h2><p className="ss">Available for your selected service</p>
    {list.length===0
      ?<div className="glass" style={{padding:28,textAlign:"center",color:"var(--muted)"}}>No specialists available for this service</div>
      :<div className="staffg">{list.map(s=><div key={s.id} className={`stcard ${sel?.id===s.id?"sel":""}`} onClick={()=>onSel(s)}>
          <div className="avt" style={{width:56,height:56,margin:"0 auto 9px",background:`linear-gradient(135deg,${s.c},rgba(0,0,0,.3))`,fontSize:18}}>{s.i}</div>
          <div style={{fontWeight:700,fontSize:13,marginBottom:2}}>{s.name}</div>
          <div style={{fontSize:11,color:"var(--muted)"}}>{s.role}</div>
          {sel?.id===s.id&&<div style={{marginTop:7}}><span className="badge ba">Selected</span></div>}
        </div>)}</div>
    }
  </div>;
}
function S3({selDate,selTime,onDate,onTime}){
  const now=new Date();
  const [mn,setMn]=useState(now.getMonth());
  const [yr,setYr]=useState(now.getFullYear());
  const days=cal(yr,mn);
  const selStr=selDate?`${selDate.getFullYear()}-${selDate.getMonth()}-${selDate.getDate()}`:"";
  return <div className="se">
    <h2 className="sh">Pick a Date & Time</h2><p className="ss">Strikethrough slots are already booked</p>
    <div className="dtg">
      <div className="glass" style={{padding:"clamp(12px,3vw,18px)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <button className="btn btn-g btn-sm btn-icon" onClick={()=>mn===0?(setMn(11),setYr(y=>y-1)):setMn(m=>m-1)}>‹</button>
          <span style={{fontWeight:700,fontSize:13}}>{MNS[mn]} {yr}</span>
          <button className="btn btn-g btn-sm btn-icon" onClick={()=>mn===11?(setMn(0),setYr(y=>y+1)):setMn(m=>m+1)}>›</button>
        </div>
        <div className="calg">
          {DS.map(d=><div key={d} className="cdn">{d}</div>)}
          {days.map((d,i)=>{
            if(!d)return<div key={i} className="cd cem"/>;
            const date=new Date(yr,mn,d);
            const past=date<new Date(now.getFullYear(),now.getMonth(),now.getDate());
            const today=d===now.getDate()&&mn===now.getMonth()&&yr===now.getFullYear();
            return<div key={i} className={`cd${past?" cpast":""}${today?" ctoday":""}${selStr===`${yr}-${mn}-${d}`?" csel":""}`} onClick={()=>!past&&onDate(date)}>{d}</div>;
          })}
        </div>
      </div>
      <div>
        <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",marginBottom:10,letterSpacing:".07em"}}>AVAILABLE TIMES</div>
        <div className="tg">
          {TIMES.map(t=><div key={t} className={`ts${BOOKED.includes(t)?" tbk":""}${selTime===t?" tsel":""}`} onClick={()=>!BOOKED.includes(t)&&onTime(t)}>{t}{BOOKED.includes(t)?" ✕":""}</div>)}
        </div>
        {selDate&&selTime&&<div className="glass" style={{padding:13,marginTop:11,borderColor:"var(--border-red)"}}>
          <div style={{fontSize:11,color:"var(--muted)",marginBottom:2}}>Selected</div>
          <div style={{fontWeight:700,fontSize:13}}>{selDate.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
          <div style={{color:"var(--red)",fontWeight:700,marginTop:2}}>{selTime}</div>
        </div>}
      </div>
    </div>
  </div>;
}
function S4({det,onChange,user}){
  const v=k=>det[k]??(k==="name"?user?.name:k==="email"?user?.email:k==="phone"?user?.phone:"")??""
  return <div className="se">
    <h2 className="sh">Your Details</h2><p className="ss">Pre-filled from your account</p>
    <div className="glass" style={{padding:"clamp(14px,4vw,24px)",maxWidth:500}}>
      <div style={{display:"flex",flexDirection:"column",gap:13}}>
        {[{l:"FULL NAME",k:"name",t:"text",ph:"Your full name"},{l:"EMAIL",k:"email",t:"email",ph:"your@email.com"},{l:"PHONE",k:"phone",t:"tel",ph:"+1 (555) 000-0000"}].map(fi=>(
          <div key={fi.k}><label className="lbl">{fi.l}</label><input className="inp" type={fi.t} placeholder={fi.ph} value={v(fi.k)} onChange={e=>onChange({...det,[fi.k]:e.target.value})}/></div>
        ))}
        <div><label className="lbl">NOTES (Optional)</label><textarea className="inp" placeholder="Any special requests…" value={det.notes||""} onChange={e=>onChange({...det,notes:e.target.value})}/></div>
      </div>
    </div>
  </div>;
}
function S5({svc,stf,date,time}){
  return <div className="se">
    <h2 className="sh">Booking Summary</h2><p className="ss">Review your appointment before payment</p>
    <div className="glass" style={{padding:"clamp(14px,4vw,24px)",maxWidth:520}}>
      <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",letterSpacing:".07em",marginBottom:11}}>DETAILS</div>
      {[["Service",svc?.name],["Specialist",stf?.name],["Date",date?.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})],["Time",time],["Duration",fmtDur(svc?.dur)]].map(([l,v])=>(
        <div key={l} className="srow"><span className="slbl">{l}</span><span className="sval">{v}</span></div>
      ))}
      <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:14,fontWeight:600}}>Total</span>
        <span style={{fontSize:"clamp(24px,5vw,30px)",fontWeight:900,color:"var(--red)",letterSpacing:"-.03em"}}>${svc?.price}</span>
      </div>
    </div>
  </div>;
}
function S6({svc,onSuccess}){
  const [loading,setLoading]=useState(false);
  const [card,setCard]=useState({num:"",exp:"",cvc:""});
  const [err,setErr]=useState("");
  const pay=async()=>{
    if(card.num.replace(/\s/g,"").length<16){setErr("Enter a valid 16-digit card number");return;}
    if(!card.exp.match(/^\d{2}\/\d{2}$/)){setErr("Format: MM/YY");return;}
    if(card.cvc.length<3){setErr("Enter a valid CVC");return;}
    setErr("");setLoading(true);
    try{
      await new Promise(r=>setTimeout(r,800));
      await onSuccess();
    }catch(e){
      setErr(e.message||"Payment failed");
    }finally{
      setLoading(false);
    }
  };
  return <div className="se">
    <h2 className="sh">Secure Payment</h2><p className="ss">Encrypted and secure checkout</p>
    <div className="glass" style={{padding:"clamp(14px,4vw,24px)",maxWidth:460}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <span style={{fontSize:14,fontWeight:600}}>Amount due</span>
        <span style={{fontSize:"clamp(22px,5vw,28px)",fontWeight:900,color:"var(--red)",letterSpacing:"-.03em"}}>${svc?.price}</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:11}}>
        <div><label className="lbl">CARD NUMBER</label><input className="sinp" placeholder="4242 4242 4242 4242" maxLength={19} value={card.num} onChange={e=>setCard({...card,num:e.target.value.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim()})}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
          <div><label className="lbl">EXPIRY</label><input className="sinp" placeholder="MM/YY" maxLength={5} value={card.exp} onChange={e=>{let v=e.target.value.replace(/\D/g,"");if(v.length>=3)v=v.slice(0,2)+"/"+v.slice(2,4);setCard({...card,exp:v});}}/></div>
          <div><label className="lbl">CVC</label><input className="sinp" placeholder="•••" maxLength={4} value={card.cvc} onChange={e=>setCard({...card,cvc:e.target.value.replace(/\D/g,"")})}/></div>
        </div>
      </div>
      {err&&<div style={{color:"var(--red)",fontSize:12,marginTop:9,padding:"9px 11px",background:"rgba(230,57,70,.08)",borderRadius:8}}>⚠ {err}</div>}
      <div style={{fontSize:11,color:"var(--muted)",marginTop:9,padding:"7px 10px",background:"rgba(255,255,255,.04)",borderRadius:8}}>Test card: <strong style={{color:"var(--text)"}}>4242 4242 4242 4242</strong> · 12/28 · 123</div>
      <button className="btn btn-p" style={{width:"100%",marginTop:16,padding:14,fontSize:14}} onClick={pay} disabled={loading}>
        {loading?<span className="ld"><span>●</span><span>●</span><span>●</span></span>:`🔒 Pay $${svc?.price} Securely`}
      </button>
    </div>
  </div>;
}
function S7({svc,stf,date,time,booking,onDash,onRebook}){
  const ref=booking?.id||"BK-"+(2410+Math.floor(Math.random()*90));
  return <div className="se" style={{textAlign:"center",maxWidth:500,margin:"0 auto"}}>
    <div className="check-c">✓</div>
    <h2 style={{fontSize:"clamp(22px,5vw,30px)",fontWeight:900,marginBottom:9,letterSpacing:"-.03em"}}>You're all booked!</h2>
    <p style={{color:"var(--muted)",fontSize:14,marginBottom:20,lineHeight:1.6}}>Appointment confirmed. A confirmation email has been sent.</p>
    <div className="glass" style={{padding:"clamp(13px,4vw,24px)",textAlign:"left",marginBottom:18}}>
      {[["Booking Ref",<span className="refcode">{ref}</span>],["Service",svc?.name],["Specialist",stf?.name],["When",`${date?.toLocaleDateString("en-US",{month:"long",day:"numeric"})} at ${time}`],["Status",<span className="badge bu">✓ Confirmed</span>]].map(([l,v])=>(
        <div key={l} className="srow"><span className="slbl">{l}</span><span className="sval">{v}</span></div>
      ))}
    </div>
    <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
      <button className="btn btn-p" onClick={onDash}>View My Dashboard</button>
      <button className="btn btn-g" onClick={onRebook}>Book Another</button>
    </div>
  </div>;
}

// ─── BOOKING FORM (inline — used on homepage) ─────────────────────────────────
// When user clicks a service and is NOT logged in, fires onNeedAuth(callback)
// App shows AuthModal; after login callback resumes booking
function BookingForm({user,onNeedAuth,services,staff,onCreateBooking,onGoDash}){
  const [step,setStep]=useState(0);
  const [svc,setSvc]=useState(null);
  const [stf,setStf]=useState(null);
  const [date,setDate]=useState(null);
  const [time,setTime]=useState(null);
  const [det,setDet]=useState({});
  const [createdBooking,setCreatedBooking]=useState(null);
  const canNext=()=>{if(step===0)return!!svc;if(step===1)return!!stf;if(step===2)return!!date&&!!time;return true;};
  const handleSvcSel=s=>{setSvc(s);if(!user){onNeedAuth(()=>setStep(1));}};
  const next=()=>{
    if(step===0){if(!svc)return;if(!user){onNeedAuth(()=>setStep(1));return;}setStep(1);return;}
    setStep(s=>Math.min(s+1,6));
  };
  const back=()=>setStep(s=>Math.max(s-1,0));
  const reset=()=>{setStep(0);setSvc(null);setStf(null);setDate(null);setTime(null);setDet({});setCreatedBooking(null);};
  const createBooking=async()=>{
    if(!svc||!stf||!date||!time)throw new Error("Missing booking details");
    const payload={serviceId:svc.id,staffId:stf.id,date:date.toISOString(),time,details:det};
    const booking=await onCreateBooking?.(payload);
    setCreatedBooking(booking||null);
    setStep(6);
  };
  return <div style={{display:"flex",flexDirection:"column"}}>
    <Progress step={step}/>
    <div>
      {step===0&&<S1 sel={svc} onSel={handleSvcSel} services={services}/>}
      {step===1&&<S2 sel={stf} onSel={setStf} staff={staff} svcId={svc?.id}/>}
      {step===2&&<S3 selDate={date} selTime={time} onDate={setDate} onTime={setTime}/>}
      {step===3&&<S4 det={det} onChange={setDet} user={user}/>}
      {step===4&&<S5 svc={svc} stf={stf} date={date} time={time}/>}
      {step===5&&<S6 svc={svc} onSuccess={createBooking}/>}
      {step===6&&<S7 svc={svc} stf={stf} date={date} time={time} booking={createdBooking} onDash={onGoDash} onRebook={reset}/>}
    </div>
    {step<6&&<div className="bfoot">
      <button className="btn btn-g btn-sm" onClick={back} disabled={step===0}>← Back</button>
      <span style={{fontSize:11,color:"var(--muted)"}}>Step {step+1}/{STEPS.length}</span>
      {step<5&&<button className="btn btn-p btn-sm" onClick={next} disabled={!canNext()}>{step===4?"Pay Now →":"Continue →"}</button>}
    </div>}
  </div>;
}

// ─── PUBLIC HEADER ─────────────────────────────────────────────────────────────
// 🟢 Not logged in  → Logo | Admin | Staff | Login/Register
// 🔵 User logged in → Logo | Dashboard  (Admin & Staff buttons hidden)
function PublicHeader({user,onLoginClick,onSignOut,onGoAdmin,onGoStaff,onGoDash,onGoProfile,embedMode=false}){
  const [open,setOpen]=useState(false);
  const close=()=>setOpen(false);

  const drawer=<>
    <div className="dov" onClick={close}/>
    <div className={`drw ${embedMode?"drw-left":""}`}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <BrandLogo size={24}/>
        <button className="btn btn-g btn-sm" onClick={close}>X</button>
      </div>
      {user&&<div style={{padding:"9px 12px 13px",borderBottom:"1px solid var(--border)",marginBottom:8}}>
        <div style={{fontWeight:700,fontSize:14}}>{user.name}</div>
        <div style={{fontSize:11,color:"var(--muted)"}}>{user.email}</div>
      </div>}
      {!user&&<>
        {!embedMode&&<div className="di" onClick={()=>{close();onGoAdmin();}}>Admin Portal</div>}
        {!embedMode&&<div className="di" onClick={()=>{close();onGoStaff();}}>Staff Portal</div>}
        <div className="di act" onClick={()=>{close();onLoginClick();}}><span className="mi">IN</span>Login / Register</div>
      </>}
      {user&&<>
        <div className="di" onClick={()=>{close();onGoDash();}}><span className="mi">DB</span>My Dashboard</div>
        <div className="di" onClick={()=>{close();(onGoProfile||onGoDash)();}}><span className="mi">PR</span>Edit Profile</div>
        <div className="di" style={{color:"var(--red)"}} onClick={()=>{close();onSignOut();}}><span className="mi">OUT</span>Sign Out</div>
      </>}
    </div>
  </>;

  if(embedMode){
    return <>
      <div className="emb-inline">
        <button className="emb-hmb" aria-label="Open dashboard menu" onClick={()=>setOpen(true)}>
          <span/><span/><span/>
        </button>
      </div>
      {open&&drawer}
    </>;
  }

  return <>
    <nav className="nav">
      <div className="nav-logo"><BrandLogo size={28}/></div>
      <div className="nav-right">
        {!user&&<>
          {!embedMode&&<button className="btn btn-o btn-sm nav-hide-sm" onClick={onGoAdmin}>Admin</button>}
          {!embedMode&&<button className="btn btn-o btn-sm nav-hide-sm" onClick={onGoStaff}>Staff</button>}
          <button className="btn btn-p btn-sm" onClick={onLoginClick}>Login / Register</button>
        </>}
        {user&&<>
          <button className="btn btn-g btn-sm nav-hide-sm" onClick={onGoDash}>
            <span style={{width:22,height:22,borderRadius:"50%",background:"linear-gradient(135deg,#E63946,#7c3aed)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800}}>{user.name?.[0]}</span>
            Dashboard
          </button>
          <button className="btn btn-o btn-sm nav-hide-sm" onClick={onSignOut}>Sign Out</button>
        </>}
        <button className="btn btn-g btn-icon hmb-bars" id="hmb" onClick={()=>setOpen(true)} aria-label="Open menu">
          <span/><span/><span/>
        </button>
      </div>
    </nav>
    {open&&drawer}
  </>;
}
function AdminHeader({admin,onSignOut}){
  return <nav className="dnav dnav-admin">
    <div style={{marginRight:"auto"}}><BrandLogo size={26}/></div>
    <span className="badge bx" style={{fontSize:11}}>🛡 Admin Panel</span>
    <div style={{width:1,height:20,background:"var(--border)",margin:"0 8px"}}/>
    <span style={{fontSize:13,fontWeight:600,color:"var(--muted)"}}>{admin?.name}</span>
    <button className="btn btn-danger btn-sm" onClick={onSignOut}>Sign Out</button>
  </nav>;
}

// ─── STAFF HEADER ─────────────────────────────────────────────────────────────
function StaffHeader({staffUser,onSignOut}){
  return <nav className="dnav dnav-staff">
    <div style={{marginRight:"auto"}}><BrandLogo size={26}/></div>
    <span className="badge bu" style={{fontSize:11}}>💼 Staff Portal</span>
    <div style={{width:1,height:20,background:"var(--border)",margin:"0 8px"}}/>
    <span style={{fontSize:13,fontWeight:600,color:"var(--muted)"}}>{staffUser?.name}</span>
    <button className="btn btn-o btn-sm" onClick={onSignOut}>Sign Out</button>
  </nav>;
}

// ─── HOMEPAGE ─────────────────────────────────────────────────────────────────
// Hero on left, inline booking form on right
// Booking form triggers AuthModal (popup) if user clicks service and not logged in
function HomePage({user,onUserAuth,onGoDash,services,staff,onCreateBooking,embedMode=false,embedHeader=null}){
  const [showAuth,setShowAuth]=useState(false);
  const [authCb,setAuthCb]=useState(null);
  const handleNeedAuth=cb=>{setAuthCb(()=>cb);setShowAuth(true);};
  const handleAuth=u=>{
    setShowAuth(false);
    onUserAuth(u);
    if(authCb){authCb(u);setAuthCb(null);}
  };
  const loggedUser=user;
  return <>
    <div className="home" style={embedMode?{paddingTop:14,minHeight:"auto"}:undefined}>
      <div className="home-form">
        {embedMode&&embedHeader}
        <div style={{fontSize:16,fontWeight:800,letterSpacing:"-.02em",marginBottom:3}}>Book an Appointment</div>
        <div style={{fontSize:12,color:"var(--muted)",marginBottom:18}}>
          <span>Select your service, staff, and time to continue</span>
        </div>
        <BookingForm user={loggedUser} onNeedAuth={handleNeedAuth} services={services} staff={staff} onCreateBooking={onCreateBooking} onGoDash={onGoDash}/>
      </div>
    </div>
    {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} onAuth={handleAuth}/>}
  </>;
}
function AdminLoginPage({onLogin,onBack}){
  const [f,setF]=useState({email:"",pass:""});
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const submit=async()=>{
    setErr("");
    if(!f.email||!f.pass){setErr("Enter email and password");return;}
    setLoading(true);
    try{
      const payload=await apiRequest("/auth/login-admin",{method:"POST",body:{email:f.email,password:f.pass}});
      onLogin(payload);
    }catch(e){
      setErr(e.message||"Invalid credentials");
    }finally{
      setLoading(false);
    }
  };
  return <div className="auth-page">
    <div className="auth-card">
      <div className="auth-brand">
        <div className="auth-logo"><BrandLogo size={34}/></div>
        <div className="auth-badge">🛡 Admin Portal</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:11}}>
        <div><label className="lbl">ADMIN EMAIL</label><input className="inp" type="email" placeholder="admin@lumaspa.com" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></div>
        <div><label className="lbl">PASSWORD</label><input className="inp" type="password" placeholder="••••••••" value={f.pass} onChange={e=>setF({...f,pass:e.target.value})} onKeyDown={e=>e.key==="Enter"&&submit()}/></div>
      </div>
      {err&&<div style={{color:"var(--red)",fontSize:12,marginTop:9,padding:"9px 11px",background:"rgba(230,57,70,.08)",borderRadius:8,whiteSpace:"pre-line"}}>⚠ {err}</div>}
      <div style={{fontSize:11,color:"var(--muted)",marginTop:8,padding:"7px 10px",background:"rgba(255,255,255,.04)",borderRadius:8}}>Demo: <strong style={{color:"var(--text)"}}>admin@lumaspa.com</strong> / <strong style={{color:"var(--text)"}}>admin123</strong></div>
      <button className="btn btn-p" style={{width:"100%",marginTop:14,padding:13}} onClick={submit} disabled={loading}>
        {loading?<span className="ld"><span>●</span><span>●</span><span>●</span></span>:"Access Admin Dashboard →"}
      </button>
      <button className="btn btn-g" style={{width:"100%",marginTop:8}} onClick={onBack}>← Back to Homepage</button>
    </div>
  </div>;
}

// ─── STAFF AUTH PAGE ──────────────────────────────────────────────────────────
function StaffAuthPage({onLogin,onBack}){
  const [tab,setTab]=useState("login");
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const [f,setF]=useState({name:"",email:"",pass:"",designation:"",phone:""});
  const submit=async()=>{
    setErr("");
    if(!f.email.includes("@")){setErr("Enter a valid email");return;}
    if(f.pass.length<6){setErr("Password min 6 characters");return;}
    if(tab==="register"&&!f.name.trim()){setErr("Enter your full name");return;}
    if(tab==="register"&&!f.designation.trim()){setErr("Enter your designation");return;}
    setLoading(true);
    try{
      const payload=tab==="login"
        ?await apiRequest("/auth/login-staff",{method:"POST",body:{email:f.email,password:f.pass}})
        :await apiRequest("/auth/register-staff",{method:"POST",body:{name:f.name,email:f.email,password:f.pass,designation:f.designation,phone:f.phone}});
      onLogin(payload);
    }catch(e){
      setErr(e.message||"Authentication failed");
    }finally{
      setLoading(false);
    }
  };
  return <div className="auth-page">
    <div className="auth-card" style={{maxWidth:440}}>
      <div className="auth-brand">
        <div className="auth-logo"><BrandLogo size={34}/></div>
        <div className="auth-badge">💼 Staff Portal</div>
      </div>
      <div className="tabs">
        <div className={`tab ${tab==="login"?"act":""}`} onClick={()=>{setTab("login");setErr("");}}>Staff Login</div>
        <div className={`tab ${tab==="register"?"act":""}`} onClick={()=>{setTab("register");setErr("");}}>Register</div>
      </div>
      {tab==="register"&&<div style={{padding:"10px 12px",background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.25)",borderRadius:10,fontSize:12,color:"var(--warn)",marginBottom:13,lineHeight:1.6}}>
        ⚠️ Staff accounts require <strong>Admin approval</strong> before accessing the portal. You'll see a pending screen after registering.
      </div>}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {tab==="register"&&<input className="inp" placeholder="Full Name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>}
        {tab==="register"&&<input className="inp" placeholder="Designation (e.g. Massage Therapist)" value={f.designation} onChange={e=>setF({...f,designation:e.target.value})}/>}
        <input className="inp" type="email" placeholder="Email" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/>
        <input className="inp" type="password" placeholder="Password" value={f.pass} onChange={e=>setF({...f,pass:e.target.value})} onKeyDown={e=>e.key==="Enter"&&submit()}/>
        {tab==="register"&&<input className="inp" type="tel" placeholder="Phone (optional)" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/>}
      </div>
      {err&&<div style={{color:"var(--red)",fontSize:12,marginTop:9,padding:"9px 11px",background:"rgba(230,57,70,.08)",borderRadius:8,whiteSpace:"pre-line"}}>⚠ {err}</div>}
      {tab==="login"&&<div style={{fontSize:11,color:"var(--muted)",marginTop:8,padding:"7px 10px",background:"rgba(255,255,255,.04)",borderRadius:8}}>Demo: <strong style={{color:"var(--text)"}}>marcus@lumaspa.com</strong> / <strong style={{color:"var(--text)"}}>staff123</strong></div>}
      <button className="btn btn-p" style={{width:"100%",marginTop:14,padding:13}} onClick={submit} disabled={loading}>
        {loading?<span className="ld"><span>●</span><span>●</span><span>●</span></span>:(tab==="login"?"Sign In to Staff Portal →":"Register & Submit for Approval →")}
      </button>
      <button className="btn btn-g" style={{width:"100%",marginTop:8}} onClick={onBack}>← Back to Homepage</button>
    </div>
  </div>;
}

// ─── USER DASHBOARD ───────────────────────────────────────────────────────────
function UserDash({user,onSignOut,bookings,services,staff,onGoHome,token,onUserUpdated,initialTab="bookings",embedded=false,embedHeader=null}){
  const [tab,setTab]=useState(initialTab);
  const [prof,setProf]=useState({name:user?.name||"",email:user?.email||"",phone:user?.phone||""});
  const [saved,setSaved]=useState({...prof});
  const [settings,setSettings]=useState({email:true,sms:false,marketing:false});
  const {toasts,toast}=useToast();
  useEffect(()=>{setTab(initialTab||"bookings");},[initialTab]);
  const myBookings=bookings.filter(b=>b.userId===user?.id);
  const bmap={upcoming:"bu",completed:"bc",cancelled:"bx",active:"ba"};
  const nav=[{id:"bookings",icon:"BK",l:"My Bookings"},{id:"profile",icon:"PR",l:"Profile"},{id:"settings",icon:"ST",l:"Settings"}];

  return <div className="dash" style={embedded?{minHeight:"100vh"}:undefined}>
    <div className="sidebar" style={embedded?{top:0,height:"100vh"}:undefined}>
      <div style={{padding:"9px 10px 14px",borderBottom:"1px solid var(--border)",marginBottom:8}}>
        <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#E63946,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,marginBottom:7}}>{saved.name[0]||"?"}</div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>{saved.name}</div>
        <div style={{fontSize:11,color:"var(--muted)"}}>{saved.email}</div>
      </div>
      {nav.map(n=><div key={n.id} className={`sitem ${tab===n.id?"act":""}`} onClick={()=>setTab(n.id)}><span>{n.icon}</span>{n.l}</div>)}
      <div style={{marginTop:16,paddingTop:14,borderTop:"1px solid var(--border)"}}>
        <div className="sitem" style={{color:"var(--red)"}} onClick={onSignOut}><span>OUT</span>Sign Out</div>
      </div>
    </div>

    <div className="ca">
      {embedded&&embedHeader}
      {tab==="bookings"&&<>
        <h1 className="sh">My Bookings</h1>
        <p className="ss">Your upcoming and past appointments</p>
        <button className="btn btn-p btn-sm" style={{marginBottom:16}} onClick={onGoHome}>{embedded?"Back to Booking Form":"Book New Appointment"}</button>
        {myBookings.length===0
          ?<div className="glass" style={{padding:40,textAlign:"center"}}><div style={{fontWeight:700,marginBottom:8}}>No bookings yet</div><p style={{color:"var(--muted)",fontSize:13}}>Book your first appointment to see it here</p></div>
          :<div className="glass tw"><table>
            <thead><tr><th>ID</th><th>Service</th><th>Specialist</th><th>Date & Time</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>{myBookings.map(b=><tr key={b.id}>
              <td style={{fontFamily:"monospace",color:"var(--muted)",fontSize:11}}>{b.id}</td>
              <td style={{fontWeight:600}}>{b.svc}</td>
              <td style={{color:"var(--muted)"}}>{b.stf}</td>
              <td style={{color:"var(--muted)",whiteSpace:"nowrap"}}>{b.dt} - {b.t}</td>
              <td style={{fontWeight:700}}>{b.p}</td>
              <td><span className={`badge ${bmap[b.s]}`}>{b.s[0].toUpperCase()+b.s.slice(1)}</span></td>
            </tr>)}</tbody>
          </table></div>
        }
      </>}

      {tab==="profile"&&<>
        <h1 className="sh">Profile</h1><p className="ss">Update your personal information</p>
        <div className="glass" style={{padding:"clamp(14px,4vw,24px)",maxWidth:480}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,paddingBottom:16,borderBottom:"1px solid var(--border)",flexWrap:"wrap"}}>
            <div style={{width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#E63946,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:20,flexShrink:0}}>{saved.name[0]||"?"}</div>
            <div><div style={{fontWeight:700,fontSize:15}}>{saved.name}</div><div style={{fontSize:12,color:"var(--muted)"}}>Customer account</div></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[{l:"FULL NAME",k:"name",t:"text"},{l:"EMAIL",k:"email",t:"email"},{l:"PHONE",k:"phone",t:"tel"}].map(fi=>(
              <div key={fi.k}><label className="lbl">{fi.l}</label><input className="inp" type={fi.t} value={prof[fi.k]||""} onChange={e=>setProf({...prof,[fi.k]:e.target.value})}/></div>
            ))}
            <button className="btn btn-p" style={{marginTop:5}} onClick={async()=>{
              if(!prof.name.trim()){toast("Name cannot be empty","error");return;}
              try{
                const res=await apiRequest("/users/me",{method:"PUT",token,body:prof});
                setSaved({...res.user});
                setProf({...res.user});
                onUserUpdated?.(res.user);
                toast("Profile saved!","success");
              }catch(e){toast(e.message||"Profile update failed","error");}
            }}>Save Changes</button>
          </div>
        </div>
      </>}

      {tab==="settings"&&<>
        <h1 className="sh">Settings</h1><p className="ss">Notification preferences</p>
        <div className="glass" style={{padding:"clamp(13px,3vw,20px)",maxWidth:480}}>
          {[{k:"email",l:"Email Notifications",d:"Confirmations and reminders"},{k:"sms",l:"SMS Reminders",d:"Text before appointments"},{k:"marketing",l:"Marketing Emails",d:"Offers and promotions"}].map((item,i)=>(
            <div key={item.k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,padding:"14px 0",borderBottom:i<2?"1px solid var(--border)":"none"}}>
              <div><div style={{fontWeight:600,fontSize:13,marginBottom:2}}>{item.l}</div><div style={{fontSize:11,color:"var(--muted)"}}>{item.d}</div></div>
              <div className={`tog ${settings[item.k]?"on":""}`} onClick={()=>{setSettings(s=>({...s,[item.k]:!s[item.k]}));toast(`${item.l} ${!settings[item.k]?"enabled":"disabled"}`,"info");}}/>
            </div>
          ))}
          <button className="btn btn-p" style={{marginTop:16}} onClick={()=>toast("Settings saved!","success")}>Save Preferences</button>
        </div>
      </>}
    </div>

    <div className="bnav">
      {nav.map(n=><div key={n.id} className={`bni ${tab===n.id?"act":""}`} onClick={()=>setTab(n.id)}><span style={{fontSize:12}}>{n.icon}</span><span>{n.l}</span></div>)}
    </div>
    <Toasts toasts={toasts}/>
  </div>;
}

function ServiceModal({svc,onSave,onClose,services:_}){
  const [f,setF]=useState(svc||{name:"",desc:"",price:"",dur:"60",img:"",active:true});
  const [imgErr,setImgErr]=useState(false);
  return <div className="mov" onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal modal-lg">
      <button onClick={onClose} style={{position:"absolute",top:11,right:11,background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:19,width:32,height:32,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center"}}>X</button>
      <div style={{fontWeight:800,fontSize:19,marginBottom:18,letterSpacing:"-.02em"}}>{svc?"Edit Service":"Add New Service"}</div>
      <div style={{display:"flex",flexDirection:"column",gap:13}}>
        <div><label className="lbl">SERVICE NAME</label><input className="inp" placeholder="e.g. Hot Stone Massage" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></div>
        <div><label className="lbl">DESCRIPTION</label><textarea className="inp" placeholder="Brief description..." value={f.desc} onChange={e=>setF({...f,desc:e.target.value})}/></div>
        <div>
          <label className="lbl">SERVICE IMAGE URL</label>
          <input className="inp" placeholder="https://images.unsplash.com/..." value={f.img} onChange={e=>{setF({...f,img:e.target.value});setImgErr(false);}}/>
          {f.img&&<div style={{marginTop:9,borderRadius:11,overflow:"hidden",height:120,background:"#0d0d1a",border:"1px solid var(--border)"}}>
            {!imgErr?<img src={f.img} alt="preview" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={()=>setImgErr(true)}/>
            :<div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--red)",fontSize:13}}>Invalid image URL</div>}
          </div>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
          <div><label className="lbl">PRICE ($)</label><input className="inp" type="number" placeholder="120" value={f.price} onChange={e=>setF({...f,price:e.target.value})}/></div>
          <div><label className="lbl">DURATION</label>
            <select className="inp" value={f.dur} onChange={e=>setF({...f,dur:e.target.value})}>
              {[ ["30","30 min"],["45","45 min"],["60","1 hour"],["90","1h 30m"],["120","2 hours"],["150","2h 30m"],["180","3 hours"] ].map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:11}}>
          <div className={`tog ${f.active?"on":""}`} onClick={()=>setF({...f,active:!f.active})}/>
          <span style={{fontSize:13,fontWeight:600}}>Service is {f.active?"Active":"Inactive"}</span>
        </div>
      </div>
      <div style={{display:"flex",gap:9,marginTop:20}}>
        <button className="btn btn-g" style={{flex:1}} onClick={onClose}>Cancel</button>
        <button className="btn btn-p" style={{flex:1}} onClick={()=>{if(!f.name||!f.price)return;onSave(f);}}>{svc?"Save Changes":"Add Service"}</button>
      </div>
    </div>
  </div>;
}

function StaffModal({member,services,onSave,onClose}){
  const [f,setF]=useState(member||{name:"",role:"",email:"",i:"",c:COLORS[0],services:[],avail:[true,true,true,true,true,false,false]});
  const tSvc=id=>setF(p=>({...p,services:p.services.includes(id)?p.services.filter(s=>s!==id):[...p.services,id]}));
  const tDay=i=>setF(p=>{const a=[...p.avail];a[i]=!a[i];return{...p,avail:a};});
  return <div className="mov" onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal modal-lg" style={{maxHeight:"90vh",overflowY:"auto"}}>
      <button onClick={onClose} style={{position:"absolute",top:11,right:11,background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:19,width:32,height:32,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center"}}>X</button>
      <div style={{fontWeight:800,fontSize:19,marginBottom:18,letterSpacing:"-.02em"}}>{member?"Edit Staff Member":"Add Staff Member"}</div>
      <div style={{display:"flex",flexDirection:"column",gap:13}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
          <div><label className="lbl">FULL NAME</label><input className="inp" placeholder="e.g. Aria Chen" value={f.name} onChange={e=>setF({...f,name:e.target.value,i:initials(e.target.value)})}/></div>
          <div><label className="lbl">DESIGNATION</label><input className="inp" placeholder="e.g. Senior Aesthetician" value={f.role} onChange={e=>setF({...f,role:e.target.value})}/></div>
        </div>
        <div><label className="lbl">EMAIL</label><input className="inp" type="email" placeholder="staff@lumaspa.com" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></div>
        <div><label className="lbl">AVATAR COLOR</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{COLORS.map(c=><div key={c} onClick={()=>setF({...f,c})} style={{width:30,height:30,borderRadius:"50%",background:c,cursor:"pointer",border:f.c===c?"3px solid white":"3px solid transparent",transition:"all .15s"}}/>)}</div></div>
        <div><label className="lbl">ASSIGNED SERVICES</label>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{services.map(s=><div key={s.id} onClick={()=>tSvc(s.id)} style={{padding:"5px 11px",borderRadius:18,fontSize:12,fontWeight:600,cursor:"pointer",background:f.services.includes(s.id)?"var(--red-dim)":"var(--glass)",border:`1px solid ${f.services.includes(s.id)?"var(--border-red)":"var(--border)"}`,color:f.services.includes(s.id)?"var(--red)":"var(--muted)",transition:"all .15s"}}>{s.name}</div>)}</div></div>
        <div><label className="lbl">AVAILABILITY</label>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{DAYS.map((d,i)=><div key={d} onClick={()=>tDay(i)} style={{padding:"5px 11px",borderRadius:18,fontSize:12,fontWeight:600,cursor:"pointer",background:f.avail[i]?"var(--red-dim)":"var(--glass)",border:`1px solid ${f.avail[i]?"var(--border-red)":"var(--border)"}`,color:f.avail[i]?"var(--red)":"var(--muted2)",transition:"all .15s"}}>{d.slice(0,3)}</div>)}</div></div>
      </div>
      <div style={{display:"flex",gap:9,marginTop:20}}>
        <button className="btn btn-g" style={{flex:1}} onClick={onClose}>Cancel</button>
        <button className="btn btn-p" style={{flex:1}} onClick={()=>{if(!f.name||!f.role)return;onSave(f);}}>{member?"Save Changes":"Add Staff Member"}</button>
      </div>
    </div>
  </div>;
}

function BookingDetailModal({booking,onClose,onStatusChange}){
  const bmap={upcoming:"bu",completed:"bc",cancelled:"bx",active:"ba"};
  return <div className="mov" onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal">
      <button onClick={onClose} style={{position:"absolute",top:11,right:11,background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:19,width:32,height:32,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center"}}>X</button>
      <div style={{fontWeight:800,fontSize:19,marginBottom:5,letterSpacing:"-.02em"}}>Booking Details</div>
      <div style={{marginBottom:18}}><span className={`badge ${bmap[booking.s]}`}>{booking.s[0].toUpperCase()+booking.s.slice(1)}</span>{booking.paid&&<span style={{marginLeft:8,color:"var(--success)",fontSize:12,fontWeight:600}}>Paid</span>}</div>
      {[ ["Booking ID",booking.id],["Customer",booking.u],["Service",booking.svc],["Specialist",booking.stf],["Date",booking.dt],["Time",booking.t],["Amount",booking.p] ].map(([l,v])=> (
        <div key={l} className="drow"><span style={{color:"var(--muted)"}}>{l}</span><span style={{fontWeight:600}}>{v}</span></div>
      ))}
      <div style={{marginTop:18}}><label className="lbl">UPDATE STATUS</label>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["upcoming","active","completed","cancelled"].map(s=><button key={s} className={`btn btn-sm ${booking.s===s?"btn-p":"btn-g"}`} onClick={()=>onStatusChange(booking.id,s)}>{s[0].toUpperCase()+s.slice(1)}</button>)}
        </div></div>
      <button className="btn btn-g" style={{width:"100%",marginTop:14}} onClick={onClose}>Close</button>
    </div>
  </div>;
}

function AdminDash({services,setServices,staff,setStaff,bookings,setBookings,pendingStaff,setPendingStaff,onSignOut,token,embedUrl}){
  const [sec,setSec]=useState("overview");
  const [svcModal,setSvcModal]=useState(null);
  const [staffModal,setStaffModal]=useState(null);
  const [delConfirm,setDelConfirm]=useState(null);
  const [bDetail,setBDetail]=useState(null);
  const [bFilter,setBFilter]=useState("all");
  const [copied,setCopied]=useState(false);
  const {toasts,toast}=useToast();
  const bmap={upcoming:"bu",completed:"bc",cancelled:"bx",active:"ba"};
  const filtered=bookings.filter(b=>bFilter==="all"||b.s===bFilter);
  const todayKey=new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"});
  const todayBookings=bookings.filter(b=>b.dt.includes(todayKey));
  const iframeCode=`<iframe src="${embedUrl}" width="100%" height="900" style="border:0;max-width:100%;" loading="lazy" title="LumaSpa Booking"></iframe>`;

  const reloadAdminData=async()=>{
    const data=await apiRequest("/admin/data",{token});
    setServices(data.services||[]);
    setStaff(data.staff||[]);
    setBookings(data.bookings||[]);
    setPendingStaff(data.pendingStaff||[]);
  };

  const saveSvc=async f=>{
    try{
      if(svcModal==="add"){
        await apiRequest("/admin/services",{method:"POST",token,body:{...f,price:parseFloat(f.price)}});
        toast("Service added!","success");
      }else{
        await apiRequest(`/admin/services/${svcModal.id}`,{method:"PUT",token,body:{...f,price:parseFloat(f.price)}});
        toast("Service updated!","success");
      }
      await reloadAdminData();
      setSvcModal(null);
    }catch(e){toast(e.message||"Action failed","error");}
  };

  const saveStaff=async f=>{
    try{
      if(staffModal==="add"){
        await apiRequest("/admin/staff",{method:"POST",token,body:{...f,active:true}});
        toast("Staff added!","success");
      }else{
        await apiRequest(`/admin/staff/${staffModal.id}`,{method:"PUT",token,body:{...f,active:staffModal.active??true}});
        toast("Staff updated!","success");
      }
      await reloadAdminData();
      setStaffModal(null);
    }catch(e){toast(e.message||"Action failed","error");}
  };

  const doDelete=async()=>{
    try{
      if(delConfirm.type==="service"){
        await apiRequest(`/admin/services/${delConfirm.id}`,{method:"DELETE",token});
        toast("Service deleted","info");
      }else{
        await apiRequest(`/admin/staff/${delConfirm.id}`,{method:"DELETE",token});
        toast("Staff removed","info");
      }
      await reloadAdminData();
      setDelConfirm(null);
    }catch(e){toast(e.message||"Delete failed","error");}
  };

  const updateStatus=async(id,status)=>{
    try{
      await apiRequest(`/admin/bookings/${id}/status`,{method:"PATCH",token,body:{status}});
      setBookings(p=>p.map(b=>b.id===id?{...b,s:status}:b));
      setBDetail(p=>p?{...p,s:status}:null);
      toast(`Status -> ${status}`,"success");
    }catch(e){toast(e.message||"Status update failed","error");}
  };

  const approveStaff=async p=>{
    try{
      await apiRequest(`/admin/pending/${p.id}/approve`,{method:"POST",token});
      await reloadAdminData();
      toast(`${p.name} approved and activated!`,"success");
    }catch(e){toast(e.message||"Approval failed","error");}
  };

  const rejectStaff=async id=>{
    try{
      await apiRequest(`/admin/pending/${id}/reject`,{method:"POST",token});
      await reloadAdminData();
      toast("Application rejected","info");
    }catch(e){toast(e.message||"Rejection failed","error");}
  };

  const copyEmbedCode=async()=>{
    try{
      await navigator.clipboard.writeText(iframeCode);
      setCopied(true);
      setTimeout(()=>setCopied(false),1800);
      toast("Embed code copied!","success");
    }catch{
      toast("Copy failed. Select and copy manually.","error");
    }
  };

  const nav=[
    {id:"overview",icon:"OV",l:"Overview"},
    {id:"bookings",icon:"BK",l:"Bookings"},
    {id:"services",icon:"SV",l:"Services"},
    {id:"staff",icon:"ST",l:"Staff"},
    {id:"approvals",icon:"AP",l:"Approvals",badge:pendingStaff.length},
    {id:"embed",icon:"EM",l:"Embed"},
  ];

  const stats=[
    {l:"Today's Bookings",v:todayBookings.length,c:"Live overview",col:"var(--red)"},
    {l:"Total Services",v:services.length,c:"Active + inactive",col:"#7c3aed"},
    {l:"Revenue Today",v:"$"+todayBookings.filter(b=>b.paid).reduce((a,b)=>a+parseInt(String(b.p||"$0").replace("$","")),0),c:"From paid bookings",col:"var(--success)"},
    {l:"Pending Approvals",v:pendingStaff.length,c:pendingStaff.length>0?"Requires action":"All clear",col:"var(--warn)"},
  ];

  return <div className="dash">
    <div className="sidebar">
      <div style={{padding:"9px 10px 13px",borderBottom:"1px solid var(--border)",marginBottom:7}}>
        <span style={{fontSize:12,fontWeight:700,color:"var(--muted)"}}>ADMIN PANEL</span>
      </div>
      <div className="ssec">MANAGEMENT</div>
      {nav.map(n=><div key={n.id} className={`sitem ${sec===n.id?"act":""}`} onClick={()=>setSec(n.id)}>
        <span>{n.icon}</span>{n.l}
        {n.badge>0&&<span style={{marginLeft:"auto",background:"var(--warn)",color:"#000",borderRadius:20,padding:"1px 6px",fontSize:10,fontWeight:700}}>{n.badge}</span>}
      </div>)}
    </div>

    <div className="ca">
      {sec==="overview"&&<>
        <h1 className="sh">Dashboard</h1><p className="ss">Admin overview</p>
        <div className="g4" style={{marginBottom:20}}>
          {stats.map((s,i)=><div key={i} className="stat"><div className="stat-v" style={{color:s.col}}>{s.v}</div><div className="stat-l">{s.l}</div><div className="stat-c">{s.c}</div></div>)}
        </div>
        <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",letterSpacing:".07em",marginBottom:10}}>TODAY'S BOOKINGS</div>
        <div className="glass tw">
          <table><thead><tr><th>ID</th><th>Customer</th><th>Service</th><th>Staff</th><th>Time</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>{todayBookings.map(b=><tr key={b.id} style={{cursor:"pointer"}} onClick={()=>setBDetail(b)}>
            <td style={{fontFamily:"monospace",color:"var(--muted)",fontSize:11}}>{b.id}</td>
            <td style={{fontWeight:600}}>{b.u}</td><td>{b.svc}</td>
            <td style={{color:"var(--muted)"}}>{b.stf}</td><td>{b.t}</td><td style={{fontWeight:700}}>{b.p}</td>
            <td><span className={`badge ${bmap[b.s]}`}>{b.s[0].toUpperCase()+b.s.slice(1)}</span></td>
          </tr>)}</tbody></table>
        </div>
      </>}

      {sec==="bookings"&&<>
        <h1 className="sh">All Bookings</h1><p className="ss">Click a row to view details and update status</p>
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
          {["all","upcoming","active","completed","cancelled"].map(f=><div key={f} className={`filter-pill ${bFilter===f?"on":""}`} onClick={()=>setBFilter(f)}>
            {f[0].toUpperCase()+f.slice(1)}{f!=="all"&&<span style={{opacity:.6}}> ({bookings.filter(b=>b.s===f).length})</span>}
          </div>)}
        </div>
        <div className="glass tw"><table><thead><tr><th>ID</th><th>Customer</th><th>Service</th><th>Staff</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>{filtered.length===0?<tr><td colSpan={7} style={{textAlign:"center",color:"var(--muted)",padding:28}}>No bookings</td></tr>
          :filtered.map(b=><tr key={b.id} style={{cursor:"pointer"}} onClick={()=>setBDetail(b)}>
            <td style={{fontFamily:"monospace",color:"var(--muted)",fontSize:11}}>{b.id}</td>
            <td style={{fontWeight:600}}>{b.u}</td><td>{b.svc}</td>
            <td style={{color:"var(--muted)"}}>{b.stf}</td>
            <td style={{color:"var(--muted)",whiteSpace:"nowrap"}}>{b.dt}</td>
            <td style={{fontWeight:700}}>{b.p}</td>
            <td><span className={`badge ${bmap[b.s]}`}>{b.s[0].toUpperCase()+b.s.slice(1)}</span></td>
          </tr>)}
        </tbody></table></div>
      </>}

      {sec==="services"&&<>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
          <div><h1 className="sh">Services</h1><p className="ss" style={{marginBottom:0}}>Manage your offerings</p></div>
          <button className="btn btn-p btn-sm" onClick={()=>setSvcModal("add")}>+ Add Service</button>
        </div>
        <div className="glass tw"><table><thead><tr><th>Service</th><th>Duration</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{services.map(s=><tr key={s.id}>
          <td><div style={{display:"flex",alignItems:"center",gap:11}}>
            <div style={{width:50,height:40,borderRadius:7,overflow:"hidden",flexShrink:0,background:"#0d0d1a"}}>
              {s.img?<img src={s.img} alt={s.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,background:"linear-gradient(135deg,rgba(230,57,70,.14),rgba(100,60,180,.14))"}}>IMG</div>}
            </div>
            <div><div style={{fontWeight:600}}>{s.name}</div><div style={{fontSize:11,color:"var(--muted)"}}>{String(s.desc||"").substring(0,36)}...</div></div>
          </div></td>
          <td style={{whiteSpace:"nowrap"}}>{fmtDur(s.dur)}</td>
          <td style={{fontWeight:700,color:"var(--red)"}}>${s.price}</td>
          <td><span className={s.active?"badge bu":"badge bc"}>{s.active?"Active":"Inactive"}</span></td>
          <td style={{whiteSpace:"nowrap"}}>
            <span className="ata" style={{marginRight:11}} onClick={()=>setSvcModal(s)}>Edit</span>
            <span className="ata" style={{color:"var(--muted)"}} onClick={()=>setDelConfirm({type:"service",id:s.id,name:s.name})}>Delete</span>
          </td>
        </tr>)}</tbody></table></div>
      </>}

      {sec==="staff"&&<>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
          <div><h1 className="sh">Active Staff</h1><p className="ss" style={{marginBottom:0}}>Manage your team</p></div>
          <button className="btn btn-p btn-sm" onClick={()=>setStaffModal("add")}>+ Add Staff</button>
        </div>
        <div className="g2">
          {staff.filter(s=>s.active).map(s=><div key={s.id} className="glass" style={{padding:"clamp(13px,3vw,18px)"}}>
            <div style={{display:"flex",gap:11,alignItems:"flex-start"}}>
              <div className="avt" style={{background:`linear-gradient(135deg,${s.c},rgba(0,0,0,.3))`,width:44,height:44,fontSize:15,flexShrink:0}}>{s.i}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2,flexWrap:"wrap"}}>
                  <span style={{fontWeight:700,fontSize:13}}>{s.name}</span>
                  <span className="badge bu" style={{fontSize:10}}>Active</span>
                </div>
                <div style={{color:"var(--muted)",fontSize:12,marginBottom:5}}>{s.role}</div>
              </div>
              <div style={{display:"flex",gap:5,flexShrink:0}}>
                <button className="btn btn-g btn-sm" onClick={()=>setStaffModal(s)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={()=>setDelConfirm({type:"staff",id:s.id,name:s.name})}>X</button>
              </div>
            </div>
          </div>)}
        </div>
      </>}

      {sec==="approvals"&&<>
        <h1 className="sh">Staff Approvals</h1>
        <p className="ss">Review and approve new staff registration requests</p>
        {pendingStaff.length===0
          ?<div className="glass" style={{padding:48,textAlign:"center"}}><div style={{fontWeight:700,fontSize:17,marginBottom:8}}>All clear!</div><p style={{color:"var(--muted)",fontSize:13}}>No pending approval requests</p></div>
          :<div style={{display:"flex",flexDirection:"column",gap:13}}>
            {pendingStaff.map(p=><div key={p.id} className="glass" style={{padding:"clamp(14px,3vw,22px)"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:14,flexWrap:"wrap"}}>
                <div className="avt" style={{background:`linear-gradient(135deg,${p.c},rgba(0,0,0,.3))`,width:48,height:48,fontSize:17,flexShrink:0}}>{p.i}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{fontWeight:700,fontSize:15}}>{p.name}</span>
                    <span className="badge bw">Pending Approval</span>
                    <span className="badge bc" style={{fontSize:10}}>Inactive</span>
                  </div>
                  <div style={{color:"var(--muted)",fontSize:13,marginBottom:4}}>{p.role} - {p.email}</div>
                  <div style={{fontSize:11,color:"var(--muted2)"}}>Applied: {p.appliedAt}</div>
                </div>
                <div style={{display:"flex",gap:7,flexShrink:0,flexWrap:"wrap"}}>
                  <button className="btn btn-success btn-sm" onClick={()=>approveStaff(p)}>Approve & Activate</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>rejectStaff(p.id)}>Reject</button>
                </div>
              </div>
            </div>)}
          </div>
        }
      </>}

      {sec==="embed"&&<>
        <h1 className="sh">Embed Widget</h1>
        <p className="ss">Use this iframe code on other websites to show only booking form + user dashboard.</p>
        <div className="glass" style={{padding:"clamp(14px,3vw,22px)",maxWidth:860}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",letterSpacing:".07em",marginBottom:8}}>EMBED URL</div>
          <div style={{fontSize:13,color:"var(--text)",marginBottom:14,wordBreak:"break-all"}}>{embedUrl}</div>
          <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",letterSpacing:".07em",marginBottom:8}}>IFRAME CODE</div>
          <textarea className="inp" readOnly value={iframeCode} style={{fontFamily:"monospace",minHeight:120,marginBottom:12}}/>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button className="btn btn-p btn-sm" onClick={copyEmbedCode}>{copied?"Copied":"Copy Code"}</button>
            <a className="btn btn-g btn-sm" href={embedUrl} target="_blank" rel="noreferrer">Open Embed Page</a>
          </div>
        </div>
      </>}
    </div>

    <div className="bnav">
      {nav.map(n=><div key={n.id} className={`bni ${sec===n.id?"act":""}`} onClick={()=>setSec(n.id)}>
        <span style={{fontSize:12,position:"relative"}}>
          {n.icon}
          {n.badge>0&&<span style={{position:"absolute",top:-4,right:-5,background:"var(--warn)",color:"#000",borderRadius:10,padding:"0 3px",fontSize:8,fontWeight:800,lineHeight:"14px"}}>{n.badge}</span>}
        </span>
        <span>{n.l}</span>
      </div>)}
    </div>

    {svcModal&&<ServiceModal svc={svcModal==="add"?null:svcModal} services={services} onSave={saveSvc} onClose={()=>setSvcModal(null)}/>}
    {staffModal&&<StaffModal member={staffModal==="add"?null:staffModal} services={services} onSave={saveStaff} onClose={()=>setStaffModal(null)}/>}
    {delConfirm&&<Confirm msg={`Delete "${delConfirm.name}"? This action cannot be undone.`} onOk={doDelete} onCancel={()=>setDelConfirm(null)}/>}
    {bDetail&&<BookingDetailModal booking={bDetail} onClose={()=>setBDetail(null)} onStatusChange={updateStatus}/>}
    <Toasts toasts={toasts}/>
  </div>;
}
function StaffPortal({staffUser,allStaff,setAllStaff,bookings,services,onSignOut,token}){
  // Find the staff record for the logged-in user
  const me=allStaff.find(s=>s.email===staffUser?.email)||staffUser?.staffData||staffUser?.staffRef;
  const isPending=me?.status==="pending"||staffUser?.staffData?.status==="pending";
  const [tab,setTab]=useState("schedule");
  const [prof,setProf]=useState({name:me?.name||staffUser?.name||"",role:me?.role||"",email:me?.email||staffUser?.email||""});
  const [saved,setSaved]=useState({...prof});
  const [avail,setAvail]=useState(me?.avail||[true,true,true,true,true,false,false]);
  const [myServices,setMyServices]=useState(me?.services||[]);
  const {toasts,toast}=useToast();
  const myBookings=bookings.filter(b=>b.stf===me?.name||b.stf===staffUser?.name);
  const bmap={upcoming:"bu",completed:"bc",cancelled:"bx",active:"ba"};
  const nav=[{id:"schedule",icon:"📅",l:"Schedule"},{id:"services",icon:"🔧",l:"My Services"},{id:"availability",icon:"🗓",l:"Availability"},{id:"profile",icon:"👤",l:"Profile"}];
  const toggleSvc=id=>setMyServices(p=>p.includes(id)?p.filter(s=>s!==id):[...p,id]);
  const saveAvail=async()=>{
    try{
      const updated=await apiRequest("/staff/me/availability",{method:"PUT",token,body:{avail}});
      if(me?.id)setAllStaff(p=>p.map(s=>s.id===me.id?{...s,...updated}:s));
      toast("Availability saved!","success");
    }catch(e){toast(e.message||"Failed to save availability","error");}
  };
  const saveSvcs=async()=>{
    try{
      const updated=await apiRequest("/staff/me/services",{method:"PUT",token,body:{services:myServices}});
      if(me?.id)setAllStaff(p=>p.map(s=>s.id===me.id?{...s,...updated}:s));
      toast("Services updated!","success");
    }catch(e){toast(e.message||"Failed to save services","error");}
  };

  // Pending approval screen — shown before admin activates
  if(isPending){
    return <div className="pending-wrap">
      <div className="pending-icon">⏳</div>
      <h2 style={{fontSize:"clamp(20px,4vw,26px)",fontWeight:900,marginBottom:10,letterSpacing:"-.03em"}}>Admin Approval Required</h2>
      <p style={{color:"var(--muted)",maxWidth:380,lineHeight:1.7,marginBottom:20,fontSize:14}}>
        Your staff account is currently <strong style={{color:"var(--text)"}}>inactive</strong> and awaiting admin review. You'll receive access once an administrator approves your application.
      </p>
      <div className="glass" style={{padding:"clamp(14px,4vw,28px)",maxWidth:380,textAlign:"left",marginBottom:24}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",letterSpacing:".07em",marginBottom:12}}>APPLICATION STATUS</div>
        {[["Name",staffUser?.name||me?.name],["Email",staffUser?.email||me?.email],["Role",me?.role||"Specialist"],["Status",<span className="badge bc">Account: Inactive</span>],["Approval",<span className="badge bw">⏳ Pending</span>]].map(([l,v])=>(
          <div key={l} className="srow"><span className="slbl">{l}</span><span className="sval">{v}</span></div>
        ))}
      </div>
      <p style={{color:"var(--muted2)",fontSize:12,marginBottom:16}}>The admin has been notified of your registration.</p>
      <button className="btn btn-danger btn-sm" onClick={onSignOut}>Sign Out</button>
    </div>;
  }

  return <div className="dash">
    <div className="sidebar">
      <div style={{padding:"9px 10px 13px",borderBottom:"1px solid var(--border)",marginBottom:7}}>
        <div className="avt" style={{background:`linear-gradient(135deg,${me?.c||"#7c3aed"},rgba(0,0,0,.3))`,width:36,height:36,fontSize:13,marginBottom:7}}>{me?.i||initials(saved.name)}</div>
        <div style={{fontSize:13,fontWeight:700}}>{saved.name}</div>
        <div style={{fontSize:11,color:"var(--muted)"}}>{saved.role}</div>
      </div>
      {nav.map(n=><div key={n.id} className={`sitem ${tab===n.id?"act":""}`} onClick={()=>setTab(n.id)}><span>{n.icon}</span>{n.l}</div>)}
      <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid var(--border)"}}>
        <div className="sitem" style={{color:"var(--red)"}} onClick={onSignOut}><span>🚪</span>Sign Out</div>
      </div>
    </div>
    <div className="ca">
      {tab==="schedule"&&<>
        <h1 className="sh">My Schedule</h1><p className="ss">Your upcoming appointments</p>
        {myBookings.length===0
          ?<div className="glass" style={{padding:40,textAlign:"center"}}><div style={{fontSize:40,marginBottom:12}}>📅</div><div style={{fontWeight:700,marginBottom:8}}>Schedule is clear</div><p style={{color:"var(--muted)",fontSize:13}}>No upcoming bookings</p></div>
          :<div className="glass tw"><table><thead><tr><th>ID</th><th>Client</th><th>Service</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
          <tbody>{myBookings.map(b=><tr key={b.id}>
            <td style={{fontFamily:"monospace",color:"var(--muted)",fontSize:11}}>{b.id}</td>
            <td style={{fontWeight:600}}>{b.u}</td><td>{b.svc}</td>
            <td style={{color:"var(--muted)",whiteSpace:"nowrap"}}>{b.dt}</td><td>{b.t}</td>
            <td><span className={`badge ${bmap[b.s]}`}>{b.s[0].toUpperCase()+b.s.slice(1)}</span></td>
          </tr>)}</tbody></table></div>
        }
      </>}
      {tab==="services"&&<>
        <h1 className="sh">My Services</h1>
        <p className="ss">Select the services you're qualified to perform</p>
        <div className="glass" style={{padding:"clamp(14px,3vw,22px)",maxWidth:600}}>
          <div style={{display:"flex",gap:9,flexWrap:"wrap",marginBottom:18}}>
            {services.filter(s=>s.active).map(s=><div key={s.id} className={`svc-pill ${myServices.includes(s.id)?"on":""}`} onClick={()=>toggleSvc(s.id)}>
              <div className="svc-thumb">{s.img&&<img src={s.img} alt={s.name}/>}</div>
              {myServices.includes(s.id)?"✓ ":""}{s.name}
            </div>)}
          </div>
          <div style={{fontSize:12,color:"var(--muted)",marginBottom:14}}>Selected: <strong style={{color:"var(--text)"}}>{myServices.length}</strong> service{myServices.length!==1?"s":""}</div>
          <button className="btn btn-p btn-sm" onClick={saveSvcs}>Save My Services</button>
        </div>
      </>}
      {tab==="availability"&&<>
        <h1 className="sh">Availability</h1><p className="ss">Set your working days</p>
        <div className="glass" style={{padding:"clamp(14px,3vw,22px)",maxWidth:480}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:18}}>
            {DAYS.map((d,i)=><div key={d} onClick={()=>{const a=[...avail];a[i]=!a[i];setAvail(a);}} style={{padding:"9px 16px",borderRadius:12,fontSize:13,fontWeight:600,cursor:"pointer",background:avail[i]?"var(--red-dim)":"var(--glass)",border:`1px solid ${avail[i]?"var(--border-red)":"var(--border)"}`,color:avail[i]?"var(--red)":"var(--muted)",transition:"all .15s"}}>{d.slice(0,3)}</div>)}
          </div>
          <div style={{marginBottom:14}}>
            {DAYS.map((d,i)=><div key={d} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--border)",fontSize:13}}>
              <span style={{color:avail[i]?"var(--text)":"var(--muted)"}}>{d}</span>
              <span style={{color:avail[i]?"var(--success)":"var(--muted2)",fontWeight:600}}>{avail[i]?"9:00 AM – 6:00 PM":"Day off"}</span>
            </div>)}
          </div>
          <button className="btn btn-p btn-sm" onClick={saveAvail}>Save Availability</button>
        </div>
      </>}
      {tab==="profile"&&<>
        <h1 className="sh">My Profile</h1><p className="ss">Update your public profile</p>
        <div className="glass" style={{padding:"clamp(13px,3vw,22px)",maxWidth:420}}>
          <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:18,paddingBottom:14,borderBottom:"1px solid var(--border)",flexWrap:"wrap"}}>
            <div className="avt" style={{background:`linear-gradient(135deg,${me?.c||"#7c3aed"},rgba(0,0,0,.3))`,width:48,height:48,fontSize:17,flexShrink:0}}>{me?.i||initials(saved.name)}</div>
            <div><div style={{fontWeight:700,fontSize:14}}>{saved.name}</div><div style={{fontSize:11,color:"var(--muted)"}}>{saved.role}</div></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {[{l:"FULL NAME",k:"name",t:"text"},{l:"DESIGNATION",k:"role",t:"text"},{l:"EMAIL",k:"email",t:"email"}].map(fi=>(
              <div key={fi.k}><label className="lbl">{fi.l}</label><input className="inp" type={fi.t} value={prof[fi.k]||""} onChange={e=>setProf({...prof,[fi.k]:e.target.value})}/></div>
            ))}
            <button className="btn btn-p btn-sm" style={{marginTop:4,alignSelf:"flex-start"}} onClick={async()=>{
              try{
                const updated=await apiRequest("/staff/me/profile",{method:"PUT",token,body:prof});
                setSaved({...updated});
                setProf({...updated});
                if(me?.id)setAllStaff(p=>p.map(s=>s.id===me.id?{...s,...updated}:s));
                toast("Profile saved!","success");
              }catch(e){toast(e.message||"Failed to save profile","error");}
            }}>Save Changes</button>
          </div>
        </div>
      </>}
    </div>
    <div className="bnav">
      {nav.map(n=><div key={n.id} className={`bni ${tab===n.id?"act":""}`} onClick={()=>setTab(n.id)}><span style={{fontSize:18}}>{n.icon}</span><span>{n.l}</span></div>)}
    </div>
    <Toasts toasts={toasts}/>
  </div>;
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
/*
  HEADER BEHAVIOUR:
  🟢 Public (not logged in):  Logo | Admin | Staff | Login/Register
  🔵 User logged in:          Logo | Dashboard  (Admin & Staff HIDDEN, stay on homepage)
  🟣 Admin logged in:         Dedicated AdminHeader
  🟠 Staff logged in:         Dedicated StaffHeader

  PAGES:
  "home"        → Homepage with booking form (public or user logged in)
  "admin_login" → /admin/login  (separate page, not popup)
  "admin_dash"  → Admin dashboard with AdminHeader
  "staff_auth"  → /staff  (staff login + register page)
  "staff_dash"  → Staff dashboard with StaffHeader
  "user_dash"   → User dashboard (uses PublicHeader in logged-in state)
*/
export default function App(){
  const [page,setPage]                   = useState("home");
  const [user,setUser]                   = useState(null);
  const [admin,setAdmin]                 = useState(null);
  const [staffUser,setStaffUser]         = useState(null);
  const [services,setServices]           = useState(SVCS);
  const [staff,setStaff]                 = useState(STAFF0);
  const [bookings,setBookings]           = useState(BKGS0);
  const [pending,setPending]             = useState([]);
  const [userDashTab,setUserDashTab]     = useState("bookings");
  const [token,setToken]                 = useState(null);
  const [booting,setBooting]             = useState(true);
  const [showAuthModal,setShowAuthModal] = useState(false);
  const [embedMode]                      = useState(()=>typeof window!=="undefined"&&new URLSearchParams(window.location.search).get("embed")==="1");
  const embedUrl                         = typeof window!=="undefined"?`${window.location.origin}${window.location.pathname}?embed=1`:"?embed=1";

  const applyPublicData=data=>{
    setServices(data?.services||SVCS);
    setStaff(data?.staff||STAFF0);
    setBookings(data?.bookings||[]);
    setPending(data?.pendingStaff||[]);
  };

  const loadBootstrap=async sessionToken=>{
    const data=await apiRequest("/bootstrap",sessionToken?{token:sessionToken}:{});
    applyPublicData(data);
    return data;
  };

  useEffect(()=>{
    let mounted=true;
    const boot=async()=>{
      const session=readSession();
      let activeToken=session?.token||null;
      let me=null;

      if(activeToken){
        try{
          me=await apiRequest("/auth/me",{token:activeToken});
          setToken(activeToken);
        }catch{
          clearSession();
          activeToken=null;
          setToken(null);
        }
      }

      try{
        await loadBootstrap(activeToken);
      }catch{
        applyPublicData({services:SVCS,staff:STAFF0,bookings:BKGS0,pendingStaff:[]});
      }

      if(!mounted)return;

      if(embedMode){
        if(me?.user?.role==="user"){
          setUser(me.user);setAdmin(null);setStaffUser(null);setPage("home");
        }else{
          if(me){clearSession();setToken(null);}
          setUser(null);setAdmin(null);setStaffUser(null);setPage("home");
        }
      }else if(me?.user?.role==="admin"){
        setAdmin(me.user);setUser(null);setStaffUser(null);setPage("admin_dash");
      }else if(me?.user?.role==="staff"){
        setStaffUser({...me.user,staffRef:me.staffRef,staffData:me.staffData});setUser(null);setAdmin(null);setPage("staff_dash");
      }else if(me?.user?.role==="user"){
        setUser(me.user);setAdmin(null);setStaffUser(null);setPage("home");
      }else{
        setUser(null);setAdmin(null);setStaffUser(null);setPage("home");
      }

      setBooting(false);
    };

    void boot();
    return()=>{mounted=false;};
  },[embedMode]);

  const refreshData=async sessionToken=>{
    const effectiveToken=sessionToken===undefined?token:sessionToken;
    try{await loadBootstrap(effectiveToken||null);}catch{}
  };

  const setSessionState=async payload=>{
    const session={token:payload.token,user:payload.user};
    saveSession(session);
    setToken(payload.token);

    if(embedMode&&payload.user.role!=="user"){
      clearSession();
      setToken(null);
      setUser(null);setAdmin(null);setStaffUser(null);setPage("home");
      await refreshData(null);
      setShowAuthModal(false);
      return;
    }

    if(payload.user.role==="admin"){
      setAdmin(payload.user);setUser(null);setStaffUser(null);setPage("admin_dash");
    }else if(payload.user.role==="staff"){
      setStaffUser({...payload.user,staffRef:payload.staffRef,staffData:payload.staffData});setUser(null);setAdmin(null);setPage("staff_dash");
    }else{
      setUser(payload.user);setAdmin(null);setStaffUser(null);setPage("home");
    }

    await refreshData(payload.token);
    setShowAuthModal(false);
  };

  const clearAuthState=async()=>{
    clearSession();
    setToken(null);
    setUser(null);
    setAdmin(null);
    setStaffUser(null);
    setShowAuthModal(false);
    setPage("home");
    await refreshData(null);
  };

  const signOutUser=()=>{void clearAuthState();};
  const signOutAdmin=()=>{void clearAuthState();};
  const signOutStaff=()=>{void clearAuthState();};

  const handleUserAuth=payload=>{
    const targetPage=page;
    void (async()=>{
      await setSessionState(payload);
      if(payload?.user?.role==="user"&&targetPage==="user_dash")setPage("user_dash");
    })();
  };
  const handleAdminAuth=payload=>{void setSessionState(payload);};
  const handleStaffAuth=payload=>{void setSessionState(payload);};
  const goUserDash=(tab="bookings")=>{setUserDashTab(tab);setPage("user_dash");};

  useEffect(()=>{
    if(embedMode&&page!=="home"&&page!=="user_dash"){
      setPage("home");
    }
  },[embedMode,page]);

  const createBooking=async payload=>{
    if(!token)throw new Error("Please sign in first");
    const booking=await apiRequest("/bookings",{method:"POST",token,body:payload});
    setBookings(p=>[booking,...p]);
    return booking;
  };

  const openAuth=()=>setShowAuthModal(true);
  const closeAuth=()=>setShowAuthModal(false);

  if(booting){
    return <>
      <style>{CSS}</style>
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)",color:"var(--text)"}}>
        <div className="glass" style={{padding:"18px 22px",fontSize:13}}>Loading application...</div>
      </div>
    </>;
  }

  return <>
    <style>{CSS}</style>
    <div style={{position:"relative",minHeight:"100vh",background:"var(--bg)"}}>
      <div className="orb orb1"/><div className="orb orb2"/>
      <div style={{position:"relative",zIndex:1}}>

        {page==="home" && <>
          {!embedMode&&<PublicHeader
            user={user}
            onLoginClick={openAuth}
            onSignOut={signOutUser}
            onGoAdmin={() => setPage("admin_login")}
            onGoStaff={() => setPage("staff_auth")}
            onGoDash={() => goUserDash("bookings")}
            onGoProfile={() => goUserDash("profile")}
            embedMode={embedMode}
          />}
          <HomePage
            user={user}
            onUserAuth={handleUserAuth}
            onGoDash={() => goUserDash("bookings")}
            services={services}
            staff={staff}
            onCreateBooking={createBooking}
            embedMode={embedMode}
            embedHeader={embedMode?<PublicHeader
              user={user}
              onLoginClick={openAuth}
              onSignOut={signOutUser}
              onGoAdmin={() => setPage("admin_login")}
              onGoStaff={() => setPage("staff_auth")}
              onGoDash={() => goUserDash("bookings")}
              onGoProfile={() => goUserDash("profile")}
              embedMode={true}
            />:null}
          />
          {showAuthModal && <AuthModal onClose={closeAuth} onAuth={handleUserAuth}/>}
        </>}

        {page==="user_dash" && user && <>
          {!embedMode&&<PublicHeader
            user={user}
            onSignOut={signOutUser}
            onGoAdmin={() => setPage("admin_login")}
            onGoStaff={() => setPage("staff_auth")}
            onGoDash={() => goUserDash("bookings")}
            onGoProfile={() => goUserDash("profile")}
            embedMode={embedMode}
          />}
          <UserDash
            user={user}
            onSignOut={signOutUser}
            bookings={bookings}
            services={services}
            staff={staff}
            onGoHome={() => setPage("home")}
            token={token}
            onUserUpdated={setUser}
            initialTab={userDashTab}
            embedded={embedMode}
            embedHeader={embedMode?<PublicHeader
              user={user}
              onSignOut={signOutUser}
              onGoAdmin={() => setPage("admin_login")}
              onGoStaff={() => setPage("staff_auth")}
              onGoDash={() => goUserDash("bookings")}
              onGoProfile={() => goUserDash("profile")}
              embedMode={true}
            />:null}
          />
        </>}

        {page==="user_dash" && !user && <>
          {!embedMode&&<PublicHeader user={null} onLoginClick={openAuth} onGoAdmin={()=>setPage("admin_login")} onGoStaff={()=>setPage("staff_auth")} onGoDash={()=>goUserDash("bookings")} embedMode={embedMode}/>}
          {embedMode&&<PublicHeader user={null} onLoginClick={openAuth} onGoAdmin={()=>setPage("admin_login")} onGoStaff={()=>setPage("staff_auth")} onGoDash={()=>goUserDash("bookings")} embedMode={true}/>}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:embedMode?"100vh":"calc(100vh - var(--nh))",gap:14,textAlign:"center",padding:32}}>
            <div style={{fontSize:46}}>LOCK</div>
            <div style={{fontWeight:900,fontSize:22,letterSpacing:"-.03em"}}>Sign in required</div>
            <p style={{color:"var(--muted)",maxWidth:300,lineHeight:1.6}}>Please sign in to view your dashboard</p>
            <div style={{display:"flex",gap:9,flexWrap:"wrap",justifyContent:"center"}}>
              <button className="btn btn-p" onClick={openAuth}>Sign In / Register</button>
              <button className="btn btn-g" onClick={()=>setPage("home")}>{embedMode?"Back to Booking Form":"Back to Homepage"}</button>
            </div>
          </div>
          {showAuthModal && <AuthModal onClose={closeAuth} onAuth={handleUserAuth}/>}
        </>}

        {!embedMode&&page==="admin_login" && <>
          <nav className="nav" style={{zIndex:200}}>
            <div className="nav-logo" style={{cursor:"pointer"}} onClick={()=>setPage("home")}><BrandLogo size={28}/></div>
          </nav>
          <AdminLoginPage
            onLogin={handleAdminAuth}
            onBack={() => setPage("home")}
          />
        </>}

        {!embedMode&&page==="admin_dash" && <>
          {admin
            ? <><AdminHeader admin={admin} onSignOut={signOutAdmin}/>
                <AdminDash services={services} setServices={setServices} staff={staff} setStaff={setStaff}
                  bookings={bookings} setBookings={setBookings} pendingStaff={pending} setPendingStaff={setPending}
                  onSignOut={signOutAdmin} token={token} embedUrl={embedUrl}/></>
            : <><nav className="nav"><div className="nav-logo" style={{cursor:"pointer"}} onClick={()=>setPage("home")}><BrandLogo size={28}/></div></nav>
               <AdminLoginPage onLogin={handleAdminAuth} onBack={()=>setPage("home")}/></>
          }
        </>}

        {!embedMode&&page==="staff_auth" && <>
          <nav className="nav" style={{zIndex:200}}>
            <div className="nav-logo" style={{cursor:"pointer"}} onClick={()=>setPage("home")}><BrandLogo size={28}/></div>
          </nav>
          <StaffAuthPage
            onLogin={handleStaffAuth}
            onBack={() => setPage("home")}
          />
        </>}

        {!embedMode&&page==="staff_dash" && <>
          {staffUser
            ? <><StaffHeader staffUser={staffUser} onSignOut={signOutStaff}/>
                <StaffPortal staffUser={staffUser} allStaff={staff} setAllStaff={setStaff}
                  bookings={bookings} services={services} onSignOut={signOutStaff} token={token}/></>
            : <><nav className="nav"><div className="nav-logo" style={{cursor:"pointer"}} onClick={()=>setPage("home")}><BrandLogo size={28}/></div></nav>
               <StaffAuthPage onLogin={handleStaffAuth} onBack={()=>setPage("home")}/></>
          }
        </>}

      </div>
    </div>
  </>;
}

