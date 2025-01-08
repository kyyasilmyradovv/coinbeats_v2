// client/src/components/common/NoDataFound.tsx
import React from 'react'
import bunnyIcon from '../../images/bunny-head.png'

const NoDataFoundComponent: React.FC = () => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '300px',
                background: 'linear-gradient(135deg, #2b2b5e, #0d0d1c)',
                borderRadius: '12px',
                marginTop: '24px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.118)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
        >
            <img src={bunnyIcon} className="h-18 mb-4" alt="No data" />
            <h3
                style={{
                    fontSize: '20px',
                    fontWeight: 'bold'
                }}
            >
                No Data Found
            </h3>
            <p>Try adjusting your search or refreshing the page.</p>
        </div>
    )
}

export default NoDataFoundComponent
