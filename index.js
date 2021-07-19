addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const MODRINTH_API = 'https://api.modrinth.com/api/v1/'
const MODRINTH = 'https://modrinth.com/'

const FORMAT = [
  {
    name: 'project',
    path: ['p', 'm'],
  },
  {
    name: 'version',
    path: ['v'],
  },
  {
    name: 'user',
    path: ['u'],
  },
]

const HTML_PAGE = `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Janus - Modrinth URL shortener</title>

<style>
  body {
    font-family: sans-serif;
    min-height: 100hv;
    padding: 2rem 4rem;
    background-color: hsl(0, 0%, 93%);
  }

  h2, a {
    color: hsl(0, 0%, 38%)
  }

  pre {
    border-radius: 1rem;
    padding: 1rem 1.5rem;
    background-color: hsl(0, 0%, 24%);
    color: white;
    width: 80%;
    overflow-x: auto;
  }

  span {
    color: hsl(0, 0%, 63%);
  }
</style>
</head>

<body>
<main>
  <h2>Janus</h2>
  <h1>How to use</h1>

  <h3>Link to project</h3>
  <pre><code>https://m.vena.sh/p/hydrogen <span># with slug</span>
https://m.vena.sh/p/AZomiSrC <span># with ID</span></code></pre>

  <h3>Link to version</h3>
  <pre><code>https://m.vena.sh/v/gqJWYgtD <span># with ID</span></code></pre>

  <h3>Link to user</h3>
  <pre><code>https://m.vena.sh/u/jellysquid3 <span># with username</span>
https://m.vena.sh/u/TEZXhE2U <span># with ID</span></code></pre>

  <br /><br /><br />
  <a href="https://github.com/venashial/janus">Source on GitHub</a>
</main>
</body>`

async function handleRequest(request) {
  const path = await parsePath(new URL(request.url).pathname.replace('/', ''))

  // Project
  if (path.project) {
    return Response.redirect(MODRINTH + `mod/${path.project}`, 301)

    // Version
  } else if (path.version) {
    const request = await fetch(MODRINTH_API + `version/${path.version}`)
    const version = (await request.json()) || {}

    if (request.status === 200 && version.mod_id) {
      return Response.redirect(
        MODRINTH + `mod/${version.mod_id}/version/${path.version}`,
        301,
      )
    } else {
      return new Response('Unknown version ID', {
        status: 400,
      })
    }

    // Version redirect /u/:user_id/
    // Supports usernames
  } else if (path.user) {
    return Response.redirect(MODRINTH + `user/${path.user}`, 301)

    // Default explainer website
  } else {
    return new Response(HTML_PAGE, {
      headers: { 'content-type': 'text/html;charset=UTF-8' },
    })
  }
}

async function parsePath(path) {
  if (path.includes('/')) {
    const path_parts = path.split('/')

    for (const option of FORMAT) {
      for (const option_path of option.path) {
        if (path_parts[0] === option_path) {
          return { [option.name]: path_parts[1] }
        }
      }
    }
  } else {
    return {}
  }
}
