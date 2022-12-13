## USAGE

run the server:
```
deno run --allow-net server.ts
```

send a message:
```
curl -v -H "Content-Type: application/json" -d '{ "message": "Hello!" }' http://localhost:8000/messages ; echo
```

retrieve messages:
```
curl -v http://localhost:8000/messages ; echo
```