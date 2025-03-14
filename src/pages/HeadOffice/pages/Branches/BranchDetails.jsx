import React from 'react';
import { ArrowLeft, MapPin, Phone, Calendar, FileText } from 'lucide-react';

const BranchDetailsView = ({ branch, navigate }) => {
  const DetailIcon = ({ Icon, label, value }) => (
    <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
      <div className="bg-blue-50 p-3 rounded-full">
        <Icon className="text-blue-600" size={20} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text- font-semibold text-gray-800">{value || "N/A"}</p>
      </div>
    </div>
  );

  return (
    <div className=" mx-auto rounded-2xl  bg-gray-100 ">
      <div className="bg-white rounded-2xl  overflow-hidden">
        <div className="rounded-2xl px-6 text-white">
          <div className="flex mt-3 items-center space-x-4">
            <button
              onClick={() => navigate("/ho/branch/list")}
              className="hover:bg-blue-400  bg-blue-500 rounded-full p-1 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl text-blue-600 font-bold flex-grow">Branch Details</h1>
          </div>
        </div>

        <div className="p-3 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <DetailIcon 
              Icon={FileText} 
              label="Branch Name" 
              value={branch.Name} 
            />
            <DetailIcon 
              Icon={Calendar} 
              label="Created Date" 
              value={branch.DOT ? new Date(branch.DOT).toLocaleDateString() : "N/A"} 
            />
            <DetailIcon 
              Icon={MapPin} 
              label="Address" 
              value={branch.Address} 
            />
            <DetailIcon 
              Icon={Phone} 
              label="Phone Number" 
              value={branch.PhoneNo} 
            />
          </div>

          {/* <div className="bg-gray-50 p-2 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Additional Remarks</h3>
            <p className="text-gray-600">{branch.Remark || "No additional remarks"}</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default BranchDetailsView;