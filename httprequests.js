// Documentation: httprequests.md

'use strict';

var dom = {}

var http = (function() {
  function qs(selector) {
    return document.querySelector(selector);
  }
  function qsa(selector) {
    var res = document.querySelectorAll(selector);
    if (res.forEach) return res;
    else return Array.from(res);
  }

  function getFormData(form) {
    var els = qsa('[name]');
    if (!els.forEach) els = Array.from(els);
    var params = [];
    els.forEach(function(e){
      if (e.tagName == 'INPUT' && (e.type == 'radio' || e.type == 'checkbox')) {
         if (e.checked) params.push([e.name, e.value])
      } else if (e.tagName == 'SELECT') {
        var o = Array.from(e.querySelectorAll(':checked'));
        o.forEach(function(s){
          params.push([e.name, s.value])
        })
      } else {
        params.push([e.name, e.value])
      }
    })
    return params;
  }
  function pairArrayToUriEncoded(pa) {
    var params = pa.map(function(pair) {
      return encodeURIComponent(pair[0]) + "=" + encodeURIComponent(pair[1])
    })
    console.log(params)
    return params.join('&')
  }

  function pairArrayToFormData(pa) {
    var formData = new FormData();
    pa.forEach(function(pair) {
      formData.append(encodeURIComponent(pair[0]), encodeURIComponent(pair[1]))
    })
    return formData
  }

  function objectToUriEncoded(obj) {
    var pairs = Object.keys(obj)
    pairs.forEach(function(k, i) {
      pairs[i] = [k, obj[k]]
    })
    return pairArrayToUriEncoded(pairs)
  }

  function pairArrayToJson(pa) {
    var object = {};
    pa.forEach(function(p) {
      object[p[0]] = (object[p[0]] ? [].concat(object[p[0]], p[1]) : p[1])
    });
    return JSON.stringify(object);
  }

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
      if (params instanceof FormData) {
        //params = formDataToJson(params)
        throw("Error: no FormData for json request ")
      } else if (Array.isArray(params)){
        params = pairArrayToJson(params)
      }else if (typeof(params) == "object"){
        params = JSON.stringify(params)
      }
    }else if (typeof(params) == "string") {
      // do nothing
    } else if (params instanceof FormData) {
      if (['get','head','options'].includes(method)) {
        //params = formDataToUriEncoded(params)
        throw("Error: no FormData for GET request ")
      }
    } else if (Array.isArray(params)){
      if (['get','head','options'].includes(method)) {
        headers["Content-type"] = "application/x-www-form-urlencoded"
        params = pairArrayToUriEncoded(params)
      }else {
        params = pairArrayToFormData(params)
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

  // export
  dom.qs = qs;
  dom.qsa = qsa;
  dom.getFormData = getFormData;
  return http;
})();
