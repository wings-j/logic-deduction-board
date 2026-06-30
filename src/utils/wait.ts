/**
 * Wait
 * @param [time] Time
 */
async function wait(time = 0) {
  await new Promise(resolve => setTimeout(resolve, time));
}

export { wait };
