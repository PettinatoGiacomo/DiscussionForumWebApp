'use strict';

/* Data Access Object (DAO) module for accessing posts data */

const db = require('./db');

// This function retrieves the whole list of posts from the database.
exports.listPosts = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT posts.*, users.name AS authorName, COUNT(comments.id) AS numComments FROM posts JOIN users ON posts.userID = users.id LEFT JOIN comments ON posts.id = comments.postID GROUP BY posts.id ORDER BY posts.timestamp DESC;';
    db.all(sql, [], (err, rows) => {
      if (err) { reject(err); }
      /*
      const posts = rows.map((e) => {
        const post = convertPostFromDbRecord(e);
        return post;
      });

      resolve(posts);*/
      resolve(rows);
    });
  });
};

exports.getPost = (postId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT posts.*, users.name AS authorName, COUNT(comments.id) AS numComments FROM posts JOIN users ON posts.userID = users.id LEFT JOIN comments ON posts.id = comments.postID WHERE posts.id=?;';
    db.get(sql, [postId], (err, row) => {
      if (err) { reject(err); }
      if (row.id === undefined || row.id===null) { resolve({ error: 'Post not found.' }); }

      const post= row;
      resolve(post);
    });
  });
}

exports.createPost = (post) => {
  if (post.maxComments === undefined || post.maxComments === null) {
    post.maxComments = null; // Default value if not provided
  }

  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO posts (title, text, userID, timestamp, maxComments) VALUES (?, ?, ?, ?, ?);';
    db.run(sql, [post.title, post.text, post.userID, post.timestamp, post.maxComments], function (err) {
      if (err) { reject(err); }
      resolve(exports.getPost(this.lastID));
    });
  });
};

exports.getMaxComments = (postId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT maxComments FROM posts WHERE id=?;';
    db.get(sql, [postId], (err, row) => {
      if (err) { reject(err); }
      if (row === undefined) { resolve({ error: 'Post not found.' }); }
      else {
        resolve(row.maxComments);
      }
    });
  });
};

exports.deletePost = (postID, userID) => {
    if (userID === null) {//null -> the user is logged with TOPT no further checks needed
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM posts WHERE id = ?';
            db.run(sql, [postID], function (err) {
                if (err) { reject(err); }
                resolve(this.changes > 0); // returns true if a row was deleted
            });
        });
    } else {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM posts WHERE id = ? AND userID = ?';
            db.run(sql, [postID, userID], function (err) {
                if (err) { reject(err); }
                resolve(this.changes > 0); // returns true if a row was deleted
            });
        });
    }
}