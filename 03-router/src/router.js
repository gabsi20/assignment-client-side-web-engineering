/**
 * Implement a dependency free global router for web browsers
 *
 * - It should allow static paths
 * - It should invoke function for "/" if defined on start
 * - It should have WILDCARD support * for catch all route
 * - It should never fail (provide error fallback)
 * - It should allow static redirects
 *
 * API:
 *
 * Static:
 * - page('/', index)
 *
 * Dynamic:
 * - page('/user/:user', show)
 * - page('/user/:user/edit', edit)
 * - page('/user/:user/album', album)
 * - page('/user/:user/album/sort', sort)
 *
 * Redirects:
 * - page('/home', index)
 * - page('/', '/home')
 *
 * Catch all:
 * - page('*', notfound)
 *
 * Start:
 * - page()
*/

const createRouter = function() {
  let window, document, history
  const routes = []
  const wildCardCharacter = '*'
  const defaultRoute = "/"
  const getUrlParams = new RegExp(':[\\w]*', 'g')

  const initialize = function(options){

    window = options.window
    document = window.document
    history = window.history
    window.addEventListener('popstate', popHandler)
    window.addEventListener('click', clickHandler)

    if(routes.some(route => route.pathname === defaultRoute)){
      showRoute({target: { location: { pathname: "/" }}})
    }
  }

  const router = function (path, callback){
    if(typeof path === "object"){
      initialize(path)
    }else{
      defineRoute(path, callback)
    }
  }

  const defineRoute = function(pathname, callback){
    if( pathname === wildCardCharacter){
      routes.wildcard = callback
    }else if(!routes.some(route => route.pathname === pathname)){
      const regexString = pathname.replace(getUrlParams, "([\\w]*)")
      routes.push({
        pathname,
        regex: new RegExp('^'+regexString+'$'),
        urlParams: pathname.match(getUrlParams),
        callback: typeof callback === 'string' ? () => showRoute({ target: { location: { pathname: callback }}}) : callback
      })
    }
  }

  const showRoute = function({ target: { location:{ pathname }}}){
      const route = routes.filter(route => route.regex.test(pathname)).shift()
      if(route){
        execRoute(pathname, route)
      }else if(routes.wildcard){
        execWildcard(pathname)
      } else {
        execError("nothing happened here")
      }
  }

  const popHandler = function(event){
    showRoute(event);
  }

  const clickHandler = function({target}){
    if(target.origin === document.location.origin && !target.rel && !target.download && target.target !== "_blank"){
      showRoute({target: { location: { pathname: target.pathname }}});
    }
  }

  const execRoute = function(pathname, route){
    const data = {params: {}}
    const [,...params] = pathname.match(route.regex)
    params.forEach((el,idx) => { data.params[route.urlParams[idx].substr(1)] = el })
    route.callback(data)
    window.history.pushState({}, pathname, pathname)
    router.current = route.pathname
  }

  const execWildcard = function(pathname){
    window.history.pushState({}, pathname, pathname)
    routes.wildcard()
    router.current = pathname
  }

  const execError = function(error){
    router.error = Error(error)
  }

  return router
}


export {createRouter}
