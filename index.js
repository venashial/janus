addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const MODRINTH_API  = 'https://api.modrinth.com/api/v1/'
const MODRINTH = 'https://modrinth.com/'

const FORMAT = [
  {
    name: 'project',
    path: ['p' , 'm'],
    short: ['+']
  },
  {
    name: 'version',
    path: ['v'],
    short: ['$']
  },
  {
    name: 'user',
    path: ['u'],
    short: ['!']
  }
]

async function handleRequest(request) {
  const path = parsePath(new URL(request.url).pathname.replace('/', ''))
  console.log(path)

  if (path.project) {
    return Response.redirect(MODRINTH + `mod/${path.project}`, 307)
    
  // Version redirect /v/:version_id/
  } else if (path.version) {
    const request = await fetch(MODRINTH_API + `version/${path.version}`)
    const version = await request.json() || {}

    if (request.status === 200 && version.mod_id) {
      return Response.redirect(MODRINTH + `mod/${version.mod_id}/version/${path.version}`, 307)
    } else {
      return new Response('Unknown version ID', {
        status: 400
      })
    }

  // Version redirect /u/:user_id/
  // Supports usernames
  } else if (path.user) {
    return Response.redirect(MODRINTH + `user/${path.user}`, 307)

  // Default explainer website
  } else {
    return new Response('Unknown path', {
      status: 404
    })
  }
}

function parsePath(path) {
  if (path.includes('/')) {
    const path_parts = path.split('/')

    FORMAT.forEach(option => {
      option.path.forEach(path => {
        if (path_parts[0] === path) {
          return { [option.name]: path_parts[1] }
        }
      })
    })
  } else {
    FORMAT.forEach(option => {
      option.short.forEach(short => {
        if (path.charAt(0) === short) {
          console.log({ [option.name]: path.substring(1) })
          return { [option.name]: path.substring(1) }
        }
      })

      // Nothing found
      return {}
    })
  }
}