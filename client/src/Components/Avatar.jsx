function Avatar({ userId, username }) {
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
		<div
			className={`w-8 h-8 ${color} rounded-full flex items-center justify-center`}
		>
			<div className="text-center w-full opacity-70">{username[0]}</div>
		</div>
	);
}
export default Avatar;
