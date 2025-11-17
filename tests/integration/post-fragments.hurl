# Authenticated POST to /v1/fragments and GET it back

# 1) Create a new text/plain fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password
`This is a fragment!`

# Expect HTTP 201 Created
HTTP/1.1 201

[Asserts]
# Location header should include a fragment id
header "Location" matches "^http://localhost:8080/v1/fragments/[A-Za-z0-9_-]+$"

# JSON response is success
jsonpath "$.status" == "ok"

# Fragment metadata shape
# Our IDs use UUID format (crypto.randomUUID())
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/plain"
# length("This is a fragment!") = 19
jsonpath "$.fragment.size" == 19

[Captures]
# Capture the Location header so we can GET the fragment
url: header "Location"

GET {{url}}
[BasicAuth]
user1@email.com:password

HTTP/1.1 200
Content-Type: text/plain
Content-Length: 19

[Asserts]
body == "This is a fragment!"
