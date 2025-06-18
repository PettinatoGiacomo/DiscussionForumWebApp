'use strict';

/* Data Access Object (DAO) module for accessing posts data */

const db = require('./db');
const dayjs = require("dayjs");

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
      if (row === undefined) { resolve({ error: 'Post not found.' }); }

      const post= row;
      resolve(post);
    });
  });
}