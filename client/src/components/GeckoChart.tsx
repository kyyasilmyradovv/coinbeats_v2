import axios from 'axios'
import React, { useEffect } from 'react'

interface Props {
    coinId: string
}

const GeckoChart: React.FC<Props> = ({ coinId }) => {
    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://widgets.coingecko.com/gecko-coin-price-chart-widget.js'
        script.async = true
        document.body.appendChild(script)

        // Cleanup script on component unmount
        return () => {
            document.body.removeChild(script)
        }
    }, [])

    const fetchDays = async () => {
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`, {
            params: {
                vs_currency: 'usd',
                days: 7
            }
        })
        console.log(response.data.prices)
        return response.data.prices
    }

    fetchDays()

    return (
        <div>
            <gecko-coin-price-chart-widget locale="en" dark-mode="true" outlined="true" coin-id={coinId} initial-currency="usd"></gecko-coin-price-chart-widget>
        </div>
    )
}

export default GeckoChart
