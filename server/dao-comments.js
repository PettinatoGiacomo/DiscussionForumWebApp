'use strict';

/* Data Access Object (DAO) module for accessing posts data */

const db = require('./db');
const dayjs = require("dayjs");

exports.listComments = (postID, userIsLogged) => {
    
    return new Promise((resolve, reject) => {
    let sql;
    if(userIsLogged==true){
        sql = 'SELECT comments.id AS commentID, comments.text AS commentText, comments.timestamp,COALESCE(users.name, "Anonymous") AS authorName FROM comments LEFT JOIN users ON comments.authorID = users.id WHERE comments.postID = ? ORDER BY comments.timestamp DESC;';
    }else{
        sql = 'SELECT comments.id AS commentID, comments.text AS commentText, comments.timestamp,COALESCE(users.name, "Anonymous") AS authorName FROM comments LEFT JOIN users ON comments.authorID = users.id WHERE comments.postID = ? AND comments.authorID is NULL ORDER BY comments.timestamp DESC;';
    }
    db.all(sql, [postID], (err, rows) => {
      if (err) { reject(err); }
        
      if (rows === undefined) { resolve([]) }//no comments found

      resolve(rows);
    })
});
}

exports.getComment = (commentID) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT comments.id AS commentID, comments.text AS commentText, comments.timestamp, COALESCE(users.name, "Anonymous") AS authorName FROM comments LEFT JOIN users ON comments.authorID = users.id WHERE comments.id = ?';
        db.get(sql, [commentID], (err, row) => {
            if (err) { reject(err); }
            if (row === undefined) { resolve(null); } // no comment found
            resolve(row);
        });
    });
}

exports.addComment = (postID, commentText, authorID) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO comments (postID, text, authorID, timestamp) VALUES (?, ?, ?, ?)';
        const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
        db.run(sql, [postID, commentText, authorID, timestamp], function(err) {
            if (err) { reject(err); }
            console.log(`DEBUG: comment added with id ${this.lastID}`);
            resolve(exports.getComment(this.lastID));
        });
    });
}

