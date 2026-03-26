import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PathSelection from '../components/PathSelection';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [showPathSelection, setShowPathSelection] = useState(false);
  const { setAuthUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setError('No verification token provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/api/verify-email?token=${token}`);
        const payload = await response.json();

        if (response.ok && payload.success) {
          setSuccess(true);
          setError('');

          if (payload.user) {
            setAuthUser(payload.user);

            if (payload.user.isFirstLogin) {
              setUserData(payload.user);
              setShowPathSelection(true);
            } else {
              setTimeout(() => {
                navigate('/dashboard');
              }, 1200);
            }
          }
        } else {
          setError(payload.message || 'Verification failed');
          setSuccess(false);
        }
      } catch (err) {
        setError('An error occurred during verification');
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate, setAuthUser]);

  const handlePathSelection = async (selectedPath) => {
    if (!userData?.id) return;

    try {
      const response = await fetch(`${BACKEND_URL}/update-path`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          selectedPath,
        }),
      });

      const payload = await response.json();
      if (payload.success) {
        setAuthUser(payload.user);
        navigate('/dashboard');
      } else {
        setError(payload.message || 'Failed to update path selection');
      }
    } catch {
      setError('Unable to save path selection. Please try again.');
    }
  };

  if (showPathSelection && userData) {
    return <PathSelection onSelectPath={handlePathSelection} userName={userData.fullName} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-green-950 to-black px-4">
      <div className="max-w-md w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg shadow-2xl p-8 border border-green-500/20">
        {loading ? (
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
            </div>
            <h1 className="text-2xl font-bold text-green-400 mb-2">Verifying Email</h1>
            <p className="text-gray-300">Please wait while we verify your email address...</p>
          </div>
        ) : success ? (
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-green-400 mb-2">Email Verified!</h1>
            <p className="text-gray-300 mb-4">Your email has been successfully verified.</p>
            <p className="text-sm text-gray-400">Preparing your learning path...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-red-400 mb-2">Verification Failed</h1>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
