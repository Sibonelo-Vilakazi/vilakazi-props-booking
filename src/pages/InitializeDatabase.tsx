import React, { useState } from 'react';
import { initializeFirestore } from '../utils/initializeFirestore';
import { Database, Check, AlertCircle, Loader } from 'lucide-react';

const InitializeDatabase: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInitialize = async () => {
    setIsInitializing(true);
    setError(null);

    try {
      await initializeFirestore();
      setIsComplete(true);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize database');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Initialize Firestore Database</h1>
          <p className="text-gray-600 text-sm">
            This will populate your Firestore database with initial data including users, listings, and bookings.
          </p>
        </div>

        {!isComplete && !error && (
          <button
            onClick={handleInitialize}
            disabled={isInitializing}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            {isInitializing ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Initializing Database...
              </>
            ) : (
              <>
                <Database className="w-5 h-5 mr-2" />
                Initialize Now
              </>
            )}
          </button>
        )}

        {isComplete && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Check className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-green-900">Initialization Complete!</h3>
            </div>
            <p className="text-green-800 text-sm mb-4">
              Your Firestore database has been successfully initialized with all the data.
            </p>
            <div className="space-y-2 text-sm text-green-700">
              <p>✓ Users added</p>
              <p>✓ Property listing added</p>
              <p>✓ Bookings added</p>
              <p>✓ Messages added</p>
              <p>✓ Availability data set</p>
            </div>
            <a
              href="/"
              className="mt-4 block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Go to Home
            </a>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="font-semibold text-red-900">Initialization Failed</h3>
            </div>
            <p className="text-red-800 text-sm mb-4">{error}</p>
            <button
              onClick={handleInitialize}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 text-sm mb-2">Test Accounts:</h4>
          <div className="text-blue-800 text-xs space-y-1">
            <p><strong>Admin:</strong> admin@bnb.com / admin123</p>
            <p><strong>Guest:</strong> guest@example.com / guest123</p>
            <p><strong>Guest 2:</strong> sarah@example.com / sarah123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitializeDatabase;
