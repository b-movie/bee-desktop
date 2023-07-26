export default class GenericPlayer {
  public config: PlayerConfig;

  constructor(config: PlayerConfig) {
    this.config = config;
  }

  play(params: MediaParams) {}

  pause() {}

  resume() {}

  stop() {}

  currentStatus() {}
}
