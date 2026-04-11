const USERNAME = 'photojomo';
const PASSWORD = 'p0t0j0m0';

function unauthorized() {
  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Capture Caribbean"',
    },
  });
}

export default {
  async fetch(request, env) {
    const authorization = request.headers.get('Authorization');

    if (!authorization || !authorization.startsWith('Basic ')) {
      return unauthorized();
    }

    const credentials = atob(authorization.slice(6));
    const [user, pass] = credentials.split(':');

    if (user !== USERNAME || pass !== PASSWORD) {
      return unauthorized();
    }

    return env.ASSETS.fetch(request);
  },
};
