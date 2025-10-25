import React from "react";
import { FiCalendar, FiMapPin, FiUsers, FiClock } from "react-icons/fi";
interface EventCardWideProps {
    // Add any props if needed
    className?: string;
}

export const EventCardWide = ({ className }: EventCardWideProps) => {
  return (<>
   <div className="col-span-8 overflow-hidden rounded border border-stone-300">
      <div className="p-4 border-b border-stone-200">
        <h3 className="flex items-center gap-1.5 font-medium text-stone-700">
          <FiCalendar /> Upcoming Event
        </h3>
      </div>

      <div className="p-6 flex flex-col md:flex-row items-start justify-between gap-6">
        {/* Left: Event Info */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-stone-800">
            Tech Innovators Summit 2025
          </h2>
          <p className="text-sm text-stone-500 max-w-md">
            Join 300+ professionals exploring the future of technology, AI, and design thinking.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 text-sm text-stone-600">
            <span className="flex items-center gap-2">
              <FiCalendar className="text-stone-500" /> Oct 25, 2025
            </span>
            <span className="flex items-center gap-2">
              <FiClock className="text-stone-500" /> 10:00 AM – 5:00 PM
            </span>
            <span className="flex items-center gap-2">
              <FiMapPin className="text-stone-500" /> San Francisco, CA
            </span>
          </div>
        </div>

        {/* Right: Status / Actions */}
        <div className="flex flex-col items-end justify-between">
          <span className="text-xs font-medium px-3 py-1 rounded bg-green-100 text-green-700 mb-3">
            Upcoming
          </span>
          <button className="px-4 cursor-pointer py-2 text-stone-500 rounded hover:bg-stone-100 transition text-sm">
            View Details
          </button>
        </div>
      </div>
    </div>


    
  </>
   
  );
};
