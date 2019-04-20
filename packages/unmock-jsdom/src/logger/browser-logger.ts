import { ILogger } from "unmock-core";

export default class BrowserLogger implements ILogger {
  public log(message: string) {
    // tslint:disable-next-line:no-console
    console.log(message);
  }
}
