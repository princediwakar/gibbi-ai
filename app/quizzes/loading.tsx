export default function Loading() {
	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">
				Public Quizzes
			</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={i}
						className="border rounded-lg p-6"
					>
						<div className="animate-pulse">
							<div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
							<div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
							<div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
							<div className="h-10 bg-gray-200 rounded"></div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
