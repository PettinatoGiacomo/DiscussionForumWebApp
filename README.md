[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/6EO6Vzam)
# Exam #1: "Forum"
## Student: s346259 PETTINATO GIACOMO 

## React Client Application Routes

- Route `/`: homepage list of posts
- Route `/login`: login form (including TOTP form)
- Route `/post/:id`: contains post with all of the informations and comments
- Route `/post/new`: form for creating a new post


## API Server

- POST `/api/sessions`
  - **request**: json object with email and password
    ```
      {
      "password": "pwd",
      "username": "u1@p.it"
      } 
    ```
  - **response**: json object with user informations to identify user and wheter it's admin or not
    ```
    {
      "id": 1,
      "username": "u1@p.it",
      "name": "Admin1",
      "canDoTotp": true,
      "isTotp": false
    }
    ```
- POST `/api/login-totp`
  - **request**: json object with otp
    ```
    {
      "code": "774567"
    }
    ```
  - **response**: json object with user informations to identify user and wheter it's admin or not
    ```
    {
      "id": 1,
      "username": "u1@p.it",
      "name": "Admin1",
      "canDoTotp": true,
      "isTotp": false
    }
    ```
- GET `/api/sessions/current`
- DELETE `/api/sessions/current`
- GET `/api/posts`
  - **Response body**: JSON object with the list of posts, or description of the error(s):
    ```
    [ { "title": "First post!", "author": "admin1", "text": "This is the first post of the forum",
    "maxComments": 10, "actualComments": 2, "timesptamp": ??? }, ... ]
    ```
- GET `/api/comments`
  - request parameters and request body content
  - response body content
- ...

## Database Tables

- Table `users` - contains xx yy zz
- Table `something` - contains ww qq ss
- ...

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.png)

## Users Credentials

- username, password (plus any other requested info which depends on the text)
- username, password (plus any other requested info which depends on the text)

