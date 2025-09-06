import { useState } from 'react'

import ChineseRoom from './components/ChineseRoom'
import Desk from './components/Desk'
import Popups from './components/Popups'

import './App.css'
import './components/ChineseRoom.css'
import './components/Desk.css'

function App() {


  return (
    <>
      <Popups />
      <ChineseRoom />
      <Desk />

    </>
  )
}

export default App
