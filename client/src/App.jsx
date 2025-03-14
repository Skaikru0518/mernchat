import React from "react";
import axios from "axios";
import Routes from "./Routes";
import { UserContextProvider } from "./Components/UserContext";

function App() {
  axios.defaults.baseURL = "http://localhost:4000";
  axios.defaults.withCredentials = true;
  return (
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
  );
}

export default App;
