'use strict';

/* Data Access Object (DAO) module for accessing posts data */

const db = require('./db');
const dayjs = require("dayjs");

exports.listComments = (postID, userIsLogged) => {

    return new Promise((resolve, reject) => {
        let sql;
        if (userIsLogged == true) {
            sql = 'SELECT comments.id AS commentID, comments.text AS commentText, comments.timestamp,COALESCE(users.name, "Anonymous") AS authorName FROM comments LEFT JOIN users ON comments.authorID = users.id WHERE comments.postID = ? ORDER BY comments.timestamp DESC;';
        } else {
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
        db.run(sql, [postID, commentText, authorID, timestamp], function (err) {
            if (err) { reject(err); }
            resolve(exports.getComment(this.lastID));
        });
    });
}

exports.getCommentCount = (postID) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT COUNT(*) AS count FROM comments WHERE postID = ?';
        db.get(sql, [postID], (err, row) => {
            if (err) { reject(err); }
            resolve(row.count);
        });
    });
}

exports.updateComment = (commentID, commentText, authorID) => {
    if (authorID === null) {//null -> the user is logged with TOPT no further checks needed

        return new Promise((resolve, reject) => {
            const sql = 'UPDATE comments SET text = ? WHERE id = ?';
            db.run(sql, [commentText, commentID], function (err) {
                if (err) { reject(err); }
                if (this.changes === 0) { resolve(null); } // no rows updated
                resolve(exports.getComment(commentID));
            });
        });
    } else {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE comments SET text = ? WHERE id = ? AND authorID = ?';
            db.run(sql, [commentText, commentID, authorID], function (err) {
                if (err) { reject(err); }
                if (this.changes === 0) { resolve(null); } // no rows updated
                resolve(exports.getComment(commentID));
            });
        });
    }
}

exports.deleteComment = (commentID, userID) => {
    if (userID === null) {//null -> the user is logged with TOPT no further checks needed
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM comments WHERE id = ?';
            db.run(sql, [commentID], function (err) {
                if (err) { reject(err); }
                resolve(this.changes > 0); // returns true if a row was deleted
            });
        });
    } else {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM comments WHERE id = ? AND authorID = ?';
            db.run(sql, [commentID, userID], function (err) {
                if (err) { reject(err); }
                resolve(this.changes > 0); // returns true if a row was deleted
            });
        });
    }
}

exports.getInterestingComments = (postID, userID) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT comments.id AS commentID FROM interestingComments LEFT JOIN comments ON interestingComments.commentID = comments.id WHERE comments.postID = ? AND interestingComments.userID = ?';
        db.all(sql, [postID, userID], (err, rows) => {
            if (err) { reject(err); }
            resolve(rows);
        });
    });
}

exports.addInterestingComment = (commentID, userID) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO interestingComments (commentID, userID) VALUES (?, ?)';
        db.run(sql, [commentID, userID], function (err) {
            if (err) { reject(err); }
            resolve(this.changes > 0); // returns true if a row was inserted
        });
    });
}

exports.deleteInterestingComment = (commentID, userID) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM interestingComments WHERE commentID = ? AND userID = ?';
        db.run(sql, [commentID, userID], function (err) {
            if (err) { reject(err); }
            resolve(this.changes > 0); // returns true if a row was deleted
        });
    });
}

exports.getNumberOfInterestingComments = (postID) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT comments.id AS commentID,  COUNT(interestingComments.userID) AS numInteresting FROM comments LEFT JOIN interestingComments ON comments.id = interestingComments.commentID WHERE comments.postID = ? GROUP BY comments.id';
        db.all(sql, [postID], (err, rows) => {
            if (err) { reject(err); }
            resolve(rows);
        });
    });
}