import React, { useState } from 'react';
import { Download, Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import AdminPanelHeader from '../../../components/Headers/AdminPanelHeader';
import { fileRequest, getRequest, postRequest } from '../../../services/apis/requests';
import { FILE_BASE_URL } from '../../../utils/constants';

const DatabaseBackup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);

  const handleBackup = async () => {
    setIsLoading(true);
    setStatus('backing-up');
    setError(null);

    try {
      // Make API call to trigger backup
      const response = await postRequest('db/backup/');

      if (!response.success) {
        throw new Error('Failed to create backup');
      }

      setFileName(response.data);
      setStatus('backed-up');

      // Create a download link and trigger the download
      const downloadUrl = `${FILE_BASE_URL}backup/${response.data}`;


      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = response.data;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); 

      setTimeout(() => {
        const fileResponse = postRequest(`db-backup/delete/${response.data}/`);
      }, 1000);

      setStatus('completed');


    } catch (err) {
      setError(err.message);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AdminPanelHeader/>
      <div className="w-full mt-20 max-w-md mx-auto bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-xl font-semibold">
            <Database className="h-6 w-6" />
            Database Backup
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Create and download a backup of your database
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Messages */}
          {status === 'backing-up' && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              <div>
                <p className="font-medium text-blue-800">Creating Backup</p>
                <p className="text-sm text-blue-600">Please wait while we create your database backup...</p>
              </div>
            </div>
          )}

          {status === 'backed-up' && (
            <div className="mb-4 p-4 bg-green-50 rounded-lg flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-green-800">Backup Created</p>
                <p className="text-sm text-green-600">
                  Your backup file {fileName} has been created. Starting download...
                </p>
              </div>
            </div>
          )}

          {status === 'completed' && (
            <div className="mb-4 p-4 bg-green-50 rounded-lg flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-green-800">Backup Complete</p>
                <p className="text-sm text-green-600">
                  Your backup has been created and downloaded successfully.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleBackup}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-medium
              ${isLoading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              } transition-colors`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Backup...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Create & Download Backup
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default DatabaseBackup;