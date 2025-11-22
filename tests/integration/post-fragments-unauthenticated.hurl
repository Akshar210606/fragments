# Unauthenticated POST must fail with 401

POST http://localhost:8080/v1/fragments
Content-Type: text/plain

`Should not be allowed`

HTTP/1.1 401

[Asserts]
jsonpath "$.status" == "error"
