import { Writable } from 'stream';

class Writer extends Writable {
  constructor(Prefixy, tenant, options = { objectMode: true }) {
    super(options);
    this.Prefixy = Prefixy;
    this.tenant = tenant;
  }

  static logMemory(task) {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`${task} uses approximately
      ${Math.round(used * 100) / 100} MB`);
  }

  async _write(item, encoding, callback) {
    let result;

    console.log('Writing to redis, please wait...');
    Writer.logMemory('This import');

    this.Prefixy.insertCompletions([item], this.tenant)
      .then(() => callback())
      .catch(callback);
  }
}

export default Writer;
