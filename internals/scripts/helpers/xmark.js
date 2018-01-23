import chalk from 'chalk';

/**
 * Adds mark cross symbol
 */
const addXMark = (callback) => {
  process.stdout.write(chalk.red(' ✘'));
  if (callback) callback();
}

export default addXMark;
