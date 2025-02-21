import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";
import bcrypt from "bcryptjs";
import * as ws from "ws";
import { UserModel } from "./models/User.js";
import { MessageModel } from "./models/Message.js";
import jsonwebtoken from "jsonwebtoken";
import { fileURLToPath } from "url";
import path from "path";

//imports from .env and app settings
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
	cors({
		credentials: true,
		origin: process.env.CLIENT_URL,
	})
);
app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static(__dirname + "/uploads"));

const User = UserModel;
const Message = MessageModel;
const jwt = jsonwebtoken;
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

mongoose
	.connect(process.env.MONGO_URL)
	.then(() => console.log("Connected to DB"))
	.catch((err) => console.log("DB error", err));

async function getUserDataFromRequest(req) {
	return new Promise((resolve, reject) => {
		const token = req.cookies?.token;
		if (token) {
			jwt.verify(token, jwtSecret, {}, (err, userData) => {
				if (err) throw err;
				resolve(userData);
			});
		} else {
			reject("No Token in promise");
		}
	});
}

app.get("/test", (req, res) => {
	res.json({ message: "test ok" });
});

app.get("/messages/:userId", async (req, res) => {
	const { userId } = req.params;
	const userData = await getUserDataFromRequest(req);
	const ourUserId = userData.userId;
	const messages = await Message.find({
		sender: { $in: [userId, ourUserId] },
		recipient: { $in: [userId, ourUserId] },
	}).sort({ createdAt: 1 });
	res.json(messages);
});

app.get("/profile", (req, res) => {
	const token = req.cookies?.token;

	if (!token) {
		return res.status(401).json({ error: "No token provided" }); // ✅ Handle missing token
	}

	jwt.verify(token, jwtSecret, {}, (err, userData) => {
		if (err) {
			return res.status(401).json({ error: "Invalid token" }); // ✅ Handle token errors properly
		}

		res.json({ userId: userData.userId, username: userData.username }); // ✅ Send expected user data
	});
});

app.get("/people", async (req, res) => {
	const users = await UserModel.find({}, { _id: 1, username: 1 });
	res.json(users);
});

app.post("/register", async (req, res) => {
	const { username, password } = req.body;
	try {
		const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
		const createdUser = await User.create({
			username: username,
			password: hashedPassword,
		});
		jwt.sign(
			{ userId: createdUser._id, username },
			jwtSecret,
			{},
			(err, token) => {
				if (err) throw err;
				res
					.cookie("token", token, { sameSite: "none", secure: true })
					.status(201)
					.json({
						_id: createdUser._id,
					});
			}
		);
	} catch (error) {
		if (error) throw error;
		res.status(500).json("error");
	}
});

app.post("/login", async (req, res) => {
	const { username, password } = req.body;
	const foundUser = await User.findOne({ username });

	if (!foundUser) {
		return res.status(401).json({ error: "User not found" });
	}
	const passOk = bcrypt.compareSync(password, foundUser.password);

	if (!passOk) {
		return res.status(401).json({ error: "Incorrect password" });
	}

	jwt.sign(
		{ userId: foundUser._id, username },
		jwtSecret,
		// { expiresIn: "1d" }, // 🔥 Token expires in 1 day
		(err, token) => {
			if (err) {
				return res.status(500).json({ error: "Error signing token" });
			}

			// 🛠 Set the token as a secure cookie
			res.cookie("token", token, { sameSite: "none", secure: true }).json({
				id: foundUser._id,
				message: "Login successful",
				token,
			});
		}
	);
});

app.post("/logout", (req, res) => {
	res.cookie("token", "", { sameSite: "none", secure: true }).json("ok");
});

const server = app.listen(PORT, () => {
	console.log(`Server is running on: https://localhost:${PORT}`);
});

// WebSocket Server
const wss = new ws.WebSocketServer({ server });

wss.on("connection", (connection, req) => {
	console.log("wss command recieved");

	function notifyAboutOnlinePeople() {
		[...wss.clients].forEach((client) => {
			client.send(
				JSON.stringify({
					online: [...wss.clients].map((c) => ({
						userId: c.userId,
						username: c.username,
					})),
				})
			);
		});
	}

	connection.isAlive = true;

	connection.timer = setInterval(() => {
		connection.ping();
		connection.deathTimer = setTimeout(() => {
			connection.isAlive = false;
			clearInterval(connection.timer);
			connection.terminate();
			notifyAboutOnlinePeople();
			console.log("dead");
		}, 1000);
	}, 5000);

	connection.on("pong", () => {
		clearTimeout(connection.deathTimer);
	});

	// read username an did from the cookie for this connection
	const cookies = req.headers.cookie;
	if (cookies) {
		const tokenCookieString = cookies
			.split(";")
			.find((str) => str.startsWith("token="));
		if (tokenCookieString) {
			const token = tokenCookieString.split("=")[1];
			if (token) {
				jwt.verify(token, jwtSecret, {}, (err, userData) => {
					if (err) throw err;
					//console.log(userData);
					const { userId, username } = userData;
					connection.userId = userId;
					connection.username = username;
				});
			}
		} else {
			console.log("Token not found");
		}
	} else {
		console.log("Cookie not found");
	}

	connection.on("message", async (message) => {
		const messageData = JSON.parse(message.toString());
		const { recipient, text, file } = messageData;
		let filename = null;
		if (file) {
			console.log("size", file.data.length);
			const parts = file.name.split(".");
			const ext = parts[parts.length - 1];
			filename = Date.now() + "." + ext;
			const filePath = path.join(__dirname, "uploads", filename);
			const bufferData = new Buffer(file.data.split(",")[1], "base64");
			fs.writeFile(filePath, bufferData, () => {
				console.log("file saved:" + filePath);
			});
		}
		if (recipient && (text || file)) {
			const messageDoc = await Message.create({
				sender: connection.userId,
				recipient,
				text,
				file: file ? filename : null,
			});
			console.log("created message");
			[...wss.clients]
				.filter((c) => c.userId === recipient)
				.forEach((c) =>
					c.send(
						JSON.stringify({
							text,
							sender: connection.userId,
							recipient,
							file: file ? filename : null,
							_id: messageDoc._id,
						})
					)
				);
		}
	});

	// notify everyone about online people (when someone connects)
	//console.log([...wss.clients].map((c) => c.username));
	notifyAboutOnlinePeople();
});

wss.on("close", (data) => {
	console.log("disconnected", data);
});
