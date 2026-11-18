import data from "./timeline.json";

export type Word = { w: string; from: number; to: number };
export type Beat = { type: string; from: number; dur: number; props: Record<string, any> };
export type Segment = {
  id: string;
  chapter: string;
  title: string;
  bg: string;
  from: number;
  cardFrom: number | null;
  cardDur: number;
  voFrom: number;
  voFrames: number;
  end: number;
  beats: Beat[];
};
export type Caption = { from: number; to: number; words: Word[] };
export type Timeline = {
  fps: number;
  total: number;
  segments: Segment[];
  captions: Caption[];
  title: { from: number; dur: number };
  endcard: { from: number; dur: number };
  chapters: { title: string; frame: number }[];
};

export const TL = data as unknown as Timeline;
