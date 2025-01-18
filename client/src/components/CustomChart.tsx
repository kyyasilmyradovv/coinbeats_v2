import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import Chart, { ChartOptions, TooltipItem, ChartData, ActiveDataPoint } from 'chart.js/auto'
import axios from 'axios'

interface ActiveElement {
    element: {
        x: number
    }
}

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

const formatPrice = (number: number | null): string => {
    if (number == null) return 'N/A'
    if (number >= 1_000_000_000) {
        return '$' + (number / 1_000_000_000).toFixed(1) + 'B'
    } else if (number >= 1_000_000) {
        return '$' + (number / 1_000_000).toFixed(1) + 'M'
    } else if (number >= 1_000) {
        return '$' + (number / 1_000).toFixed(1) + 'K'
    }
    return '$' + number.toFixed(2)
}

function formatNumber(value: number): string {
    if (isNaN(value)) return ''

    const [integerPart, decimalPart] = value.toString().split('.')
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger
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
    const [chartData, setChartData] = useState<ChartData<'line'> | null>(null)
    const [hoverPosition, setHoverPosition] = useState<number | null>(null)

    useEffect(() => {
        const loadChartData = async () => {
            const days = tabConfig[tab]
            const interval = getIntervalForDays(days)
            const data = await fetchHistoricalData(coinId, days, interval)

            setChartData({
                labels: data.map(([timestamp]: [number]) => new Date(timestamp).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' })),
                datasets: [
                    {
                        label: `${coinId} Price`,
                        data: data.map(([, price]: [number, number]) => price),
                        fill: true,
                        borderColor: '#42b1b1',
                        backgroundColor: 'rgba(89, 233, 233, 0.2)',
                        tension: 0.4
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
                mode: 'index',
                intersect: false,
                callbacks: {
                    title: function (context: TooltipItem<'line'>[]) {
                        const labelIndex = context[0].dataIndex
                        const date = chartData?.labels?.[labelIndex]
                        const price = context[0].raw
                        return `Date: ${date}\nPrice: ${formatNumber(price as number)}`
                    },
                    label: function () {
                        return ''
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest',
            intersect: false
        },
        scales: {
            y: {
                ticks: {
                    callback: function (value) {
                        return formatPrice(value as number)
                    }
                }
            },
            x: { ticks: { maxTicksLimit: 10 } }
        },
        // Track hover position
        onHover: (event, elements) => {
            if (elements && elements.length > 0) {
                const { x } = elements[0].element
                setHoverPosition(x)
            } else {
                setHoverPosition(null)
            }
        }
    }

    // Custom plugin for vertical ruler
    const plugins = [
        {
            id: 'verticalLine',
            afterDatasetsDraw: (chart: Chart) => {
                const ctx = chart.ctx
                const activePoint = chart.tooltip

                // If hoverPosition is set, draw the vertical line at the x position
                if (activePoint?.caretX !== undefined) {
                    const x = activePoint.caretX
                    const topY = chart.scales.y.top
                    const bottomY = chart.scales.y.bottom

                    ctx.save()
                    ctx.beginPath()
                    ctx.moveTo(x, topY)
                    ctx.lineTo(x, bottomY)
                    ctx.lineWidth = 1
                    ctx.setLineDash([3, 3])
                    ctx.strokeStyle = '#808080'
                    ctx.stroke()
                    ctx.restore()

                    const y = activePoint.caretY
                    const radius = 10 // Circle radius for attention
                    const circleColor = 'rgba(255, 215, 0, 0.6)'

                    ctx.save()
                    ctx.beginPath()
                    ctx.arc(x, y, radius, 0, Math.PI * 2)
                    ctx.fillStyle = circleColor
                    ctx.fill()
                    ctx.restore()
                }
            }
        }
    ]

    return chartData ? <Line data={chartData} options={options} plugins={plugins} /> : <p>Loading chart...</p>
}

export default CustomChart
