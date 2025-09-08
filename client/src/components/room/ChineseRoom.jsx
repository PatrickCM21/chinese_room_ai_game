import { useContext, useEffect } from 'react'
import { LevelContext } from '../Context'

export default function ChineseRoom() {

    const [levelData, setLevel] = useContext(LevelContext)
    const { level, prestige, xp, xpRequired } = levelData
    
    const levelProgress = (xp / xpRequired) * 100;

    const levelProgressStyle = {
        width: `${levelProgress}%`,
        height: '100%',
    }

    useEffect(() => {
        if (xp >= xpRequired) {
            executeLevelUp()
        }
    }, [xp])

    function getNewXpRequired(newLevel) {
        return 100
    }

    function executeLevelUp() {
        setLevel(prev => {
            return {
                ...prev,
                level: prev.level + 1,
                xp: prev.xp - prev.xpRequired,
                xpRequired: getNewXpRequired(prev.level + 1)
            }
        })

        // story stuff goes here
    }

    return (
        <section id='chinese-room'>
            <div className='level-data'>
                <div className='level-number'>
                    <span>Level {level}</span>
                </div>
                <div className='level-bar'>
                    <div className='level-progress' style={levelProgressStyle}>

                    </div>
                </div>
            </div>
            <div className="house">

                <div className="chinese-writer">

                </div>
            </div>

        </section>
    )
}