'use client'

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'increase',
  icon: Icon,
  iconColor = 'text-[#ae0b0b]',
  iconBg = 'bg-red-50',
  href
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {value}
          </p>
          {change && (
            <div className="flex items-center gap-1 mt-3">
              {changeType === 'increase' ? (
                <ArrowUpIcon className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-semibold ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${iconBg}`}>
            <Icon className={`w-7 h-7 ${iconColor}`} />
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard
