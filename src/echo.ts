<<<<<<< HEAD
export function echo(value) {
  if (value.echo && value.echo === 'echo') {
    return { error: 'error' };
  }
  return value;
}
=======
import HTTPError from 'http-errors';

function echo(value: string) {
  if (value === 'echo') {
    // ITERATION 3
    throw HTTPError(400, 'Cannot echo "echo"');
    // ITERATION 2
    // return { error: 'error' };
  }
  return value;
}

export { echo };
>>>>>>> 23ab0a9897f3394234ea3b3f3f24bd62f287f0e9
