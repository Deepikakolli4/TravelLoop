import React, { useState } from 'react'

export const SelectBudgetOptions = [
  {
    id: 1,
    title: 'Cheap',
    desc: 'Stay conscious of costs',
    icon: '💰',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 2,
    title: 'Moderate',
    desc: 'Keep costs on the average side',
    icon: '💵',
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  {
    id: 3,
    title: 'Luxury',
    desc: "Don't worry about the cost",
    icon: '💎',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
  },
];

const BudgetUI = ({onSelectedOption}:any) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
      <div className='grid grid-cols-3 md:grid-cols-3 gap-4 items-center mt-1'>
          {SelectBudgetOptions.map((item) => (
              <div 
                key={item.id} 
                className={`group relative p-5 rounded-2xl cursor-pointer text-center transition-all duration-300 transform
                  ${selectedId === item.id 
                    ? `${item.bgColor} border-2 border-${item.color.split(' ')[1].split('-')[0]}-600 scale-105 shadow-lg` 
                    : `${item.bgColor} border-2 border-gray-200 hover:scale-105 hover:shadow-lg`
                  }`}
                onClick={() => {
                  setSelectedId(item.id);
                  onSelectedOption(item.title + ":" + item.desc);
                }}
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Icon with enhanced styling */}
                <div className="text-5xl mb-2 transition-transform duration-300 group-hover:scale-110">{item.icon}</div>
                
                {/* Title */}
                <h2 className={`font-bold text-lg transition-colors duration-300
                  ${selectedId === item.id ? 'text-gray-900' : 'text-gray-800'}`}>
                  {item.title}
                </h2>
                
                {/* Description */}
                <p className='text-xs text-gray-600 mt-1 leading-tight'>{item.desc}</p>
              </div>
          ))}
      </div>
    )
}

export default BudgetUI