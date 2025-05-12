import React from 'react'
import './dashboard.css'
import axios from 'axios'
import { useState } from 'react'


const dashboard = () => {

  const forecast_url = import.meta.env.VITE_API_FORECAST
  const [test, setTest] = useState({
    "day_of_week": "",
    "time_of_day": "",
    "is_weekend": false,
    "total_sales": 0
  })
  const [result, setresult] = useState()
  const [notest, setNoTest] = useState(false)

  const handleSubmitTest = async (e) => {
    e.preventDefault()
    console.log(test)
    const res = await axios.post(`${forecast_url}/predict`, test)
    console.log(res.data)
    setresult(res.data)
  }

  const handleChangeDay = (e) => {
    const day = e.target.value;
    setTest(prev => ({
      ...prev,
      day_of_week: day,
      is_weekend: day === 'Saturday' || day === 'Sunday'
    }));
  };

  return (
    <div className='dashboard-container'>
      <div className='sales-overview'>
        <p className='sales-title'>Sales Overview</p>
        <h1 className='sales-amount'>$1000.00</h1>
      </div>
      <div className='dashboard-content'>
        <div className='graph'>
          <h1 className='graph-title'>Total Sales per Day</h1>
          <div className='line-graph'></div>
        </div>
        <div className='forecast-container'>
          <form onSubmit={handleSubmitTest} className='form-forecast'>
            <h1 className='forecast-title'>Forecast</h1>
            <div className='result'>
              <h3>{result ? 'Predicted Dishes' : 'Predict Dishes'}</h3>
              
              {
                result?.predictions
                .filter(item => item.predicted_sales_percentage > 0)
                .map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 className='weeks'>{item.dish}</h4>
                    <h3 className='values'>{item.predicted_sales_percentage}%</h3>
                  </div>
                ))
              }
            </div>
            <div className='input-container'>
              <select value={test.day_of_week} onChange={handleChangeDay}>
                <option value="">Select Day</option>
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
                <option>Sunday</option>
              </select>
              <select value={test.time_of_day} onChange={(e) => setTest({...test, time_of_day: e.target.value})}>
                <option value="">Select Time</option>
                <option>AM</option>
                <option>PM</option>
              </select>
              <input 
                type="number" 
                placeholder='Enter expected total sales' 
                className="input-forecast"
                value={test.total_sales}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setTest({...test, total_sales: e.target.value})}/>
            </div>
            <button type="submit" className='test' style={{cursor:'pointer'}}>Test</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default dashboard