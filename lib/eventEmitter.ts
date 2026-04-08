import { EventEmitter } from "events";

const globalForEmitter = global as unknown as { emitter: EventEmitter };

export const emitter = globalForEmitter.emitter || new EventEmitter();

if (process.env.NODE_ENV !== "production") {
  globalForEmitter.emitter = emitter;
}

// Increase max listeners to prevent memory leak warnings if many connections exist
emitter.setMaxListeners(100);
