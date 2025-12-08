# Authenticated PUT to /v1/fragments/:id
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Hello World`
HTTP/1.1 201
[Captures]
url: header "Location"
fragment_id: jsonpath "$.fragment.id"

# Update the fragment
PUT {{url}}
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Hello World Updated`
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.size" == 19
jsonpath "$.fragment.type" == "text/plain"

# Verify the update
GET {{url}}
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200
[Asserts]
body == "Hello World Updated"
