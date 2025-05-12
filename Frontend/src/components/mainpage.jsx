import React from 'react'
import './mainpage.css'
import Sidebar from './sidebar'
import { Outlet } from 'react-router-dom'

const Mainpage = () => {
  return (
    <div className='main-container'>
        <Sidebar/>
        <div className='pages-container'>
            <Outlet/>
        </div>
    </div>
  )
}

export default Mainpage