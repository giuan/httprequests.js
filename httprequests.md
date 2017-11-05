
# httprequests: HTTP client library for Javascript
`httprequests.js` is based on fetch API.

## Use

Load `httprequests.js`

`<script src="httprequests.js"  charset="utf-8"></script>`

### GET request
```
http.get('\hello',{name: 'Jhon'}, function(data){
    console.log(data)
})
```
### POST request
```
http.post('\insert',{name: 'Jhon'}, function(data){
    console.log(data)
})
```
### GET, HEAD, POST, PUT, DELETE, PATCH, OPTIONS
```
http.request({
  method: 'put',
  url:  '/modify',
  params: {id: 'value'},
  ok: function(data){
    console.log(data)
  }
})
```
For all the parameters of http.request see the refernce
### Responce with codes 4xx
```
http.get('\hello',{name: 'Jhon'}, function(data,status){
    console.log(data)
})
```
or
```
http.get('\hello',{name: 'Jhon'},
  // status 200:299
  function(data,status){
      console.log(data)
  },
  // status 400:499
  function(data,status){
      console.log(status)
  }
)
```
### Override default error handler
The default error handler display errors in an alert dialog.
```
http.defaultErrorHandler(function(status, statusText, data) {
  console.log(status,statusText,data)
})
```
Now errors goes to console.
### Requests with headers
```
http.requestHeaders = {
  'Accept': 'application/json',        // expects json responce
  'Content-Type': 'application/json'   // make a json request
}
http.post('\insert',{name: 'Jhon'}, function(data){
    console.log(data)
})
```

### Reference
Object `http`

    http.requestHeaders = {'header': 'value', ...}

    http.request(httpparams)
          httpparams: {
              method: 'a method',
              url:  'a url',
              params: {..}|FormData|string,
              ok: function(data[,status [,responseCache]]){}
              [,err400: function(data, status [,responseCache]]){}]
              [,headers: {}]  replace http.requestHeaders
          }

          params: FormData -> multipart/...
                Object -> application/application/x-www-form-urlencoded
                string -> fetch default

      http.request(method, url, [params,] [okhandler[, err400handler]])
      http.get(url, [params,] [okhandler[, err400handler]])
      http.post(url, [params,] [okhandler[, err400handler]])

          reponsehandler(data[,status [,responseCache]]){}
          reponsehandler(data)  -> only 2xx codes
          reponsehandler(data, status)  ->  2xx code and 4xx codes
          err400handler(data, status [,responseCache])  -> for 4xx eror codes

          responceCache is the original Responce object
            responseCache.statusText
            responseCache.headers

      http.defaultErrorHandler = function(status, statusText, data)
          respond to error codes 5xx and 4xx if no 4xx handler
> `[parameter]` -> `parameter` is optional
