'use client'
import { Leaderboard } from './components/leaderboard'
import { Summary } from './components/summary'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'

export default function Points() {
    const [activeTab, setActiveTab] = useState('leaderboard')

    return (
        <div className="container mx-auto pt-6 pb-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Points & Rewards</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList>
                    <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                    <TabsTrigger value="history">Your History</TabsTrigger>
                    <TabsTrigger value="rewards">Rewards</TabsTrigger>
                </TabsList>

                <TabsContent value="leaderboard" className="mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <Leaderboard />
                        </div>

                        <div>
                            <Summary />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <div className="bg-card p-6 rounded-lg border">
                        <h2 className="text-xl font-semibold mb-4">Points History</h2>
                        <p className="text-muted-foreground">Your points history will be displayed here.</p>
                    </div>
                </TabsContent>

                <TabsContent value="rewards">
                    <div className="bg-card p-6 rounded-lg border">
                        <h2 className="text-xl font-semibold mb-4">Available Rewards</h2>
                        <p className="text-muted-foreground">Rewards you can redeem with your points will be shown here.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
