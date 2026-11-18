import React from "react";
import { Composition, Folder, Still } from "remotion";
import { GTA6Video } from "./Video";
import { Thumbnail } from "./Thumbnail";
import { TL } from "./timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GTA6"
        component={GTA6Video}
        durationInFrames={TL.total}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ captions: true, audio: true }}
      />
      <Folder name="Extras">
        <Still id="Miniatura" component={Thumbnail} width={1280} height={720} />
      </Folder>
    </>
  );
};
