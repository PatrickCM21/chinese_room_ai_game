import { useState, createContext } from 'react'
import { LevelContext } from './components/Context'

import ChineseRoom from './components/ChineseRoom'
import Desk from './components/Desk'
import Popups from './components/Popups'

import './App.css'
import './components/ChineseRoom.css'
import './components/Desk.css'

function App() {

  const [level, setLevel] = useState({
    level: 0,
    xp: 0,
    prestige: 0,
    xpRequired: 100
  })

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
