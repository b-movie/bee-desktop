import { useState, useEffect } from "react";

const Player = (props: { meta: Meta; torrent: Torrent }) => {
  const { meta, torrent } = props;

  return (
    <div
      className="w-[100vw] h-[100vh] bg-primary bg-center bg-cover fixed inset-0 z-10"
      style={{
        backgroundImage: meta?.backdropUrl
          ? `background-image:url(${meta.backdropUrl})`
          : "",
      }}
    >
      <div className="bg-primary bg-opacity-50 w-full h-full overflow-y-auto sticky top-0 z-20">
        <div className="m-auto">
          {torrent === null ? (
            <div className="mb-4 flex justify-center">Loading</div>
          ) : (
            <div className="text-base-100">
              <div className="text-xl">{meta.title}</div>
              <div className="m-4">
                <div className="text-sm">name: {torrent?.name}</div>
                <div className="text-sm">infoHash: {torrent?.infoHash}</div>
                <div className="text-sm">speed: {torrent?.speed}</div>
                <div className="text-sm">
                  files:{" "}
                  {(torrent?.files || []).map((file) => (
                    <p>{file}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Player;
