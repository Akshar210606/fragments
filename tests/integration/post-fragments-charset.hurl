# POST with charset

POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user1@email.com:password

`Hello world!`

HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 12

[Captures]
url: header "Location"

GET {{url}}
[BasicAuth]
user1@email.com:password

HTTP/1.1 200
Content-Type: text/plain
Content-Length: 12

[Asserts]
body == "Hello world!"
