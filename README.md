# Company authentication

/POST /company/auth/signup

req.body: {
  "email": "",
  "password": ""
  "name": ""
}

res.body: {
  "token": ""
}

/POST /company/auth/signin

req.body: {
  "email": "",
  "password": ""
}

res.body: {
  "token": ""
}

# Company getters and setters

/POST /company/private/name

headers.Authorization: token

req.body: {
  "name": ""
}

/GET /company/private/name

headers.Authorization: token

res.body: {
  "name": ""
}

/POST /company/private/phone

headers.Authorization: token

req.body: {
  "phone": ""
}

/GET /company/private/phone

headers.Authorization: token

res.body: {
  "phone": ""
}

/POST /company/private/description

headers.Authorization: token

req.body: {
  "description": ""
}

/GET /company/private/description

headers.Authorization: token

res.body: {
  "description": ""
}

/GET /company/private/profile

headers.Authorization: token

res.body: {
  "id": ""
  "email": ""
  "name": ""
  "phone": ""
  "description": ""
}

/POST /company/private/profile

headers.Authorization: token

// Если хочешь получить какой-то параметер, то добавляешь его как ключ и 1 как значение:
// Например, "phone": "1"
req.body: {
  "id": "1"
  "email": "1"
  "description": "1"
}

res.body: {
  "id": ""
  "email": ""
  "description": ""
}
