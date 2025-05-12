import React from 'react'
import './login.css'
import { NavLink,useNavigate} from 'react-router-dom'
import axios from 'axios'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'


const login = () => {

  const {loginUser} = useAuth()
  const navigate = useNavigate()
  const [loginData, setLoginData] = useState({email: "", password: ''})
  const [error, setError] = useState("")
  const url = import.meta.env.VITE_API_URL
  const handleLogin = async(e) => {
    e.preventDefault()
    //use loginuser on useAuth
    try {
      console.log(loginData)
      const trimmedData = {
        email: loginData.email.trim(),
        password: loginData.password.trim()
      }
      // const res = await axios.post(`${url}/dishes/login`, trimmedData, {
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   withCredentials: true
      // })
      const res = await loginUser(trimmedData)
      console.log(res)
      if (res) {
          navigate('/user/dashboard');
      } else {
          setError("Login failed. Please check your credentials.");
      }
    } catch (error) {
      setError("Login failed. Please check your credentials.")
      console.error(error)
    }
  }

  return (
    <div className='login-container'>
      <form className='login' onSubmit={handleLogin}>
          <h1 className='login-title'>Login</h1>
          <div className='inputs-login'>
              <label>Email</label>
              <input 
                type="email" 
                className='login-input'
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}/>
              <label>Password</label>
              <input 
                type="password" 
                className='login-input'
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}/>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button className='button-login' style={{cursor: 'pointer'}}>Login</button>
          <NavLink to='/signup' className="navlink"><p className='signup'>Signup</p></NavLink>
      </form>
    </div>
  )
}

export default login