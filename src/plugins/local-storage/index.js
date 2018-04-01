import PetstoreYaml from "./petstore"
import CryptoJS from 'crypto-js'
import "whatwg-fetch"

const CONTENT_KEY = "swagger-editor-content"
const CONTENT_YAML_URL_KEY = "swagger-yaml-url"

let localStorage = window.localStorage

export const updateSpec = (ori) => (...args) => {
  let [spec] = args
  ori(...args)
  saveContentToStorage(spec)
}

function getQueryString(name)
{
    var url = window.location.search
    var reg = new RegExp('(^|&)'+ name +'=([^&]*)(&|$)','i')
    var r = url.substr(1).match(reg)
    if (r != null) return decodeURIComponent(r[2]); return null
}

function base64_decode(dataBase64){
	var words  = CryptoJS.enc.Base64.parse(dataBase64)
	return words.toString(CryptoJS.enc.Utf8)
}

function urlQueryDel(name){
  var loca = window.location
  var baseUrl = loca.origin + loca.pathname + "?"
  var query = loca.search.substr(1)
  if (query.indexOf(name)>-1) {
      var obj = {}
      var arr = query.split("&")
      for (var i = 0; i < arr.length; i++) {
          arr[i] = arr[i].split("=")
          obj[arr[i][0]] = arr[i][1]
      }
      delete obj[name]
      var url = baseUrl + JSON.stringify(obj).replace(/[\"\{\}]/g,"").replace(/\:/g,"=").replace(/\,/g,"&")
      return url
  }
}

function loadByQueryYamlUrl() {
  var swaggerProtocolUrlBase64 = getQueryString ('yamlUrl')
  if(swaggerProtocolUrlBase64) {
    var swaggerProtocolUrl = base64_decode(swaggerProtocolUrlBase64)
    fetch(swaggerProtocolUrl,{
      method: 'GET',
      mode: 'cors'
    }).then(res => res.text()).then(res => {
      saveContentToStorage(res)
      window.location.href = urlQueryDel('yamlUrl')
    })
  }
}


export default function(system) {
  // setTimeout runs on the next tick
  setTimeout(() => {
    loadByQueryYamlUrl()
    if(localStorage.getItem(CONTENT_KEY)) {
      system.specActions.updateSpec(localStorage.getItem(CONTENT_KEY))
    } else if(localStorage.getItem("ngStorage-SwaggerEditorCache")) {
      // Legacy migration for swagger-editor 2.x
      try {
        let obj = JSON.parse(localStorage.getItem("ngStorage-SwaggerEditorCache"))
        let yaml = obj.yaml
        system.specActions.updateSpec(yaml)
        saveContentToStorage(yaml)
        localStorage.setItem("ngStorage-SwaggerEditorCache", null)
      } catch(e) {
        system.specActions.updateSpec(PetstoreYaml)
      }
    } else {
      system.specActions.updateSpec(PetstoreYaml)
    }
  }, 0)
  return {
    statePlugins: {
      spec: {
        wrapActions: {
          updateSpec
        }
      }
    }
  }
}

function saveContentToStorage(str) {
  return localStorage.setItem(CONTENT_KEY, str)
}
