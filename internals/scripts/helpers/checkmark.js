import chalk from 'chalk';

/**
 * Adds mark check symbol
 */
const addCheckMark = (callback)=> {
  process.stdout.write(chalk.green(' ✓'));
  if (callback) callback();
}

export default addCheckMark;
