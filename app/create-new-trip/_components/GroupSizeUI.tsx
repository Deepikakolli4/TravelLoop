import React from 'react'
export const SelectTravelersList = [
  {
    id: 1,
    title: 'Just Me',
    desc: 'A solo traveler exploring the world',
    icon: '✈️',
    people: '1',
  },
  {
    id: 2,
    title: 'A Couple',
    desc: 'Two travelers exploring together',
    icon: '🥂',
    people: '2',
  },
  {
    id: 3,
    title: 'Family',
    desc: 'A fun-loving family adventure',
    icon: '🏠',
    people: '3 to 5 People',
  },
  {
    id: 4,
    title: 'Friends',
    desc: 'A group of thrill-seeking friends',
    icon: '🚤',
    people: '5 to 10 People',
  },
];

const GroupSizeUI = ({onSelectedOption}:any) => {
  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 items-center mt-2'>
        {SelectTravelersList.map((item,index)=>(
            <div key ={index} className='p-4 border rounded-2xl
             bg-white hover:border-primary cursor-pointer text-center'
             onClick={() => onSelectedOption(item.title+":"+item.people)}
             >
                <div className="text-2xl">{item.icon}</div>
                <h2 className="font-medium mt-1">{item.title}</h2>
                <p className='text-sm text-gray-500'>{item.desc}</p>
            </div>
        ))}
    </div>
  )
}

export default GroupSizeUI