BEGIN TRANSACTION;

PRAGMA foreign_keys = ON;--enable foreign keys

CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER NOT NULL,
	"email"	TEXT NOT NULL,
	"name"	TEXT,
	"hash"	TEXT NOT NULL,
	"salt"	TEXT NOT NULL,
	"secret" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
INSERT INTO "users" VALUES (1,'u1@p.it','Admin1','ab6a7e820f9ffeb5426a8244eb5981281a7757ff1063f897859c7bb3a69bed99','emmhajs8jcijs4bv','LXBSMDTMSP2I5XFXIYRGFVWSFI');
INSERT INTO "users" VALUES (2,'u2@p.it','Admin2','45189136d40eebd23c859b8703414d689a5521e22912bb541ecff7ed293ef8e8','88o7o6oru4cdh6kv','LXBSMDTMSP2I5XFXIYRGFVWSFI');
INSERT INTO "users" VALUES (3,'u3@p.it','User1','13200da65996d56293b92f1a33f68708bc0f28c51fcd642045dbe09b6e88231a','o4n2f06q6lbmgh0u','');
INSERT INTO "users" VALUES (4,'u4@p.it','User2','4153ffb2436448e674ef9f02b78912d8e6cbc48239e11e16ec160c12637b9938','pp3nnb8vdy14w3xw','');
INSERT INTO "users" VALUES (5,'u5@p.it','User3','8832b1b39455635e06cdd264e31a7457a6333d639c5fb5ba0784a3b0db7e2865','r0ec4ejy7c2g4ujv','');

CREATE TABLE IF NOT EXISTS "posts" (
	"id"	INTEGER NOT NULL,
	"userID"	INTEGER NOT NULL,
	"title"	TEXT NOT NULL,
	"text"	TEXT NOT NULL,
	"maxComments"	INTEGER NOT NULL,
	"timestamp"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
	FOREIGN KEY (userID) REFERENCES users(id)
);

INSERT INTO posts (userID, title, text, maxComments, timestamp) VALUES
(1, 'Welcome to the Blog', 'This is the very first post. Stay tuned for more content!', 20, '2025-06-08 10:00:00'),
(2, 'Tips for Remote Work', 'Here are some tips that helped me stay productive while working from home.', 15, '2025-06-08 11:15:00'),
(3, 'Top 10 JavaScript Libraries in 2025', 'Check out my list of must-know JS libraries for web devs.', 30, '2025-06-08 12:45:00'),
(4, 'Why I Switched to Linux', 'After years on Windows, I finally made the switch. Here''s why.', 25, '2025-06-08 14:00:00'),
(5, 'The Future of AI', 'Let''s discuss where AI is headed and its impact on society.', 40, '2025-06-08 15:30:00'),
(2, 'Book Review: Deep Work', 'A quick review of Cal Newport''s book on focus and productivity.', 10, '2025-06-08 16:20:00'),
(1, 'How to Start a Blog in 2025', 'Step-by-step guide for launching a blog with modern tools.', 18, '2025-06-08 17:05:00'),
(3, 'Minimalist Coding Setup', 'Here''s my take on the best tools for distraction-free coding.', 22, '2025-06-08 18:00:00'),
(4, 'What I Learned from 100 Days of Code', 'Reflections and takeaways from the 100-day coding challenge.', 35, '2025-06-08 19:30:00'),
(5, 'Dark Mode vs Light Mode', 'Which UI theme do you prefer and why? Let''s debate.', 28, '2025-06-08 20:10:00');

CREATE TABLE IF NOT EXISTS "comments" (
	"id"	INTEGER NOT NULL,
	"postID"	INTEGER NOT NULL,
	"authorID"	INTEGER,
	"text"	TEXT NOT NULL,
	"timestamp"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
	FOREIGN KEY (authorID) REFERENCES users(id)
	FOREIGN KEY (postID) REFERENCES posts(id)
);

INSERT INTO comments (postID, authorID, text, timestamp) VALUES
(1, 2, 'Excited to see where this blog goes. Great start!', '2025-06-08 10:05:00'),
(1, 3, 'Looking forward to more posts!', '2025-06-08 10:10:00'),
(2, 1, 'Totally agree—remote work needs structure.', '2025-06-08 11:20:00'),
(2, 5, 'I’d add taking breaks as a tip!', '2025-06-08 11:25:00'),
(3, 4, 'React and D3 are definitely top picks!', '2025-06-08 12:50:00'),
(3, 2, 'I think Svelte deserves a spot too.', '2025-06-08 13:00:00'),
(4, 1, 'Linux gives you so much control—good call!', '2025-06-08 14:05:00'),
(5, 3, 'AI ethics is such an important topic. Thanks for sharing.', '2025-06-08 15:35:00'),
(5, 2, 'I wonder how regulation will catch up.', '2025-06-08 15:45:00'),
(6, 4, '“Deep Work” changed how I schedule my day.', '2025-06-08 16:25:00'),
(7, 5, 'This guide is super helpful. Thanks!', '2025-06-08 17:10:00'),
(8, 1, 'Love the idea of a minimalist setup. Less is more!', '2025-06-08 18:05:00'),
(9, 2, 'Congrats on finishing 100 Days of Code!', '2025-06-08 19:35:00'),
(10, 3, 'Team Dark Mode all the way!', '2025-06-08 20:15:00'),
(10, 4, 'I actually prefer Light Mode for readability.', '2025-06-08 20:18:00'),
(1, NULL, 'Anonymous here—great kickoff post!', '2025-06-08 10:30:00'),
(2, NULL, 'Nice advice, bookmarking this for later.', '2025-06-08 11:40:00'),
(3, NULL, 'Interesting list! Might try some of these soon.', '2025-06-08 13:15:00'),
(4, NULL, 'I’ve been thinking about switching to Linux too.', '2025-06-08 14:30:00'),
(5, NULL, 'AI is evolving so fast—it’s mind-blowing.', '2025-06-08 15:50:00Z'),
(6, NULL, 'Heard great things about “Deep Work”—adding to my list.', '2025-06-08 16:40:00'),
(7, NULL, 'Just what I needed to read today. Thanks!', '2025-06-08 17:20:00'),
(8, NULL, 'Minimalist setups really boost my focus too.', '2025-06-08 18:10:00'),
(9, NULL, 'Congrats! I’m on day 42 right now.', '2025-06-08 19:40:00Z'),
(10, NULL, 'I switch themes depending on time of day!', '2025-06-08 20:25:00');

CREATE UNIQUE INDEX IF NOT EXISTS unique_post_per_user 
ON posts(userID, timestamp);

CREATE UNIQUE INDEX IF NOT EXISTS unique_comment_per_user 
ON comments(authorID, timestamp);

COMMIT;
