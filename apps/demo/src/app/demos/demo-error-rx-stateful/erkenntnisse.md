## plain
- mehrere Subscriber triggern mehrere http calls, daher multicasting operator
- error schließt u. nur mit catcherror kann chain aufrechterhalten werden

````ts
 plainhttp$ = this.http.get('https://jsonplaceholder.typicode.com/posts/1').pipe(
  log('plainhttp$')
)

 plainMethod(){
    this.plainhttp$.subscribe(d =>
    this.plainMethodResult = d)
    this.plainhttp$.subscribe()
  }
  
  logging: next, compolete, finalize
````
````ts
chain$ = this.id$.pipe(
  switchMap(id => this.http.get(`https://jsonplaceholder.typicode.com/posts/${id}`).pipe(
    log('chain inner$')
  )),
  log('chain$')
)
logging inner: next, complete, finalize
logging outer: next
````

```ts
 chainError$ = this.id$.pipe(
  switchMap(id => this.http.get(`https://jsonplaceholder.typicode.com/posts/${id}xx`).pipe(
    log('chainError$ inner')
  )),
  log('chainError$ outer')
)

logging inner: error, finalize
logging outer: finalize
```

## rxStateful
```ts
   /**
 * Triggert so nur einmal --> 1 http call
 */
this.action$.pipe(
  concatMap(() => rxStateful$(this.http.get('https://jsonplaceholder.typicode.com/posts/1'), {
    /**
     * Muss das setzen damit weiterhin getriggert werden kann --> 1 http call je action ✅
     */
    refetchStrategies: [withRefetchOnTrigger(this.action$)]
  }))
).subscribe(console.log)
```
* rxStateful mit flattening operator is unicast und triggert nur einmal 
* für mehrmaliges muss refetchTrigger gegeben werden --> NOCHMAL PRÜFEN, DAS GING!!!
  * Geht nur mit switchMap!
