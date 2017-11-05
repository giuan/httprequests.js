// Documentation: httprequests.md

'use strict';

// funzioni di utilità
function pairArrayToUriEncoded(pa) {
  var params = pa.map(function(pair) {
    return encodeURIComponent(pair[0]) + "=" + encodeURIComponent(pair[1])
  })
  return params.join('&')
}

function formDataToUriEncoded(formdata) {
  return pairArrayToUriEncoded(Array.from(formdata))
}

function formToUriEncoded(form) {
  if (typeof(form) == "string") {
    form = document.querySelector(form);
  }
  return formDataToUriEncoded(new FormData(form))
}

function objectToUriEncoded(obj) {
  var pairs = Object.keys(obj)
  pairs.forEach(function(k, i) {
    pairs[i] = [k, obj[k]]
  })
  return pairArrayToUriEncoded(pairs)
}

function formDataToJson(formData) {
  var object = {};
  Array.from(formData).forEach(function(value, key) {
    object[key] = (object[key] ? [].concat(object[key], value) : value)
  });
  return JSON.stringify(object);
}

function formToJson(form) {
  if (typeof(form) == "string") {
    form = document.querySelector(form);
  }
  return formDataToJson(new FormData(form))
}

var http = (function() {
  function request(method, url, params, okhandler, err400handler) {
    // for request({method: ...,})
    if (typeof(method) != 'string') {
      var httpparams = method;
      method = httpparams['method'];
      url = httpparams['url'];
      params = httpparams['params'] || {};
      okhandler = httpparams['ok'];
      err400handler = httpparams['err400'];
      if (httpparams['headers'])
        http.requestHeaders = httpparams['headers'];
    //  params is optional so ...
    }else if (typeof(params) == "function") {
      err400handler = okhandler
      okhandler = params
      params = {}
    }
    method = method.toLowerCase()
    var headers = http.requestHeaders
    http.requestHeaders = {}
    var ct = headers['Content-Type'];
    if (ct && ct.search('json') >= 0) {
      if (params instanceof FormData)
        params = formDataToJsonEncoded(params)
      else if (typeof(params) == "object")
        params = JSON.stringify(params)
    }else if (typeof(params) == "string") {
      // do nothing
    } else if (params instanceof FormData) {
      if (['get','head','options'].includes(method)) {
        params = formDataToUriEncoded(params)
      }
    } else if (typeof(params) == 'object'){
      if (!['get','head','options'].includes(method)) {
        headers["Content-type"] = "application/x-www-form-urlencoded"
      }
      params = objectToUriEncoded(params)
    }
    var httpparams = {
      method: method,
      headers: headers,
    }
    if (['get','head','options'].includes(method)) {
      if (params.length > 0)
        url += '?' + params
    } else {
      httpparams["body"] = params
    }
    var responseCache;
    fetch(url, httpparams)
      .then(function(response) { // eseguita quando arriva la risposta
        responseCache = response
        var ct = response.headers.get('Content-Type');
        if (ct) {
          if (ct.search('json') >= 0) return response.json();
          if (ct.search('multipart\/') >= 0) return response.formData();
        }
        return response.text();
      })
      .then(function(data) { // eseguita quando ha letto il body della risposta      if (response_bk.ok){
        var minErrStatus = 500;
        var status = responseCache.status;
        if (!okhandler || okhandler.length == 1) minErrStatus = 300;
        if (err400handler && status >= 400 && status < 500) {
          err400handler(data, status, responseCache)
        }else if (okhandler && status < minErrStatus) {
          okhandler(data, status, responseCache)
        } else {
          http.defaultErrorHandler(status, responseCache.statusText, data)
        }
      })
      .catch(function(error) {
        console.log(error)
      });
  }

  function defaultErrorHandler(status, statusText, data) {
    alert(`${status} ${statusText}\n${data}`)
  }

  // Object http

  var http = {
    requestHeaders: {},
    request: request,
    get: function(url, params, handler) {
      request('get', url, params, handler)
    },
    post: function(url, params, handler) {
      request('post', url, params, handler)
    },
    defaultErrorHandler: defaultErrorHandler
  }
  return http;
})();
