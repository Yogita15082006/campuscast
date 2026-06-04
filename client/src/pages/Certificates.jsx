import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FiAward, FiDownload, FiExternalLink, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/certificates/my-certificates');
      setCertificates(res.data.data.certificates);
    } catch (error) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = (pdfUrl, eventTitle) => {
    // pdfUrl should be the path on backend e.g. /certificates/cert_123.pdf
    const url = `${import.meta.env.VITE_API_URL?.replace('/api', '')}${pdfUrl}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${eventTitle.replace(/\s+/g, '_')}_Certificate.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Certificates</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and download your earned certificates.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-16 card">
          <FiAward className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No certificates yet</h3>
          <p className="text-gray-500 mt-1">Attend events and get your attendance verified to earn certificates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div key={cert._id} className="card p-0 overflow-hidden flex flex-col group">
              <div className="h-40 bg-gradient-to-br from-primary-500 to-purple-600 relative p-6 flex flex-col justify-center items-center text-white text-center">
                <FiAward size={48} className="mb-2 opacity-80" />
                <h3 className="font-bold text-lg line-clamp-1">{cert.event?.title || 'Event Certificate'}</h3>
                <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                  {new Date(cert.issueDate).getFullYear()}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col bg-white dark:bg-gray-800">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <FiCalendar /> Issued: {new Date(cert.issueDate).toLocaleDateString()}
                </div>
                
                <div className="mt-auto space-y-2">
                  <button 
                    onClick={() => downloadCertificate(cert.pdfUrl, cert.event?.title)}
                    className="btn btn-primary w-full py-2.5 flex items-center justify-center gap-2"
                  >
                    <FiDownload /> Download PDF
                  </button>
                  <Link 
                    to={`/verify/${cert.certificateId}`}
                    className="btn btn-outline w-full py-2.5 flex items-center justify-center gap-2"
                  >
                    <FiExternalLink /> Verify Link
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certificates;
