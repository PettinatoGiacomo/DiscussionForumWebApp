'use strict';

const express = require('express');
const morgan = require('morgan');  // logging middleware
const { check, validationResult, oneOf } = require('express-validator'); // validation middleware
const cors = require('cors');
const dayjs = require("dayjs");

const postDao = require('./dao-posts'); // module for accessing the posts table in the DB
const userDao = require('./dao-users'); // module for accessing the user table in the DB
const commentDao = require('./dao-comments'); // module for accessing the comments table in the DB

// init express
const app = new express();
app.use(morgan('dev'));
app.use(express.json());

/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

/*enable foreign keys to allow cascading deletes*/
const db = require('./db');
db.run('PRAGMA foreign_keys = ON;');

/*** Passport ***/

/** Authentication-related imports **/
const passport = require('passport');                              // authentication middleware
const LocalStrategy = require('passport-local');                   // authentication strategy (username and password)

const base32 = require('thirty-two');
const TotpStrategy = require('passport-totp').Strategy; // totp

/** Set up authentication strategy to search in the DB a user with a matching password.
 * The user object will contain other information extracted by the method userDao.getUser (i.e., id, username, name).
 **/
passport.use(new LocalStrategy(async function verify(username, password, callback) {
  const user = await userDao.getUser(username, password)
  if(!user)
    return callback(null, false, 'Incorrect username or password');  
    
  return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUser, i.e, id, username, name)
}));

// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, callback) { // this user is id + username + name 
  callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, callback) { // this user is id + email + name 
  // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
  // e.g.: return userDao.getUserById(id).then(user => callback(null, user)).catch(err => callback(err, null));

  return callback(null, user); // this will be available in req.user
});

/** Creating the session */
const session = require('express-session');

app.use(session({
  secret: "DWopmBwlDmpX752tP2Iaa97gJ2MOa7hf",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

passport.use(new TotpStrategy(
  function (user, done) {
    // In case .secret does not exist, decode() will return an empty buffer
    return done(null, base32.decode(user.secret), 30);  // 30 = period of key validity
  })
);

/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

function isTotp(req, res, next) {
  if(req.session.method === 'totp')
    return next();
  return res.status(401).json({ error: 'Missing TOTP authentication'});
}

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};

async function maxCommentsReached(postID) {
  const max = await postDao.getMaxComments(postID);
  if (max === null) return false; // no max comments set, so no limit
  const count = await commentDao.getCommentCount(postID);
  //(`DEBUG: maxCommentsReached: postID=${postID}, max=${Number(max)}, count=${Number(count)}`);
  //console.log(`DEBUG: maxCommentsReached: ${Number(count) >= Number(max)}`);
  return Number(count) >= Number(max);
}

/*** Users APIs ***/

function clientUserInfo(req) {
  const user=req.user;
	return {id: user.id, username: user.username, name: user.name, canDoTotp: user.secret? true: false, isTotp: req.session.method === 'totp'};
}

// POST /api/sessions 
// This route is used for performing login.
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => { 
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json({ error: info});
      }
      // success, perform the login and extablish a login session
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUser() in LocalStratecy Verify Fn
        return res.json(clientUserInfo(req));
      });
  })(req, res, next);
});

app.post('/api/login-totp', isLoggedIn,
  // DEBUG: function(req,res,next){ console.log('DEBUG2: '+JSON.stringify(req.user)); next();},
  passport.authenticate('totp'),   // passport expect the totp value to be in: body.code
  function(req, res) {
    //console.log('DEBUG1: '+JSON.stringify(req.user));
    req.session.method = 'totp';
    res.json({otp: 'authorized'});
  }
);

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(clientUserInfo(req));}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});

/*** API for posts and comments ***/
app.get('/api/posts',(req,res)=>{
  postDao.listPosts()
    .then(posts => res.json(posts))
    .catch((err) => res.status(500).json(err))
})
//TODO: POSTID is undefined???
app.get('/api/comments/:postID',[ check('postID').isInt({min: 1}) ],(req,res)=>{
  const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
    }
  //console.log('DEBUG: isLoggedIn: '+req.isAuthenticated());
  commentDao.listComments(req.params.postID,req.isAuthenticated())
    .then(comments => res.json(comments))
    .catch((err) => res.status(500).json(err))

})

app.get('/api/post/:postID', [ check('postID').isInt({min: 1}) ], (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json( errors.errors );
  }
  postDao.getPost(req.params.postID)
    .then(post => res.json(post))
    .catch((err) => res.status(500).json(err))
});

app.post('/api/addComment/:postID',
  check('comment').isLength({ min: 1 }),
  (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.errors);
  }
  let author = req.isAuthenticated() ? req.user.id : null;

  maxCommentsReached(req.params.postID)
    .then(reached => {
      if (reached) {
        return res.status(403).json({ error: 'Maximum number of comments reached for this post.' });
      }
      return commentDao.addComment(req.params.postID, req.body.comment, author)
        .then(comment => res.json(comment));
    })
    .catch(err => res.status(500).json(err));
});

app.post('/api/addPost', isLoggedIn, [
  check('title').isLength({ min: 1 }),
  check('text').isLength({ min: 1 }),
  check('maxComments').isInt({ min: -1 })// -1 -> no limit 0 -> no comments allowed
], (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json( errors.errors );
  }

  let post = {
    title: req.body.title,
    text: req.body.text,
    userID: req.user.id, 
    timestamp:  dayjs().format('YYYY-MM-DD HH:mm:ss').toString() // current time
  };

  if (req.body.maxComments !== undefined) {
    if (req.body.maxComments < 0) {
      post.maxComments = null; // no limit
    } else {
      post.maxComments = req.body.maxComments; // set the max comments
    }
  }

  postDao.createPost(post)
    .then(result => res.status(201).json(result))
    .catch((err) => res.status(500).json(err));
});

app.put('/api/editComment/:commentID', isLoggedIn, [], (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.errors);
  }

  const commentID = req.params.commentID;
  const commentText = req.body.comment;
  let userID = req.user.id;
  if (req.session.method === 'totp') {
    userID = null; // if the user is logged in with TOTP, we do not check the userID, so we set it to null
  }
  commentDao.updateComment(commentID, commentText, userID)
    .then(result => {
      if (result === null) {
        return res.status(403).json({ error: 'You are not the author of this comment.' });
      }
      res.status(200).json(result);
    })
    .catch(err => res.status(500).json(err));
});

app.delete('/api/deleteComment/:commentID', isLoggedIn, (req, res) => {
  //console.log('DEBUG: deleteComment called with commentID: ' + req.params.commentID);
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.errors);
  }

  const commentID = req.params.commentID;
  let userID = req.user.id;
  if (req.session.method === 'totp') {
    userID = null; // if the user is logged in with TOTP, we do not check the userID, so we set it to null
  }
  
  commentDao.deleteComment(commentID, userID)
    .then(result => {
      if (result === null) {
        return res.status(403).json({ error: 'You are not the author of this comment.' });
      }
      res.status(200).json(result);
    })
    .catch(err => res.status(500).json(err));
});

app.delete('/api/deletePost/:postID', isLoggedIn, (req, res) => {
  console.log('DEBUG: deletePost called with postID: ' + req.params.postID);
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.errors);
  }

  const postID = req.params.postID;
  let userID = req.user.id;
  if (req.session.method === 'totp') {
    userID = null; // if the user is logged in with TOTP, we do not check the userID, so we set it to null
  }
  
  postDao.deletePost(postID, userID)
    .then(result => {
      if (result === null) {
        return res.status(403).json({ error: 'You are not the author of this post.' });
      }
      res.status(200).json(result);
    })
    .catch(err => res.status(500).json(err));
}
);

app.get('/api/interestingComments/:postID', isLoggedIn, (req, res) => {
  commentDao.getInterestingComments(req.params.postID, req.user.id)
    .then(comments => res.json(comments))
    .catch((err) => res.status(500).json(err));
});

app.post('/api/addInterestingComment/:commentID', isLoggedIn, (req, res) => {
  const commentID = req.params.commentID;
  const userID = req.user.id;

  commentDao.addInterestingComment(commentID, userID)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json(err));
});

// activate the server
const port = 3001;
app.listen(port, (err) => {
  if (err)
    console.log(err);
  else 
    console.log(`Server listening at http://localhost:${port}`);
});

