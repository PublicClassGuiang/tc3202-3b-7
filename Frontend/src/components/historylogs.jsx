import React from 'react'
import './historylogs.css'
import axios from 'axios'
import { useState, useEffect } from 'react'
import axiosInstance from '../instance/axiosInstance'


const historylogs = () => {

  const url = import.meta.env.VITE_API_URL;

  const [history, setHistory] = useState()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`${url}/dishes/orders`, {
          withCredentials: true
        });
        console.log(res.data);
        setHistory(res.data)
      } catch (error) {
        console.error('Error fetching dishes:', error);
      }
    };

    fetchData();
  }, [])

  const getTotal = (log) => {
    const dish = log.dishes
    const total = dish.reduce((sum, item) => {
      return sum + item.quantity * item.price_at_order_time;
    }, 0)
    return total
  }

  return (
    <div className='logs-container'>
      <h1>History Logs</h1>
      <table>
        <thead>
          <tr>
            <th>TimeStamp</th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
          {
            history?.length > 0 && (
              history.map(details => {
                return (
                  <tr key={details.id}>
                    <td>{new Date(details.order_time).toLocaleDateString("en-PH", {
                      timeZone: 'Asia/Manila',
                      weekday: 'long',
                      year: "numeric",
                      month: "long",
                      day: "2-digit",
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    </td>
                    <td className='price-row'>{
                      details.dishes.map((dish, index) => (
                        <span key={index}>
                          {dish.dish_name} {dish.quantity}X = ₱{dish.quantity * dish.price_at_order_time}
                          <br />
                        </span>
                      )
                    )} Total: ₱{getTotal(details)}</td>
                  </tr>
                )
              })
            )
          }
        </tbody>
      </table>
    </div>
  )
}

export default historylogs