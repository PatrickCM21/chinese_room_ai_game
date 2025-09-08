import { useState, useEffect } from 'react'
import { LevelContext } from './components/Context'

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
