# Authenticated POST markdown and convert to HTML
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
`# Hello World`
HTTP/1.1 201
[Captures]
url: header "Location"

# Convert to HTML
GET {{url}}.html
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200
Content-Type: text/html; charset=utf-8
[Asserts]
body contains "<h1>Hello World</h1>"

# Convert to TXT
GET {{url}}.txt
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200
Content-Type: text/plain
