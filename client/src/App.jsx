import { useState, useEffect } from 'react'
import { LevelContext } from './components/Context'
import axios from "axios"

import ChineseRoom from './components/room/ChineseRoom'
import Desk from './components/desk/Desk'
import Popups from './components/Popups'

import './App.css'
import './components/room/ChineseRoom.css'
import './components/desk/Desk.css'

function App() {

  const [level, setLevel] = useState({
    level: 0,
    xp: 0,
    prestige: 0,
    xpRequired: 100
  })

  const fetchAPI = async () => {
    const response = await axios.get("http://localhost:8080/test")
    console.log(response.data.test)
  }

  useEffect(() => {
    fetchAPI()
  }, [])

  return (
    <>
      <LevelContext value={[level, setLevel]}>
        <Popups />
        <ChineseRoom />
        <Desk />
      </LevelContext>

    </>
  )
}

export default App
