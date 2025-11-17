# Health Check Test
GET http://localhost:8080/

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.service" == "fragments"
jsonpath "$.time" isString
