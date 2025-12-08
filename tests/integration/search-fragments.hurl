# 1. Authenticate and create a text fragment
POST http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: text/plain
`Hello World`

HTTP 201
[Captures]
text_fragment_id: jsonpath "$.fragment.id"

# 2. Create a JSON fragment
POST http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: application/json
`{"foo":"bar"}`

HTTP 201
[Captures]
json_fragment_id: jsonpath "$.fragment.id"

# 3. List all fragments (should have at least 2)
GET http://localhost:8080/v1/fragments
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP 200
[Asserts]
jsonpath "$.fragments" includes "{{text_fragment_id}}"
jsonpath "$.fragments" includes "{{json_fragment_id}}"

# 4. Search for text fragments
GET http://localhost:8080/v1/fragments?type=text/plain
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP 200
[Asserts]
jsonpath "$.fragments" includes "{{text_fragment_id}}"
jsonpath "$.fragments" not includes "{{json_fragment_id}}"

# 5. Search for JSON fragments
GET http://localhost:8080/v1/fragments?type=application/json
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP 200
[Asserts]
jsonpath "$.fragments" not includes "{{text_fragment_id}}"
jsonpath "$.fragments" includes "{{json_fragment_id}}"

# 6. Clean up
DELETE http://localhost:8080/v1/fragments/{{text_fragment_id}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP 200

DELETE http://localhost:8080/v1/fragments/{{json_fragment_id}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP 200
