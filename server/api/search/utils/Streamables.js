import { Writable } from 'stream';

class Writer extends Writable {
  constructor(insertCompletions, options = { objectMode: true }) {
    super(options);
    this.insertCompletions = insertCompletions;
  }

  static logMemory(task) {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`${task} uses approximately
      ${Math.round(used * 100) / 100} MB`);
  }

  async _write(item, encoding, callback) {
    console.log('Writing to redis, please wait...');
    Writer.logMemory('This import');

    this.insertCompletions([item])
      .then(() => callback())
      .catch(callback);
  }
}

export default Writer;
