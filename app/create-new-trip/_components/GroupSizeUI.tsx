import React, { useState } from 'react'

export const SelectTravelersList = [
  {
    id: 1,
    title: 'Just Me',
    desc: 'A solo traveler exploring the world',
    icon: '🧑',
    people: '1',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 2,
    title: 'A Couple',
    desc: 'Two travelers exploring together',
    icon: '💑',
    people: '2',
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
  },
  {
    id: 3,
    title: 'Family',
    desc: 'A fun-loving family adventure',
    icon: '👨‍👩‍👧',
    people: '3 to 5 People',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 4,
    title: 'Friends',
    desc: 'A group of thrill-seeking friends',
    icon: '👫',
    people: '5 to 10 People',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
  },
];

const GroupSizeUI = ({onSelectedOption}:any) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 items-center mt-2'>
        {SelectTravelersList.map((item) => (
            <div 
              key={item.id} 
              className={`group relative p-5 rounded-2xl cursor-pointer text-center transition-all duration-300 transform
                ${selectedId === item.id 
                  ? `${item.bgColor} border-2 border-${item.color.split(' ')[1].split('-')[0]}-600 scale-105 shadow-lg` 
                  : `${item.bgColor} border-2 border-gray-200 hover:scale-105 hover:shadow-lg`
                }`}
              onClick={() => {
                setSelectedId(item.id);
                onSelectedOption(item.title + ":" + item.people);
              }}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              {/* Icon with enhanced styling */}
              <div className="text-5xl mb-2 transition-transform duration-300 group-hover:scale-110">{item.icon}</div>
              
              {/* Title */}
              <h2 className={`font-bold text-lg mt-2 transition-colors duration-300
                ${selectedId === item.id ? 'text-gray-900' : 'text-gray-800'}`}>
                {item.title}
              </h2>
              
              {/* Description */}
              <p className='text-xs text-gray-600 mt-1 leading-tight'>{item.desc}</p>
              
              {/* People count badge */}
              <div className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${item.color}`}>
                {item.people} {item.people === '1' ? 'person' : 'people'}
              </div>
            </div>
        ))}
    </div>
  )
}

export default GroupSizeUI