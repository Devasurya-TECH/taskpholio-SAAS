import { useEffect } from "react";
import api from "../lib/api";

export default function Home() {
  useEffect(() => {
    api.get("/")
      .then(res => console.log(res.data))
      .catch(err => console.log(err));
  }, []);

  return <h1>🚀 Taskpholio Connected</h1>;
}

