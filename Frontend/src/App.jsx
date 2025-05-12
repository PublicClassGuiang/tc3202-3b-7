import './App.css'
import { createBrowserRouter, Route, createRoutesFromElements, RouterProvider } from "react-router-dom";
import Mainpage from './components/mainpage';
import Dashboard from './components/dashboard'
import Products from './components/products'
import HistoryLogs from './components/historylogs'
import Login from './components/login'
import Signup from './components/signup'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path='/' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='user' element={
          <ProtectedRoute>
            <Mainpage/>
          </ProtectedRoute>
        }>
          <Route path='dashboard' element={<Dashboard/>}/>
          <Route path='products' element={<Products/>}/>
          <Route path='historylogs' element={<HistoryLogs/>}/>
        </Route>
      </Route>
    )
  );

  return (
    <AuthProvider>
      <div className="app-container">
        <RouterProvider router={router} />
      </div>
    </AuthProvider>
  );
}

export default App
