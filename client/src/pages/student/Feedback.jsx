import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import FeedbackStars from '../../components/FeedbackStars';
import { mockData } from '../../data/mockData';
import toast from 'react-hot-toast';

export default function Feedback() {
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  const pending = mockData.feedback.filter(f => f.status === 'Pending');
  const inp = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' };
  const lb = { fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', display: 'block', marginBottom: '8px' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!event) return toast.error('Please select an event');
    if (rating === 0) return toast.error('Please provide a rating');
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    setSubmitted(true); setSubmitting(false);
    toast.success('Feedback submitted successfully!');
  };

  return (
    <StudentLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--foreground)' }}>Submit Feedback</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Help us improve future events</p>
        </div>

        {submitted ? (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '48px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={32} color="#10B981" />
            </div>
            <h2 style={{ fontWeight: 800, fontSize: '18px', color: 'var(--foreground)', marginBottom: '8px' }}>Feedback Submitted!</h2>
            <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', marginBottom: '24px' }}>Thank you for helping us improve CampusCast events.</p>
            <button onClick={() => { setSubmitted(false); setEvent(''); setRating(0); setComment(''); setSuggestions(''); }} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>Submit Another</button>
          </div>
        ) : (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px' }}>
            {loading ? <div style={{ height: '300px' }} className="skeleton" /> : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={lb}>Select Event</label>
                  <select value={event} onChange={e => setEvent(e.target.value)} style={{ ...inp, height: '42px', cursor: 'pointer' }}>
                    <option value="">Choose a completed event…</option>
                    {pending.map(f => <option key={f.id} value={f.id}>{f.eventName}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lb}>Overall Rating</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FeedbackStars value={rating} onChange={setRating} />
                    {rating > 0 && <span style={{ fontSize: '13px', color: 'var(--muted-foreground)', fontWeight: 600 }}>{['','Poor','Fair','Good','Very Good','Excellent'][rating]}</span>}
                  </div>
                </div>
                <div>
                  <label style={lb}>Comments</label>
                  <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience…" rows={4} style={inp} />
                </div>
                <div>
                  <label style={lb}>Suggestions for improvement</label>
                  <textarea value={suggestions} onChange={e => setSuggestions(e.target.value)} placeholder="What could be better?" rows={3} style={inp} />
                </div>
                <button type="submit" disabled={submitting} style={{ padding: '12px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: '15px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.8 : 1 }}>
                  {submitting ? 'Submitting…' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
