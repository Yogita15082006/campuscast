import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { FiCheckCircle, FiXCircle, FiAward, FiCalendar, FiUser, FiHome } from 'react-icons/fi';

const VerifyCertificate = () => {
  const { certId } = useParams();
  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    verifyCert();
  }, [certId]);

  const verifyCert = async () => {
    try {
      setLoading(true);
      // Wait, this is a public endpoint. Typically no auth header required, but api instance might attach token. That's fine.
      const res = await api.get(`/certificates/verify/${certId}`);
      setCertData(res.data.data.certificate);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or missing certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">CampusCast</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Certificate Verification Portal</p>
        </div>

        <div className="card p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-500">Verifying certificate...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <FiXCircle className="mx-auto text-red-500 mb-4" size={64} />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h2>
              <p className="text-gray-500">{error}</p>
              <Link to="/" className="btn btn-outline mt-6 inline-flex items-center gap-2">
                <FiHome /> Back to Home
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <FiCheckCircle className="mx-auto text-green-500 mb-4" size={64} />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Certificate Verified!</h2>
              <p className="text-gray-500 mb-8">This is a valid certificate issued by CampusCast.</p>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 text-left space-y-4 border border-gray-100 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                    <FiUser /> Issued To
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">{certData.student?.name || 'Unknown Student'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                    <FiAward /> Event
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">{certData.event?.title || 'Unknown Event'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                    <FiCalendar /> Issue Date
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {new Date(certData.issueDate).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="mt-8 text-sm text-gray-400">
                Certificate ID: <br/>
                <span className="font-mono text-gray-600 dark:text-gray-300">{certData.certificateId}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
