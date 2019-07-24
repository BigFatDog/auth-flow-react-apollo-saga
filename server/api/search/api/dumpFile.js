import fs from 'fs';
import path from 'path';
import JSONStream from 'JSONStream';
import Writer from '../utils/Streamables';
import apiDeleteCompletions from './deleteCompletions';

const dumpFile = instance => (filePath, token) => {
  const json = fs.createReadStream(
    path.resolve(process.cwd(), filePath),
    'utf8'
  );
  const parser = JSONStream.parse('*');
  const writer = new Writer(apiInsertCompletions(instance), token);

  return new Promise((resolve, reject) => {
    json.pipe(parser).pipe(writer);
    writer.on('finish', () => resolve('Import finished'));
  });
};

export default dumpFile;
