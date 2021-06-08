## express

https://expressjs.com/en/4x/api.html



## 注意几个HTTP状态码

https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200

https://datatracker.ietf.org/doc/html/rfc7231#section-6.3.2



>   Aside from responses to CONNECT, a 200 response always has a payload,
>    though an origin server MAY generate a payload body of zero length.
>    If no payload is desired, an origin server ought to send 204 (No
>    Content) instead.  For CONNECT, no payload is allowed because the
>    successful result is a tunnel, which begins immediately after the 200
>    response header section.



## 中间件 与 AOP编程范式

middle ware

```js
express.use((req, res, next) => {
  
  next() // 交出执行权
})
```



AOP (Aspect Oriented Programming) 面向切面编程



降低软件之间的耦合



```js
function foo(options) {
  return () => {
    
  }
}

app.use(foo({
  
}))
```



## Express 中的中间件

