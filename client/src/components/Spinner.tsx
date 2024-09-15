// client/src/components/Spinner.tsx

import React from 'react'
import './Spinner.css' // We will define the styles in Spinner.css

const Spinner: React.FC = () => {
    return (
        <div className="spinner-container">
            {' '}
            {/* Added the container class */}
            <div className="spinner">
                <svg>
                    <use href="src/images/spinner.svg#icon-loader"></use>
                </svg>
            </div>
        </div>
    )
}

export default Spinner
