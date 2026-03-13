import * as readline from 'readline';

const interactive = () => {
  // Write your code here
  // Use readline module for interactive CLI
  // Support commands: uptime, cwd, date, exit
  // Handle Ctrl+C and unknown commands
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const commandHandlers = {
    uptime: () => `Uptime: ${process.uptime()} seconds`,
    cwd: () => `Current directory: ${process.cwd()}`,
    date: () => `Current date: ${new Date().toISOString()}`,
    exit: () => {
      console.log('Exiting...');
      rl.close();
      return null; 
    }
  };

  const processInput = (input) => {
    const cmd = input.trim().toLowerCase();
    return commandHandlers[cmd] ? commandHandlers[cmd]() : 'Unknown command';
  };

  const promptLoop = () => {
    rl.question('> ', (input) => {
      const result = processInput(input);
      if (result !== null) {
        console.log(result);
        promptLoop(); 
      }
    });
  };

  rl.on('SIGINT', () => {
    console.log('\nExiting...');
    rl.close();
  });

  promptLoop();
};

interactive();
