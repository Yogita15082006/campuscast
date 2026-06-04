import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell,ChevronDown,LogOut,User,Radio,Search } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';
import { useAuth } from '../context/AuthContext';
import { mockData } from '../data/mockData';
import toast from 'react-hot-toast';

const PAGE_TITLES={
  '/student/dashboard':'Dashboard','/student/registrations':'My Registrations',
  '/student/teams':'My Teams','/student/attendance':'Attendance',
  '/student/certificates':'Certificates','/student/announcements':'Announcements',
  '/student/feedback':'Feedback','/admin/dashboard':'Dashboard',
  '/admin/events':'Events','/admin/attendance':'Attendance',
  '/admin/analytics':'Analytics','/events':'Browse Events',
};

export default function TopNavbar(){
  const {currentUser,logout}=useAuth();
  const navigate=useNavigate();
  const location=useLocation();
  const [menuOpen,setMenuOpen]=useState(false);
  const unread=mockData.announcements.filter(a=>a.unread).length;
  const pageTitle=PAGE_TITLES[location.pathname]||'CampusCast';
  const initials=currentUser?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)||'??';

  const handleLogout=()=>{logout();navigate('/login');};

  return(
    <header style={{
      height:'64px',background:'rgba(var(--card),0.8)',
      backdropFilter:'blur(12px)',borderBottom:'1px solid var(--border)',
      display:'flex',alignItems:'center',padding:'0 24px',gap:'12px',
      position:'sticky',top:0,zIndex:20,flexShrink:0,
      backgroundColor:'var(--card)'
    }}>
      <div style={{display:'none'}} className="mobile-logo">
        <Radio size={18} color="var(--primary)"/>
        <span style={{fontWeight:800,fontSize:'14px',marginLeft:'6px'}}>CampusCast</span>
      </div>
      <h2 style={{fontSize:'15px',fontWeight:700,color:'var(--foreground)'}} className="page-title">{pageTitle}</h2>

      <div style={{flex:1,maxWidth:'280px',marginLeft:'24px',position:'relative'}} className="search-bar">
        <Search size={14} style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',color:'var(--muted-foreground)'}}/>
        <input type="search" placeholder="Search..." style={{
          width:'100%',height:'34px',paddingLeft:'32px',paddingRight:'12px',
          background:'var(--muted)',borderRadius:'10px',border:'1px solid transparent',
          fontSize:'13px',color:'var(--foreground)',outline:'none',
          transition:'border-color 0.2s'
        }}
        onFocus={e=>e.target.style.borderColor='rgba(79,70,229,0.4)'}
        onBlur={e=>e.target.style.borderColor='transparent'}/>
      </div>

      <div style={{flex:1}}/>
      <DarkModeToggle/>

      <button onClick={()=>navigate(currentUser?.role==='admin'?'/admin/dashboard':'/student/announcements')}
        style={{position:'relative',width:'36px',height:'36px',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--muted)',border:'none',cursor:'pointer',color:'var(--foreground)'}}>
        <Bell size={16}/>
        {unread>0&&<span style={{position:'absolute',top:'6px',right:'6px',width:'8px',height:'8px',borderRadius:'50%',background:'#F43F5E',border:'2px solid var(--card)'}}/>}
      </button>

      <div style={{position:'relative'}}>
        <button onClick={()=>setMenuOpen(!menuOpen)} style={{
          display:'flex',alignItems:'center',gap:'8px',height:'36px',padding:'0 10px',
          borderRadius:'10px',background:'transparent',border:'1px solid transparent',
          cursor:'pointer',transition:'all 0.15s',color:'var(--foreground)'
        }}
        onMouseEnter={e=>{e.currentTarget.style.background='var(--muted)';e.currentTarget.style.borderColor='var(--border)';}}
        onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='transparent';}}>
          <div style={{width:'28px',height:'28px',borderRadius:'8px',background:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'11px',fontWeight:700}}>
            {initials}
          </div>
          <div style={{textAlign:'left'}} className="user-info">
            <p style={{fontSize:'12px',fontWeight:700,color:'var(--foreground)',lineHeight:1.2}}>{currentUser?.name?.split(' ')[0]}</p>
            <p style={{fontSize:'10px',color:'var(--muted-foreground)',textTransform:'capitalize'}}>{currentUser?.role}</p>
          </div>
          <ChevronDown size={13} color="var(--muted-foreground)" className="chevron"/>
        </button>

        {menuOpen&&(
          <>
            <div onClick={()=>setMenuOpen(false)} style={{position:'fixed',inset:0,zIndex:100}}/>
            <div style={{
              position:'absolute',right:0,top:'44px',width:'200px',
              background:'var(--card)',border:'1px solid var(--border)',borderRadius:'12px',
              boxShadow:'0 10px 30px rgba(0,0,0,0.15)',zIndex:101,overflow:'hidden'
            }}>
              <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)'}}>
                <p style={{fontSize:'13px',fontWeight:700,color:'var(--foreground)'}}>{currentUser?.name}</p>
                <p style={{fontSize:'11px',color:'var(--muted-foreground)'}}>{currentUser?.email}</p>
              </div>
              <button onClick={()=>{toast('Profile settings coming soon!',{icon:'👤'});setMenuOpen(false);}} style={{
                width:'100%',padding:'10px 16px',background:'transparent',border:'none',
                cursor:'pointer',display:'flex',alignItems:'center',gap:'8px',
                fontSize:'13px',color:'var(--foreground)',fontWeight:500
              }}><User size={14}/> Profile</button>
              <div style={{height:'1px',background:'var(--border)',margin:'4px 0'}}/>
              <button onClick={handleLogout} style={{
                width:'100%',padding:'10px 16px',background:'transparent',border:'none',
                cursor:'pointer',display:'flex',alignItems:'center',gap:'8px',
                fontSize:'13px',color:'#F43F5E',fontWeight:500
              }}><LogOut size={14}/> Logout</button>
            </div>
          </>
        )}
      </div>
      <style>{`
        @media(max-width:768px){
          .page-title{display:none!important;}
          .search-bar{display:none!important;}
          .user-info,.chevron{display:none!important;}
          .mobile-logo{display:flex!important;align-items:center;}
        }
      `}</style>
    </header>
  );
}
