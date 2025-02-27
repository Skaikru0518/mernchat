import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
	const [username, setUsername] = useState(null);
	const [id, setId] = useState(null);

	useEffect(() => {
		axios
			.get("/profile", { withCredentials: true })
			.then((response) => {
				// console.log(response.data);
				setId(response.data.userId);
				setUsername(response.data.username);
			})
			.catch((err) => {
				console.error("Error fetching profiel: ", err);
			});
	}, []);

	return (
		<UserContext.Provider value={{ username, setUsername, id, setId }}>
			{children}
		</UserContext.Provider>
	);
}
