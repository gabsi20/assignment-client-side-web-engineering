/**
 * Implement a view engine:
 *
 * - Parse HTML string
 * - Create according elements: node, text, variable
 * - Implement update function
 *
 * API:
 *
 * const template = build('<h1>{{title}}</h1>');
 * const {el, update} = template({title: 'Hello, World!'});
 * el.outerHTML // <h1>Hello, World!</h1>
 * update({title: 'Hallo Welt!'});
 * el.outerHTML // <h1>Hallo, Welt!</h1>
 */


export function build(template){
  const nodes = new Map()

  function intern(template){
    const MATCH_ELEMENT = /<([a-z][a-z0-9]*\b[^>]*)>(.*?)<\/\1>/g;
    const MATCH_VARIABLE = /^\{\{(.+)\}\}$/;
    const elem = MATCH_ELEMENT.exec(template)
    const text = MATCH_VARIABLE.exec(template)
    let el;
    if(elem){ // if dom elem
      el = document.createElement(elem[1]);
      el.appendChild(intern(elem[2]));
    } else if(text) { // if template elem
      el = document.createTextNode(text[1])
      if(nodes.get(text[1])){
        nodes.set(text[1], nodes.get(text[1]).push(el))
      } else {
        nodes.set(text[1], [el])
      }
    }
    return el
  }
  
  const el = intern(template)

  return function(data){
    const update = function(data){
      for(var key in data){
        const elems = nodes.get(key);
        for(const elem of elems){
          elem.nodeValue = data[key];
        }
      }
    }

    update(data);

    return {el, update}
  }
}

