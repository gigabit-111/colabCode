import React from 'react'

function AppSideBar({ currentRoom, rooms }) {
    console.log("rooms:", rooms)
  return (
    <div className='w-64 bg-gray-900 text-white p-4'>
      <h2 className='text-lg font-bold mb-4'>Room Info</h2>
      <div className='mb-2'>
        <span className='font-semibold'>Room ID:</span> {currentRoom}
      </div>
      <div>
        <span className='font-semibold'>Users:</span>
        <ul>
          {/* {Array.from(rooms.get(currentRoom)).map((user) => (
            <li key={user}>{user}</li>
          ))} */}
          <li>{rooms}</li>
        </ul>
      </div>
    </div>
  )
}

export default AppSideBar