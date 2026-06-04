import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard,Calendar,ClipboardList,Users,CheckSquare,Award,Bell,MessageSquare,BarChart3,Radio,X,Menu,Sparkles,FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const studentLinks=[
  {to:'/student/dashboard',label:'Dashboard',icon:LayoutDashboard},
  {to:'/events',label:'Browse Events',icon:Calendar},
  {to:'/student/registrations',label:'Registrations',icon:ClipboardList},
  {to:'/student/teams',label:'My Teams',icon:Users},
  {to:'/student/attendance',label:'Attendance',icon:CheckSquare},
  {to:'/student/certificates',label:'Certificates',icon:Award},
  {to:'/student/announcements',label:'Announcements',icon:Bell},
  {to:'/student/feedback',label:'Feedback',icon:MessageSquare},
];
const adminLinks=[
  {to:'/admin/dashboard',label:'Dashboard',icon:LayoutDashboard},
  {to:'/admin/events',label:'Events',icon:Calendar},
  {to:'/admin/attendance',label:'Attendance',icon:CheckSquare},
  {to:'/admin/analytics',label:'Analytics',icon:BarChart3},
  {to:'/events',label:'Public View',icon:FileText},
];

export default function SidebarNav({role='student'}){
  const [open,setOpen]=useState(false);
  const {currentUser}=useAuth();
  const links=role==='student'?studentLinks:adminLinks;
  const initials=currentUser?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)||'??';

  const nav=(
    <aside style={{
      width:'240px',flexShrink:0,background:'var(--sidebar)',
      borderRight:'1px solid var(--sidebar-border)',display:'flex',
      flexDirection:'column',height:'100vh',position:'sticky',top:0,overflow:'hidden'
    }}>
      <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'0 20px',height:'64px',borderBottom:'1px solid var(--sidebar-border)',flexShrink:0}}>
        <div style={{width:'32px',height:'32px',borderRadius:'10px',background:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 12px rgba(79,70,229,0.3)'}}>
          <Radio size={16} color="#fff"/>
        </div>
        <div>
          <span style={{fontWeight:800,fontSize:'15px',color:'var(--foreground)',letterSpacing:'-0.3px'}}>CampusCast</span>
          <div style={{display:'flex',alignItems:'center',gap:'4px',marginTop:'1px'}}>
            <Sparkles size={10} color="var(--primary)"/>
            <span style={{fontSize:'10px',color:'var(--muted-foreground)',textTransform:'capitalize',fontWeight:500}}>{role} portal</span>
          </div>
        </div>
      </div>

      <nav style={{flex:1,padding:'12px',overflowY:'auto'}}>
        {links.map(({to,label,icon:Icon})=>(
          <NavLink key={to} to={to} onClick={()=>setOpen(false)}
            style={({isActive})=>({
              display:'flex',alignItems:'center',gap:'10px',padding:'9px 12px',
              borderRadius:'10px',marginBottom:'2px',fontSize:'13px',fontWeight:600,
              textDecoration:'none',transition:'all 0.15s',
              background:isActive?'var(--primary)':'transparent',
              color:isActive?'#fff':'var(--muted-foreground)'
            })}>
            <Icon size={15}/>
            {label}
            {label==='Announcements'&&role==='student'&&(
              <span style={{marginLeft:'auto',width:'7px',height:'7px',borderRadius:'50%',background:'#F43F5E'}}/>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{padding:'12px',borderTop:'1px solid var(--sidebar-border)',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',background:'var(--muted)',borderRadius:'10px'}}>
          <div style={{width:'28px',height:'28px',borderRadius:'8px',background:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'11px',fontWeight:700,flexShrink:0}}>
            {initials}
          </div>
          <div style={{minWidth:0}}>
            <p style={{fontSize:'12px',fontWeight:700,color:'var(--foreground)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{currentUser?.name}</p>
            <p style={{fontSize:'10px',color:'var(--muted-foreground)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{currentUser?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );

  return(
    <>
      <button onClick={()=>setOpen(!open)} style={{display:'none',position:'fixed',top:'14px',left:'16px',zIndex:50,width:'36px',height:'36px',borderRadius:'10px',background:'var(--card)',border:'1px solid var(--border)',cursor:'pointer',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}
        className="mobile-menu-btn">
        {open?<X size={18}/>:<Menu size={18}/>}
      </button>
      {open&&<div onClick={()=>setOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)',zIndex:30}}/>}
      <div className={`sidebar-wrapper${open?' open':''}`} style={{zIndex:40}}>
        {nav}
      </div>
      <style>{`
        @media(max-width:768px){
          .mobile-menu-btn{display:flex!important;}
          .sidebar-wrapper{position:fixed;top:0;left:0;height:100%;transform:translateX(-100%);transition:transform 0.2s;}
          .sidebar-wrapper.open{transform:translateX(0);}
        }
      `}</style>
    </>
  );
}
