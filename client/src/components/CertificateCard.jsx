import { Download, Award, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CertificateCard({ cert }) {
  return (
    <div style={{
      background:'linear-gradient(135deg,var(--card) 0%,rgba(79,70,229,0.04) 100%)',
      border:'1px solid var(--border)',borderRadius:'16px',padding:'20px',
      display:'flex',flexDirection:'column',gap:'14px',transition:'all 0.2s'
    }}
    onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
    onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
      <div style={{display:'flex',alignItems:'flex-start',gap:'12px'}}>
        <div style={{width:'40px',height:'40px',borderRadius:'12px',background:'rgba(245,158,11,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <Award size={20} color="#F59E0B"/>
        </div>
        <div>
          <h4 style={{fontWeight:700,fontSize:'14px',color:'var(--foreground)',marginBottom:'4px'}}>{cert.eventName}</h4>
          <p style={{fontSize:'12px',color:'var(--muted-foreground)'}}>{cert.date}</p>
        </div>
      </div>
      <div style={{background:'var(--muted)',borderRadius:'8px',padding:'8px 12px',display:'flex',justifyContent:'space-between'}}>
        <span style={{fontSize:'11px',color:'var(--muted-foreground)',fontWeight:500}}>Cert ID</span>
        <span style={{fontSize:'12px',fontFamily:'monospace',fontWeight:700,color:'var(--foreground)'}}>{cert.certId}</span>
      </div>
      <div style={{display:'flex',gap:'8px'}}>
        <button onClick={()=>toast.success('Downloading...')} style={{flex:1,padding:'9px',borderRadius:'10px',border:'none',background:'var(--primary)',color:'#fff',fontWeight:600,fontSize:'13px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
          <Download size={14}/> Download PDF
        </button>
        <button onClick={()=>toast('Verification coming soon!',{icon:'🔗'})} style={{padding:'9px 14px',borderRadius:'10px',border:'1px solid var(--border)',background:'transparent',color:'var(--foreground)',cursor:'pointer',display:'flex',alignItems:'center'}}>
          <ExternalLink size={14}/>
        </button>
      </div>
    </div>
  );
}
