import pino from "pino";

// NOTE: transport is undefined, because pino-pretty does not work.
// NOTE: pino-pretty does not work with next, because it cannot spawn workers in .next dirs
// NOTE: when transport is undefined, it writes to stdout in json

export const logger = pino({
  level: "info",
  transport: undefined
});
