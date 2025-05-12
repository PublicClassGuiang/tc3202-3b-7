import React from 'react'
import './products.css'
import { useState, useEffect } from 'react'
import axios from 'axios'
import axiosInstance from '../instance/axiosInstance'

const products = () => {

  const [dishes, setDishes] = useState([])
  const [newDish, setNewDish] = useState({"dish_name": "", "price": 0})
  const [orders, setOrders] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)

  const url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`${url}/dishes/all`, {
          withCredentials:true
        });
        console.log(res.status);
        setDishes(res.data)
      } catch (error) {
        console.error('Error fetching dishes:', error);
      }
    };

    fetchData();
  }, [])

  const handleSubmit_newDish = async (e) => {
    e.preventDefault()
    if (newDish.dish_name === '' || newDish.price <= 0) {
      alert('Check dish name or the price before adding.');
      return;
    }
  
    try {
      console.log(newDish);
      const res = await axiosInstance.post(`${url}/dishes/create`, newDish, {
        withCredentials:true
      });
      console.log(res.data);
      
      setDishes(prev => [...prev, res.data]); 
      setNewDish({ dish_name: "", price: 0 }); 
    } catch (error) {
      console.error("Failed to create dish:", error);
      alert("Something went wrong while adding the dish.", error);
    }
  };

  const addOrder = (dish_name, price, id) => {
    // setOrders(...orders, {dish_name: order, price: price, quantity: 1})
    setOrders(prevOrders => {
      const existingOrder = prevOrders.find(order => order.id === id);
      if (existingOrder) {
        return prevOrders.map(order =>
          order.id === id
            ? { ...order, quantity: order.quantity + 1 }
            : order
        );
      }else{
        return [...prevOrders, { id, dish_name, price, quantity: 1 }];
      }
    })
  }


  const [disableBTN, setDisableBTN] = useState(false)
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === ''){
      setDisableBTN(true)
    }else{
      setDisableBTN(false)
    }
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === id ? { ...order, quantity: parseInt(newQuantity) } : order
      )
    );
  };

  const removeOrder = (id) => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
  };

  useEffect(() => {
    console.log(orders)
    const total = orders.reduce((sum, item) => {
      return sum + item.quantity * item.price;
    }, 0)
    setTotalPrice(total)
  }, [orders])

  const createOrder = async (e) => {
    e.preventDefault()
    console.log('creating order')
    if (orders.length === 0) {
      alert("You don't have an order yet. Please take an order.");
      return;
    }
    // const res = axios.post(`${url}/dishes/order`)
    try {
      const res = await axiosInstance.post(`${url}/dishes/order`, { items: orders }, {
        withCredentials:true
      });
      console.log("Order submitted:", res.data);
      alert("Order successfully placed!");
  
      // Optionally reset orders
      setOrders([]);
    } catch (error) {
      console.error("Failed to submit order:", error);
      alert("There was an issue placing your order. \n > Please check the quantity of your order");
    }
  }

  return (
    <div className='products-container'>
      <div className='products'>
        <form className='add-product' onSubmit={handleSubmit_newDish}>
          <input
            required 
            type="text" 
            className='product-name' 
            placeholder='Enter Product Name'
            value={newDish.dish_name}
            onChange={(e) => setNewDish({...newDish, dish_name: e.target.value})}/>
          <input
            required 
            type="number" 
            className='product-price' 
            placeholder='Enter Product Price'
            value={newDish.price}
            onFocus={(e) => e.target.select()}
            onChange={(e) => setNewDish({...newDish, price: e.target.value})}/>
          <button className='button-add-products'>Add Product</button>
        </form>
        <div className='table-container'>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price Per Order</th>
              </tr>
            </thead>
            <tbody>
              {
                dishes.map(dish => (
                  <tr key={dish.id} onClick={() => addOrder(dish.dish_name, dish.price, dish.id)} style={{ cursor: 'pointer' }}>
                    <td >{dish.dish_name}</td>
                    <td className='price-row'>{dish.price}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
      <div className='orders-container'>
        <h1>Orders</h1>
        <div className='cart-container'>
          {orders.map(order => (
            <div className='cart-product' key={order.dish_name}>
              <div className='cart-details'>
                <h3>{order.dish_name}</h3>
                <p className='gray'>{order.price}</p>
              </div>
              <div className='cart-details'>
                <h5 className='gray'>Qty</h5>
                <input
                  type="number"
                  min="1"
                  value={order.quantity === '' ? '' : order.quantity}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => updateQuantity(order.id, e.target.value)}
                  className="quantity-input"
                />
              </div>
              <div className='cart-details'>
                <h5 className='gray'>Sub-Total</h5>
                <p>{order.price * order.quantity}</p>
              </div>
              <button className='remove-button' onClick={() => removeOrder(order.id)} style={{cursor: 'pointer'}}>x</button>
            </div>
          ))}
        </div>
        <button onClick={createOrder} disabled={totalPrice <= 0  || disableBTN} className={totalPrice <= 0 || disableBTN ?'total-button-grey' : 'total-button'}>Total P{totalPrice}</button>
      </div>
    </div>
  )
}

export default products