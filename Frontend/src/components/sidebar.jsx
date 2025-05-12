import React from 'react'
import './sidebar.css'
import { NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const sidebar = () => {

  const url = import.meta.env.VITE_API_URL
  const navigate = useNavigate()
  const {logoutUser} = useAuth()

  const handleLogout = async (e) => {
    e.preventDefault()
    try{

      const confirmLogout = window.confirm("Do you want to logout?");
      if (!confirmLogout) return;

      // const res = axios.post(`${url}/dishes/logout`, {
      //   withCredentials: true
      // })
      const res = await logoutUser()
      console.log(res)
      navigate('/')
    }catch(error){
      console.error(error)
    }
  }

  return (
    <div className='sidebar-container'>
        <div className='title-container'>
            <h1 className='title'>FoodHub</h1>
        </div>
        <div className='sidebar-buttons'>
          <div className='navigation-containter'>
              <button className='navigation'><NavLink className="navlink" to='dashboard'>Dashboard</NavLink></button>
              <button className='navigation'><NavLink className="navlink" to='products'>Products</NavLink></button>
              <button className='navigation'><NavLink className="navlink" to='historylogs'>History Logs</NavLink></button>
          </div>
          <button onClick={handleLogout} className='navigation'>Logout</button>
        </div>
    </div>
  )
}

export default sidebar