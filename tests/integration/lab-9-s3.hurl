# tests/integration/lab-9-s3.hurl
# Authenticated Request
# 1. POST a new text fragment
POST http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: text/plain
`Hello S3!`

# 2. Confirm that the server returns a 201
HTTP/1.1 201
[Captures]
url: header "Location"

# 3. GET the fragment you just created using the url
GET {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# 4. Confirm that the server returns a 200
HTTP/1.1 200
Content-Type: text/plain
`Hello S3!`

# 5. DELETE the fragment using the url
DELETE {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# 6. Confirm that the server returns a 200
HTTP/1.1 200

# 7. Try to GET the fragment again using the url
GET {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# 8. Confirm that the server returns a 404
HTTP/1.1 404
