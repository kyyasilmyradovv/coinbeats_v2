import AICard from '@/components/AICard'

export default function AI() {
    return (
        <div className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-2 ">
                <AICard />
            </div>
        </div>
    )
}
