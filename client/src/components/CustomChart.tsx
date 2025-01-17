import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { ChartOptions, TooltipItem } from 'chart.js/auto'
import axios from 'axios'

const fetchHistoricalData = async (coinId: string, days: number, interval: string) => {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`, {
        params: {
            vs_currency: 'usd',
            days: days,
            interval: interval
        }
    })
    return response.data.prices
}

const getIntervalForDays = (days: number): string => {
    if (days <= 1) return 'hourly'
    if (days <= 7) return 'daily'
    if (days <= 30) return 'daily'
    if (days <= 90) return 'daily'
    return 'monthly'
}

interface CustomChartProps {
    coinId: string
    tab: string
}

const tabConfig: { [key: string]: number } = {
    '24H': 1,
    '7D': 7,
    '1M': 30,
    '3M': 90,
    '1Y': 365
}

const CustomChart: React.FC<CustomChartProps> = ({ coinId, tab }) => {
    const [chartData, setChartData] = useState<any>(null)

    useEffect(() => {
        const loadChartData = async () => {
            const days = tabConfig[tab]
            const interval = getIntervalForDays(days)
            const data = await fetchHistoricalData(coinId, days, interval)

            setChartData({
                labels: data.map(([timestamp]: [number]) => new Date(timestamp).toLocaleDateString()),
                datasets: [
                    {
                        label: `${coinId} Price`,
                        data: data.map(([, price]: [number, number]) => price),
                        fill: true,
                        borderColor: '#42b1b1',
                        backgroundColor: 'rgba(89, 233, 233, 0.2)'
                    }
                ]
            })
        }

        loadChartData()
    }, [coinId, tab])

    const options: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    title: function (context: TooltipItem<'line'>[]) {
                        const labelIndex = context[0].dataIndex
                        const date = chartData.labels[labelIndex]
                        const price = context[0].raw
                        return `Date: ${date}\nPrice: $${price}`
                    },
                    label: function () {
                        return ''
                    }
                }
            }
        }
    }

    return chartData ? <Line data={chartData} options={options} /> : <p>Loading chart...</p>
}

export default CustomChart
