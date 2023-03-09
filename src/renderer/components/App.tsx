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
  const [torrent, setTorrent] = useState<Torrent>(null);

  useEffect(() => {
    window.__BEE__.torrent.onStateUpdated((_: any, info: TorrentClientInfo, meta: Meta) => {
      setMeta(meta);
      const t = info.torrents.find(
        (_torrent) => _torrent.infoHash === meta.infoHash
      );
      setTorrent(t || info.torrents[0]);
    });
  });

  return <>{meta ? <Player meta={meta} torrent={torrent} /> : <Welcome />}</>;
};

export default App;
