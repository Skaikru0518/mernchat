function Avatar({ userId, username, online }) {
	const colors = [
		"bg-red-200",
		"bg-green-200",
		"bg-purple-200",
		"bg-blue-200",
		"bg-yellow-200",
		"bg-teal-200",
	];

	// Generate a consistent hash from userId
	const hash = [...userId].reduce((acc, char) => acc + char.charCodeAt(0), 0);
	const colorIndex = hash % colors.length;
	const color = colors[colorIndex];

	return (
		<div className={`w-8 h-8 ${color} relative rounded-full flex items-center`}>
			<div className="text-center w-full opacity-70">{username[0]}</div>

			{online && (
				<div className="absolute w-3 h-3 bg-green-500 bottom-0 right-0 rounded-full border border-white"></div>
			)}
			{!online && (
				<div className="absolute w-3 h-3 bg-gray-500 bottom-0 right-0 rounded-full border border-white"></div>
			)}
		</div>
	);
}
export default Avatar;
