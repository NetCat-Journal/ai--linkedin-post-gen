function SkeletonCard() {
    return (
        <div className="p-4">
            <div className="rounded-sm bg-gray-200 p-8 flex flex-col justify-between items-start">
                <div className="mb-4 h-8 w-8 bg-gray-400 animate-pulse"></div>
                <div className="space-y-3 mb-6 flex-1 w-full">
                    <div className="animate-pulse bg-gray-400 h-3 w-full rounded-md" />
                    <div className="animate-pulse bg-gray-400 h-3 w-full rounded-md" />
                    <div className="animate-pulse bg-gray-400 h-3 w-11/12 rounded-md" />
                    <div className="animate-pulse bg-gray-400 h-3 w-full rounded-md" />
                    <div className="animate-pulse bg-gray-400 h-3 w-10/12 rounded-md" />
                    <div className="animate-pulse bg-gray-400 h-3 w-full rounded-md" />
                    <div className="animate-pulse bg-gray-400 h-3 w-9/12 rounded-md" />
                    <div className="animate-pulse bg-gray-400 h-3 w-full rounded-md" />
                    <div className="animate-pulse bg-gray-400 h-3 w-8/12 rounded-md" />
                </div>
                <div className="mb-4 h-8 w-8 bg-gray-400 animate-pulse"></div>
            </div>
        </div>
    );
}

export default SkeletonCard;