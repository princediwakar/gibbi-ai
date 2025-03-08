export default function Loading() {
	return (
		<div className="max-w-4xl mx-auto p-4">
			<div className="animate-pulse space-y-4">
				<div className="h-8 bg-gray-200 rounded w-1/2"></div>
				<div className="h-4 bg-gray-200 rounded w-1/4"></div>
				<div className="space-y-2">
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							className="h-12 bg-gray-200 rounded"
						></div>
					))}
				</div>
			</div>
		</div>
	);
}
