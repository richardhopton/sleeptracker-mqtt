import { IDeviceData } from '@ha/IDeviceData';
import { Entity } from '@ha/base/Entity';
import { Dictionary } from '@utils/Dictionary';
import { Timer } from '@utils/Timer';
import { loopWithWait } from '@utils/loopWithWait';
import { IController } from 'Common/IController';
import { Socket, createSocket } from 'dgram';
import EventEmitter from 'events';

export class Controller extends EventEmitter implements IController<number[]> {
  cache: Dictionary<Entity> = {};
  socket: Socket;
  private timer?: Timer = undefined;

  constructor(public deviceData: IDeviceData, public name: string, public ipAddress: string) {
    super();
    this.socket = createSocket('udp4');
  }

  writeCommand = (command: number[]) =>
    new Promise<void>((res, rej) => {
      const onMessage = (message: Buffer) => {
        this.socket.off('message', onMessage);
        if (message.toString().startsWith('ACK')) res();
      };
      this.socket.on('message', onMessage);
      this.socket.send(new Uint8Array(command), 50007, this.ipAddress, (err) => {
        if (err) rej(err);
      });
    });

  writeCommands = async (commands: number[][], duration?: number, frequency?: number) => {
    await this.timer?.cancel();

    this.timer = new Timer(
      async () => await loopWithWait(commands, (command) => this.writeCommand(command)),
      duration,
      frequency,
      () => (this.timer = undefined)
    );
  };

  cancelCommands = async () => {
    await this.timer?.cancel();
  };
}
