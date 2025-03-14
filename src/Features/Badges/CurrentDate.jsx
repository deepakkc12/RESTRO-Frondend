import React from 'react';
import { Calendar } from 'lucide-react';

function CurrentDate() {
  const date = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);

  return (
    <div className="inline-flex mx-2 items-center gap-2 px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-md">
      {/* <Calendar size={16} /> */}
      {formattedDate}
    </div>
  );
}

export default CurrentDate;