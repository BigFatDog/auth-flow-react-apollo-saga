import fs from 'fs';
import path from 'path';
import JSONStream from 'JSONStream';
import Writer from '../utils/Streamables';
import apiInsertCompletions from './insertCompletions';

const dumpFile = instance => filePath => {
  const json = fs.createReadStream(
    path.resolve(process.cwd(), filePath),
    'utf8'
  );
  const parser = JSONStream.parse('*');
  const writer = new Writer(apiInsertCompletions(instance));

  return new Promise((resolve, reject) => {
    json.pipe(parser).pipe(writer);
    writer.on('finish', () => resolve('Seed file finished'));
  });
};

export default dumpFile;
