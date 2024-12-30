import React from 'react'
import Lottie from 'react-lottie'
import bunnyAnimationData from '../animations/bunny.json' // Make sure you have a bunny animation .json file

const MaintenancePage: React.FC = () => {
    const bunnyAnimationOptions = {
        loop: true,
        autoplay: true,
        animationData: bunnyAnimationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    }

    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                backgroundColor: 'black',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div
                style={{
                    backgroundColor: '#222',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    color: 'white'
                }}
                className="m-10"
            >
                <div style={{ marginBottom: '20px' }}>
                    <Lottie options={bunnyAnimationOptions} height={150} width={150} />
                </div>
                <h2 style={{ marginBottom: '10px' }}>Coinbeats is under database maintenance!</h2>
                <p style={{ marginBottom: '20px' }}>Don't worry, we'll be back in few minutes.</p>
                <div style={{ fontSize: '50px', marginBottom: '10px' }}>⚠️</div>
            </div>
        </div>
    )
}

export default MaintenancePage
