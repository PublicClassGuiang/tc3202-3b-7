import React from 'react'
import './signup.css'
import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
const signup = () => {
  const navigate = useNavigate()
  const [data, setData] = useState({first_name: '', last_name: '', email: '', password: ''})

  const handleSubmit = async(e) => {
    e.preventDefault()
    const url = import.meta.env.VITE_API_URL
    try {
      console.log(data)
      const trimmedData = {
        email: data.email.trim(),
        password: data.password.trim(),
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim()
      }
      const res = await axios.post(`${url}/dishes/register`, trimmedData, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      })
      console.log(res)
      if (res.data) {
          alert(`Please check your email ${trimmedData.email} and verify before\nlogging in.`)
          navigate('/');
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className='signup-container'>
        <form onSubmit={handleSubmit} className='login'>
          <h1 className='login-title'>Signup</h1>
          <div className='inputs-login'>
            <label>First Name</label>
            <input 
              type="text" 
              className='login-input'
              value={data.first_name}
              onChange={(e) => setData({...data, first_name: e.target.value})}/>
            <label>Last Name</label>
            <input 
              type="text" 
              className='login-input'
              value={data.last_name}
              onChange={(e) => setData({...data, last_name: e.target.value})}/>
            <label>Email</label>
            <input 
              type="email" 
              className='login-input'
              value={data.email}
              onChange={(e) => setData({...data, email: e.target.value})}/>
            <label>Password</label>
            <input 
              type="password" 
              className='login-input'
              value={data.password}
              onChange={(e) => setData({...data, password: e.target.value})}/>
            <label>Confirm Password</label>
            <input type="password" className='login-input'/>
          </div>
          <button className='button-login' style={{cursor: 'pointer'}}>Signup</button>
          <NavLink to='/' className="navlink"><p className='signup'>Back to Login</p></NavLink>
      </form>
    </div>
  )
}

export default signup