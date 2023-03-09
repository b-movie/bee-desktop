import { useState, useEffect } from "react";
import Player from "./Player";

declare global {
  interface Window {
    __BEE__: any;
  }
}

const Welcome = () => {
  return (
    <div className="flex bg-primary w-[100vw] h-[100vh]">
      <a href="http://localhost:3000" className="m-auto btn btn-primary btn-lg">
        Start
      </a>
    </div>
  );
};

const App = () => {
  const [meta, setMeta] = useState<Meta>(null);

  useEffect(() => {
    window.__BEE__.store.get("playing").then((playing: Meta) => {
      setMeta(playing);
    });
  }, []);

  return <>{meta ? <Player meta={meta} /> : <Welcome />}</>;
};

export default App;
