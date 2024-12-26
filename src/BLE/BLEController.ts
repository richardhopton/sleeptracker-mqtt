import { IDeviceData } from '@ha/IDeviceData';
import { Dictionary } from '@utils/Dictionary';
import { Timer } from '@utils/Timer';
import { loopWithWait } from '@utils/loopWithWait';
import { IBLEDevice } from 'ESPHome/types/IBLEDevice';
import EventEmitter from 'events';
import { IController } from '../Common/IController';
import { IEventSource } from '../Common/IEventSource';

export class BLEController<TCommand> extends EventEmitter implements IEventSource, IController<TCommand> {
  cache: Dictionary<Object> = {};
  get notifyNames() {
    return Object.keys(this.notifyHandles);
  }
  private timer?: Timer = undefined;

  constructor(
    public deviceData: IDeviceData,
    private bleDevice: IBLEDevice,
    private handle: number,
    private commandBuilder: (command: TCommand) => number[],
    private notifyHandles: Dictionary<number> = {},
    private stayConnected?: boolean
  ) {
    super();
    this.stayConnected ||= notifyHandles.length > 0;
    Object.entries(notifyHandles).map(([key, handle]) => {
      void this.bleDevice.subscribeToCharacteristic(handle, (data) => {
        this.emit(key, data);
      });
    });
  }

  writeCommand = (command: TCommand, duration?: number, frequency?: number) =>
    this.writeCommands([command], duration, frequency);

  writeCommands = async (commands: TCommand[], duration?: number, frequency?: number) => {
    const commandList = commands.map(this.commandBuilder).filter((command) => command.length > 0);
    if (commandList.length === 0) return;
    await this.timer?.cancel();
    await this.bleDevice.connect();
    this.timer = new Timer(
      async () =>
        await loopWithWait(commandList, (command) =>
          this.bleDevice.writeCharacteristic(this.handle, new Uint8Array(command))
        ),
      duration,
      frequency,
      async () => {
        if (this.stayConnected) await this.bleDevice.disconnect();
        this.timer = undefined;
      }
    );
    await this.timer.done;
  };

  cancelCommands = async () => {
    await this.timer?.cancel();
  };
}
