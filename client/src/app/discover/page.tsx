'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Educators from './educators'
import Podcasts from './podcasts'
import { cn } from '@/lib/utils'
import Channels from './channel'
import Tutorials from './tutorial'

function TabsSection() {
    return (
        <Tabs defaultValue="educators" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
                {[
                    { value: 'educators', label: 'Educators' },
                    { value: 'podcasts', label: 'Podcasts' },
                    { value: 'ytbChannels', label: 'Youtube Channels' },
                    // { value: 'tgGroups', label: 'TG Groups' },
                    { value: 'tutorials', label: 'Tutorials' },
                    { value: 'AI', label: 'AI' }
                ].map(({ value, label }) => (
                    <TabsTrigger
                        key={value}
                        value={value}
                        className={cn(
                            'transition-colors',
                            'data-[state=active]:bg-gradient-to-r',
                            'data-[state=active]:from-purple-500',
                            'data-[state=active]:via-pink-500',
                            'data-[state=active]:to-red-500',
                            'data-[state=active]:text-white'
                        )}
                    >
                        {label}
                    </TabsTrigger>
                ))}
            </TabsList>

            <TabsContent value="educators">
                <Educators />
            </TabsContent>
            <TabsContent value="podcasts">
                <Podcasts />
            </TabsContent>
            <TabsContent value="ytbChannels">
                <Channels />
            </TabsContent>
            {/* <TabsContent value="tgGroups"></TabsContent> */}
            <TabsContent value="tutorials">
                <Tutorials />
            </TabsContent>
            <TabsContent value="AI"></TabsContent>
        </Tabs>
    )
}

export default function Discover() {
    return (
        <div className="container mx-auto pt-4 pb-4 px-4">
            <TabsSection />
        </div>
    )
}
