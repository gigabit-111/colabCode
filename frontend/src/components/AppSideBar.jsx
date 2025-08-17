import React from 'react'

function AppSideBar({ currentRoom, rooms, language, setLanguage }) {
    console.log("rooms:", rooms)
  return (
    <div className='w-64 bg-gray-900 text-white p-4 rounded-xl'>
      <div className='flex items-center justify-between'>
        <p className='text-lg font-bold mb-2 underline flex text-center'>Room Info:</p>
        <button className='bg-blue-500 rounded p-1 text-white hover:bg-blue-600'>Copy ID</button>
      </div>
      <div className='p-2'>
        <span className='font-semibold'>Room ID:</span> {currentRoom}
      </div>
      <div className='p-2'>
        <span className='font-semibold'>Users:</span>
        <ul>
          {/* {Array.from(rooms.get(currentRoom)).map((user) => (
            <li key={user}>{user}</li>
          ))} */}
          <li>{rooms}</li>
        </ul>
      </div>
      <div className='p-2 flex flex-col gap-2'>
        <p>Select Programming Language:</p>
        <select name="" id="" value={language} onChange={(e) => setLanguage(e.target.value)} className='text-white bg-gray-800 p-2 rounded'>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>
      <div className='p-2'>
        <button className='bg-red-500 rounded p-1 text-white hover:bg-red-600'>Leave Room</button>
      </div>
    </div>
  )
}

export default AppSideBar