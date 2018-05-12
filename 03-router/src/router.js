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
let window, document, history;
const routes = [];
const getUrlParams = new RegExp(':[\\w]*', 'g');

const startup = function(options){
  window = options.window
  document = window.document
  history = window.history
  window.addEventListener('popstate', linkHandler);
  window.addEventListener('click', linkHandler);
}

const router = function (path, callback){
  if(typeof path === "object"){
    startup(path)
  }else{
    setRoute(path, callback)
  }
}

const setRoute = function(pathname, callback){
  if(!routes.some(route => route.pathname === pathname)){
    const regexString = pathname.replace(getUrlParams, "([\\w]*)");
    routes.push({
      pathname,
      regex: new RegExp('^'+regexString+'$'),
      urlParams: pathname.match(getUrlParams),
      callback
    });
  }
}

const linkHandler = function({ target: { location:{ pathname }}}){
    const route = routes.filter(route => route.regex.test(pathname)).shift();
    if(route){
      const [,...params] = pathname.match(route.regex)
      window.history.pushState({}, pathname, pathname);
      route.callback(params);
      router.current = route.pathname;
    }else{
      router.error = Error("route undefined");
    }
}



const createRouter = function() {
  router.current = '/'
  return router
}


export {createRouter};
