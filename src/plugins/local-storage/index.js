import PetstoreYaml from "./petstore"
import CryptoJS from 'crypto-js'
import "whatwg-fetch"

const CONTENT_KEY = "swagger-editor-content"

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

// function base64_encode(data){
// 	var str=CryptoJS.enc.Utf8.parse(data)
// 	var base64=CryptoJS.enc.Base64.stringify(str)
// 	return base64
// }
function base64_decode(dataBase64){
	var words  = CryptoJS.enc.Base64.parse(dataBase64)
	return words.toString(CryptoJS.enc.Utf8)
}

function loadByQueryYamlUrl() {
  var swaggerProtocolUrlBase64 = getQueryString ('yamlUrl')
  if(swaggerProtocolUrlBase64) {
    var swaggerProtocolUrl = base64_decode(swaggerProtocolUrlBase64)
    fetch(swaggerProtocolUrl).then(res => res.text()).then(res => {
      saveContentToStorage(res)
      return res
    })
  }
  return null
}

export default function(system) {
  // setTimeout runs on the next tick
  setTimeout(() => {
    //loadByQueryYamlUrl()
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
