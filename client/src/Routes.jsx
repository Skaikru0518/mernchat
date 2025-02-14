import { useContext } from "react";
import RegisterAndLoginForm from "./Components/RegisterAndLoginForm";
import { UserContext } from "./Components/UserContext";
import Chat from "./Components/Chat";

export default function Routes() {
  const { username, id } = useContext(UserContext);

  if (username) {
    return <Chat />;
  }

  return <RegisterAndLoginForm />;
}
