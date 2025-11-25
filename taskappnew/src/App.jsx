import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Header from './Components/Header'
import Login from './Components/Login'
import SignUp from './Components/SignUp'
import TaskPage from './Components/TaskPage'
import AssignedByme from './Components/AssignedByme'
import ShowAllTasks from './Components/ShowAllTasks'
import UserDetails from './Components/UserDetails'
import ResetPassword from './Components/ResetPassword'
import Giver from './Components/Giver'
import "./theme.css";
import Resend from './Components/Resend'
import Calender  from './Components/Calender'
import UserTaskBoard from './Components/UserTaskBoard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
      <Header/>
        <Routes>
          <Route path='/tg' element={<TaskPage/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/sign' element={<SignUp/>}/>
          <Route path='/abym' element={<AssignedByme/>}/>
          <Route path='/showTasks/:id' element={<ShowAllTasks/>}/>
          <Route path='/profile' element={<UserDetails/>}/>
          <Route path='rp' element={<ResetPassword/>}/>
          <Route path='/newtasks' element={<Giver/>}/>
          <Route path='/fp' element={<Resend/>}/>
          <Route path='/cln' element={<Calender/>}/>
          <Route path='/' element={<UserTaskBoard/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
