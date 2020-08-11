import { EventEmitter } from "events";
import IO from "socket.io";

enum EventType {
 BLOCK_ADDED = "BLOCK_ADDED",
 BLOCK_MINED = "BLOCK_MINED"
}

export class PeerToPeer extends EventEmitter {
 io: IO.Server;

 constructor(io: IO.Server) {
  super();
  this.io = io;
  this.watchEvents();
  this.listenToIO();
 }

 private watchEvents() {
  this.on(EventType.BLOCK_MINED, (data: any) => this.broadcast(EventType.BLOCK_MINED, data));
  this.on(EventType.BLOCK_ADDED, (data: any) => this.broadcast(EventType.BLOCK_ADDED, data));
 }

 private listenToIO() {
  this.io.on("connection", (socket) => {
   console.log("Socket ID: ", socket.id);
  });
 }

 private broadcast(event: string, data: any): void {
  console.log("----Emitting Event----: ", event);
  this.io.emit(event, data);
  console.log("----Event Emitted----: ", event);
 }

 public gossip(event: EventType, data: any): boolean {
  return this.emit(event, data);
 }
}