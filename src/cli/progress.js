const parseArgs = (args) => {
  const handlers = {
    '--duration': (val) => ({ duration: parseInt(val, 10) || 5000 }),
    '--interval': (val) => ({ interval: parseInt(val, 10) || 100 }),
    '--length': (val) => ({ length: parseInt(val, 10) || 30 }),
    '--color': (val) => ({ color: val }),
  };

  let options = { duration: 5000, interval: 100, length: 30, color: null };
  for (let i = 0; i < args.length; i++) {
    const handler = handlers[args[i]];
    if (handler && args[i + 1]) {
      options = { ...options, ...handler(args[i + 1]) };
      i++;
    }
  }

  return {
    ...options,
    color: options.color && /^#[0-9a-fA-F]{6}$/.test(options.color) ? options.color : null
  };
};

const getColorCode = (color) =>
  !color ? '' : `\x1b[38;2;${parseInt(color.slice(1, 3), 16)};${parseInt(color.slice(3, 5), 16)};${parseInt(color.slice(5, 7), 16)}m`;

const renderBar = (progress, length, colorCode, reset) => {
  const filled = Math.floor((progress / 100) * length);
  const bar = '█'.repeat(filled) + ' '.repeat(length - filled);
  return `[${colorCode}${bar.slice(0, filled)}${reset}${bar.slice(filled)}] ${Math.floor(progress)}%`;
};

const progress = () => {
  // Write your code here
  // Simulate progress bar from 0% to 100% over ~5 seconds
  // Update in place using \r every 100ms
  // Format: [████████████████████          ] 67%
  const options = parseArgs(process.argv.slice(2));
  const colorCode = getColorCode(options.color);
  const reset = options.color ? '\x1b[0m' : '';
  const startTime = Date.now();

  const update = () => {
    const elapsed = Date.now() - startTime;
    const progressPercent = Math.min((elapsed / options.duration) * 100, 100);
    process.stdout.write(`\r${renderBar(progressPercent, options.length, colorCode, reset)}`);
    progressPercent < 100 ? setTimeout(update, options.interval) : process.stdout.write('\nDone!\n');
  };

  update();
};

progress();
