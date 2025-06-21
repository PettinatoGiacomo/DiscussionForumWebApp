const SERVER_URL = 'http://localhost:3001/api/';

/**
 * A utility function for parsing the HTTP response.
 */
function getJson(httpResponsePromise) {
  // server API always return JSON, in case of error the format is the following { error: <message> } 
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok) {

         // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
         response.json()
            .then( json => resolve(json) )
            .catch( err => reject({ error: "Cannot parse server response" }))

        } else {
          // analyzing the cause of error
          response.json()
            .then(obj => 
              reject(obj)
              ) // error msg in the response body
            .catch(err => reject({ error: "Cannot parse server response" })) // something else
        }
      })
      .catch(err => 
        reject({ error: "Cannot communicate"  })
      ) // connection error
  });
}

/*** Post and comments functions ***/
/**
 * Function to get the list of posts from the server.
 */
const getPosts = async () => {
  //console.log('DEBUG: API getPosts called');
  return getJson(fetch(SERVER_URL + 'posts', { credentials: 'include' }));
};
const getComments = async (postId) => {
  //console.log('DEBUG: API getComments called');
  return getJson(fetch(SERVER_URL + 'comments/' + postId, { credentials: 'include' }));
}
const getPost = async (postId) => {
  //console.log('DEBUG: API getPost called');
  return getJson(fetch(SERVER_URL + 'post/' + postId, { credentials: 'include' }));
}

const addComment = async (id, commentText) => {
  //console.log('DEBUG: API addComment called on post ' + id + ' with text: ' + commentText);
  return getJson(fetch(SERVER_URL + 'addComment/' + id, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // this parameter specifies that authentication cookie must be forwarded
    body: JSON.stringify({ comment: commentText }),
  })
  )
};

const addPost = async (title,text,maxComments) => {
  //console.log('DEBUG: API addPost called with title: ' + title + ', text: ' + text + ', maxComments: ' + maxComments);
  return getJson(fetch(SERVER_URL + 'addPost', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // this parameter specifies that authentication cookie must be forwarded
    body: JSON.stringify({ title, text, maxComments }),
  })
  )
};

const editComment = async (commentId, commentText) => {
  //console.log('DEBUG: API editComment called with id: ' + id + ', commentId: ' + commentId + ', commentText: ' + commentText);
  return getJson(fetch(SERVER_URL + 'editComment/' + commentId, {
    method: 'PUT',//PUT is used to update an existing resource
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
    body: JSON.stringify({ comment: commentText }),
  })
  )
};

const deleteComment = async (commentId) => {
  //console.log('DEBUG: API deleteComment called with commentId: ' + commentId);
  return getJson(fetch(SERVER_URL + 'deleteComment/' + commentId, {
    method: 'DELETE',//DELETE is used to delete an existing resource
    credentials: 'include', 
  })
  )
};

const deletePost = async (postId) => {
  //console.log('DEBUG: API deletePost called with postId: ' + postId);
  return getJson(fetch(SERVER_URL + 'deletePost/' + postId, {
    method: 'DELETE',//DELETE is used to delete an existing resource
    credentials: 'include', 
  })
  )
}

const addInterestingComment = async (commentId) => {
  //console.log('DEBUG: API addInterestingComment called with commentId: ' + commentId);
  return getJson(fetch(SERVER_URL + 'addInterestingComment/' + commentId, {
    method: 'POST',//POST is used to create a new resource
    credentials: 'include', 
  })
  )
}

const getInterestingComments = async (postId) => {
  //console.log('DEBUG: API getInterestingComments called with postId: ' + postId);
  return getJson(fetch(SERVER_URL + 'interestingComments/' + postId, {
    credentials: 'include', 
  })
  ).then(data => data.map(item => item.commentID)); // return only the comment IDs
}

/*** Authentication functions ***/

/**
 * This function wants the TOTP codeconst addComment = async (id, commentText) => {
  return getJson(fetch(SERVER_URL + 'addComment/' + id, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // this parameter specifies that authentication cookie must be forwarded
    body: JSON.stringify({ comment: commentText }),
  })
  )
};
 * It executes the 2FA.
 */
const totpVerify = async (totpCode) => {
  return getJson(fetch(SERVER_URL + 'login-totp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // this parameter specifies that authentication cookie must be forwarded
    body: JSON.stringify({code: totpCode}),
  })
  )
};


/**
 * This function wants username and password inside a "credentials" object.
 * It executes the log-in.
 */
const logIn = async (credentials) => {
  return getJson(fetch(SERVER_URL + 'sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // this parameter specifies that authentication cookie must be forwarded
    body: JSON.stringify(credentials),
  })
  )
};

/**
 * This function is used to verify if the user is still logged-in.
 * It returns a JSON object with the user info.
 */
const getUserInfo = async () => {
  return getJson(fetch(SERVER_URL + 'sessions/current', {
    // this parameter specifies that authentication cookie must be forwarded
    credentials: 'include'
  })
  )
};

/**
 * This function destroy the current user's session and execute the log-out.
 */
const logOut = async() => {
  return getJson(fetch(SERVER_URL + 'sessions/current', {
    method: 'DELETE',
    credentials: 'include'  // this parameter specifies that authentication cookie must be forwarded
  })
  )
}

const API = {logIn, getUserInfo, logOut, totpVerify, getPosts, getComments, getPost, addComment, addPost, editComment, deleteComment, deletePost, addInterestingComment, getInterestingComments};
export default API;
