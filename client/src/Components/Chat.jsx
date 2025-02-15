import React, { useContext, useEffect, useRef, useState } from "react";
import Avatar from "./Avatar.jsx";
import Logo from "./Logo.jsx";
import { UserContext } from "./UserContext.jsx";
import { uniqBy } from "lodash";
import axios from "axios";

function Chat() {
	const [ws, setWs] = useState(null);
	const [onlinePeople, setOnlinePeople] = useState({});
	const [selectedUserId, setSelectedUserId] = useState(null);
	const { username, id } = useContext(UserContext);
	const [newMessageText, setNewMessageText] = useState("");
	const [messages, setMessages] = useState([]);
	const divUnderMessages = useRef(null);

	useEffect(() => {
		ConnectToWs();
	}, []);

	function ConnectToWs() {
		const ws = new WebSocket("ws://localhost:4000");
		setWs(ws);
		ws.addEventListener("message", handleMessage);
		ws.addEventListener("close", () => {
			setTimeout(() => {
				console.log("Disconnected. Trying to reconnect");
				ConnectToWs();
			}, 1000);
		});
	}

	function showOnlinePeople(peopleArray) {
		const people = {};
		peopleArray.forEach(({ userId, username }) => {
			people[userId] = username;
		});
		setOnlinePeople(people);
		// console.log(people);
	}

	function handleMessage(ev) {
		const messageData = JSON.parse(ev.data);
		// console.log({ ev, messageData });
		if ("online" in messageData) {
			showOnlinePeople(messageData.online);
		} else if ("text" in messageData) {
			// console.log({ messageData });
			setMessages((prev) => [...prev, { ...messageData }]);
		}
	}
	const onlinePeopleExcludingOurUser = { ...onlinePeople };
	delete onlinePeopleExcludingOurUser[id];

	function sendMessage(ev) {
		ev.preventDefault();
		ws.send(
			JSON.stringify({
				recipient: selectedUserId,
				text: newMessageText,
			})
		);
		setNewMessageText("");

		setMessages((prev) => [
			...prev,
			{
				text: newMessageText,
				sender: id,
				recipient: selectedUserId,
				id: Date.now(),
			},
		]);
	}

	useEffect(() => {
		const div = divUnderMessages.current;
		if (div) {
			// console.log(div);
			div.scrollIntoView({ behavior: "smooth", block: "end" });
		}
	}, [messages]);

	useEffect(() => {
		if (selectedUserId) {
			axios.get("/messages/" + selectedUserId);
		}
	}, [selectedUserId]);

	const messagesWithoutDupes = uniqBy(messages, "id");

	return (
		<div className="flex h-screen">
			<div className="bg-white w-1/3">
				<Logo />
				<div className="text-blue-600 font-bold border text-center py-2">
					<div>Welcome, {username}!</div>
				</div>
				{Object.keys(onlinePeopleExcludingOurUser).map((userId) => (
					<div
						key={userId}
						onClick={() => setSelectedUserId(userId)}
						className={
							"border-b border-gray-100  flex items-center gap-2 cursor-pointer" +
							(userId === selectedUserId ? " bg-blue-50" : "")
						}
					>
						{userId === selectedUserId && (
							<div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
						)}
						<div className="flex gap-2 items-center py-2 pl-4">
							<Avatar username={onlinePeople[userId]} userId={userId} />
							<span className="text-gray-800">{onlinePeople[userId]}</span>
						</div>
					</div>
				))}
			</div>
			<div className="bg-blue-200 w-2/3 p-2 flex flex-col">
				<div className="flex-grow">
					{!selectedUserId && (
						<div className="flex h-full items-center justify-center">
							<div className="text-gray-500">
								&larr; Select a person from the sidebar
							</div>
						</div>
					)}
					{!!selectedUserId && (
						<div className="relative h-full pb-4">
							<div className="overflow-y-auto absolute top-0 left-0 right-0 bottom-2">
								{messagesWithoutDupes.map((message) => (
									<div
										className={
											message.sender === id ? "text-right" : "text-left"
										}
									>
										<div
											className={
												"text-left inline-block p-2 my-2 rounded-md text-sm  " +
												(message.sender === id
													? "bg-blue-500 text-white"
													: "bg-white text-gray-500")
											}
										>
											sender: {message.sender} <br />
											my id is: {id} <br />
											{message.text}
										</div>
									</div>
								))}
								<div ref={divUnderMessages}></div>
							</div>
						</div>
					)}
				</div>
				{!!selectedUserId && (
					<form className="flex gap-2" onSubmit={sendMessage}>
						<input
							type="text"
							onChange={(ev) => setNewMessageText(ev.target.value)}
							value={newMessageText}
							className="bg-white flex-grow border p-2 rounded-md"
							placeholder="Type your message here"
						/>
						<button
							className="bg-blue-500 p-2 text-white rounded-md"
							type="submit"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="size-6"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
								/>
							</svg>
						</button>
					</form>
				)}
			</div>
		</div>
	);
}

export default Chat;
