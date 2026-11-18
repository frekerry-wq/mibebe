import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { TL, Beat } from "./timeline";
import { ViceBackground } from "./components/Background";
import { Captions, ChapterCard, EndCard, FilmOverlay, Hud, TitleSequence } from "./components/Chrome";
import { BeatProps } from "./beats/common";
import { Breaking, Neon, Postcard, Quote, Slam, Speed, Statement, Year } from "./beats/Text";
import { Bars, Countdown, NumberBeat, Platforms, Prices, Score, Sentiment, Storage, Versus, Views, Years } from "./beats/Numbers";
import { Cast, List, Poll, Subscribe } from "./beats/Lists";
import { Calendar, Comments, Conspiracy, DateCross, DevBuild, Duo, Hacker, LeonidaMap, Money, Mugshot, Phone, Player, Song, Stock, Terminal, Wanted } from "./beats/Story";

const REGISTRY: Record<string, React.FC<BeatProps>> = {
  slam: Slam, year: Year, speed: Speed, neon: Neon, postcard: Postcard, quote: Quote, statement: Statement, breaking: Breaking,
  number: NumberBeat, score: Score, versus: Versus, sentiment: Sentiment, views: Views, countdown: Countdown, years: Years,
  bars: Bars, prices: Prices, platforms: Platforms, storage: Storage,
  list: List, cast: Cast, poll: Poll, subscribe: Subscribe,
  terminal: Terminal, devbuild: DevBuild, stock: Stock, hacker: Hacker, comments: Comments, phone: Phone, player: Player,
  calendar: Calendar, datecross: DateCross, song: Song, money: Money, map: LeonidaMap, duo: Duo, mugshot: Mugshot,
  wanted: Wanted, conspiracy: Conspiracy,
};

/** Envoltorio de cada "beat": entrada rápida, empuje de cámara lento y salida */
const BeatLayer: React.FC<{ beat: Beat }> = ({ beat }) => {
  const frame = useCurrentFrame();
  const Comp = REGISTRY[beat.type];
  if (!Comp) return null;
  const out = interpolate(frame, [beat.dur - 6, beat.dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const push = interpolate(frame, [0, beat.dur], [1, 1.035]);
  return (
    <AbsoluteFill style={{ opacity: out, scale: `${push}` }}>
      <Comp p={beat.props} dur={beat.dur} from={beat.from} />
    </AbsoluteFill>
  );
};

const SegmentBg: React.FC<{ variant: string }> = ({ variant }) => <ViceBackground variant={variant} />;

export const GTA6Video: React.FC<{ captions: boolean; audio: boolean }> = ({ captions, audio }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0418" }}>
      {TL.segments.map((s) => {
        const visFrom = s.cardFrom !== null ? s.cardFrom + s.cardDur : 0;
        return (
          <React.Fragment key={s.id}>
            <Sequence from={visFrom} durationInFrames={s.end - visFrom} name={`${s.id} · fondo`}>
              <SegmentBg variant={s.bg} />
            </Sequence>
            {s.beats.map((b, i) => (
              <Sequence key={i} from={b.from} durationInFrames={b.dur} name={`${s.id} · ${b.type}`}>
                <BeatLayer beat={b} />
              </Sequence>
            ))}
            {s.cardFrom !== null && (
              <Sequence from={s.cardFrom} durationInFrames={s.cardDur} name={`${s.id} · tarjeta`}>
                <ChapterCard chapter={s.chapter} title={s.title} dur={s.cardDur} variant={s.bg} />
              </Sequence>
            )}
          </React.Fragment>
        );
      })}
      <Sequence from={TL.title.from} durationInFrames={TL.title.dur} name="Título">
        <TitleSequence dur={TL.title.dur} />
      </Sequence>
      <Sequence from={TL.endcard.from} durationInFrames={TL.endcard.dur} name="Pantalla final">
        <EndCard dur={TL.endcard.dur} />
      </Sequence>
      <Hud />
      {captions && <Captions />}
      <FilmOverlay />
      {audio && <Audio src={staticFile("audio/master.wav")} />}
    </AbsoluteFill>
  );
};
