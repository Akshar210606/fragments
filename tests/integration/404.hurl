# 404 Test - unknown route
GET http://localhost:8080/no-such-route

HTTP/1.1 404

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404
