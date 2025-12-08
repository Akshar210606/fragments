# Authenticated DELETE to /v1/fragments/:id
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`To be deleted`
HTTP/1.1 201
[Captures]
url: header "Location"

# Delete the fragment
DELETE {{url}}
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"

# Verify it's gone
GET {{url}}
[BasicAuth]
user1@email.com:password1
HTTP/1.1 404
