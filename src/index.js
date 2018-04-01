import deepMerge from "deepmerge"
import SwaggerUI from "swagger-ui"
import EditorLayout from "./layout"
import "swagger-ui/dist/swagger-ui.css"

import EditorPlugin from "./plugins/editor"
import LocalStoragePlugin from "./plugins/local-storage"
import ValidateBasePlugin from "./plugins/validate-base"
import ValidateSemanticPlugin from "./plugins/validate-semantic"
import ValidateJsonSchemaPlugin from "./plugins/validate-json-schema"
import EditorAutosuggestPlugin from "./plugins/editor-autosuggest"
import EditorAutosuggestSnippetsPlugin from "./plugins/editor-autosuggest-snippets"
import EditorAutosuggestKeywordsPlugin from "./plugins/editor-autosuggest-keywords"
import EditorAutosuggestOAS3KeywordsPlugin from "./plugins/editor-autosuggest-oas3-keywords"
import EditorAutosuggestRefsPlugin from "./plugins/editor-autosuggest-refs"
import PerformancePlugin from "./plugins/performance"
import JumpToPathPlugin from "./plugins/jump-to-path"
import CryptoJS from 'crypto-js'

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

function getSwagger2GeneratorUrl(url) {
  var swaggerProtocolUrlBase64 = getQueryString ('yamlUrl')
  if(swaggerProtocolUrlBase64) {
    var swaggerProtocolUrl = base64_decode(swaggerProtocolUrlBase64)
    console.log(swaggerProtocolUrl)
    if(swaggerProtocolUrl) {
      return swaggerProtocolUrl
    }
  }
  return url
}

// eslint-disable-next-line no-undef
const { GIT_DIRTY, GIT_COMMIT, PACKAGE_VERSION } = buildInfo

window.versions = window.versions || {}
window.versions.swaggerEditor = `${PACKAGE_VERSION}/${GIT_COMMIT || "unknown"}${GIT_DIRTY ? "-dirty" : ""}`
const plugins = {
  EditorPlugin,
  ValidateBasePlugin,
  ValidateSemanticPlugin,
  ValidateJsonSchemaPlugin,
  LocalStoragePlugin,
  EditorAutosuggestPlugin,
  EditorAutosuggestSnippetsPlugin,
  EditorAutosuggestKeywordsPlugin,
  EditorAutosuggestRefsPlugin,
  EditorAutosuggestOAS3KeywordsPlugin,
  PerformancePlugin,
  JumpToPathPlugin,
}

const defaults = {
  dom_id: "#swagger-editor", // eslint-disable-line camelcase, we have this prop for legacy reasons.
  layout: "EditorLayout",
  presets: [
    SwaggerUI.presets.apis
  ],
  plugins: Object.values(plugins),
  components: {
    EditorLayout
  },
  showExtensions: true,
  swagger2GeneratorUrl: getSwagger2GeneratorUrl("https://generator.swagger.io/api/swagger.json"),
  oas3GeneratorUrl: "http://generator3.swagger.io/api/generator.json"
}

module.exports = function SwaggerEditor(options) {
  let mergedOptions = deepMerge(defaults, options)

  mergedOptions.presets = defaults.presets.concat(options.presets || [])
  mergedOptions.plugins = defaults.plugins.concat(options.plugins || [])
  return SwaggerUI(mergedOptions)
}

module.exports.plugins = plugins
