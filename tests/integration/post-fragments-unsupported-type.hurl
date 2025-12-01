# Posting an unsupported Content-Type should return 415

POST http://localhost:8080/v1/fragments
Content-Type: application/pdf
[BasicAuth]
user1@email.com:password1

`%PDF-1.4 fake data`

HTTP/1.1 415

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 415
