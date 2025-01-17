import React from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TooltipItem, ChartData, ChartOptions } from 'chart.js'

// Registering Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface CoinPriceChartProps {
    priceData: { time: string; price: number }[] // Array of {time, price} objects
}

const CoinPriceChart: React.FC<CoinPriceChartProps> = ({ priceData }) => {
    const times = priceData.map((data) => data.time)
    const prices = priceData.map((data) => data.price)

    // Chart.js data configuration
    const data: ChartData<'line'> = {
        labels: times,
        datasets: [
            {
                data: prices,
                borderColor: '#42b1b1',
                backgroundColor: 'rgba(89, 233, 233, 0.2)',
                fill: true,
                tension: 0.4
            }
        ]
    }

    // Chart.js options configuration
    const options: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    title: function (context: TooltipItem<'line'>[]) {
                        return `$${context[0].raw}`
                    },
                    label: function () {
                        return ''
                    }
                }
            }
        },
        scales: { x: { grid: { display: false } }, y: { grid: { display: false } } }
    }

    return (
        <div className="p-2 bg-gray-800 rounded-lg mt-4 text-center">
            <h2 className="text-lg font-semibold text-gray-200">Price Chart</h2>
            <div>
                <Line data={data} options={options} />
            </div>
        </div>
    )
}

export default CoinPriceChart
