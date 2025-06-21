import { useState, useEffect } from 'react';
import { Container, Col, Button, Card, Row, Form, Alert } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router';

import API from '../API.js';

function PostsListLayout(props) {
    const [posts, setPosts] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        //console.log('DEBUG: PostsListLayout useEffect called');
        const fetchPosts = async () => {
            try {
                const postsData = await API.getPosts();
                setPosts(postsData);
            } catch (err) {
                setErrorMessage('Error fetching posts: ' + err.message);
            }
        };
        fetchPosts();
    }, []);

    const handleDeletePost = (postId) => {
        API.deletePost(postId)
            .then(() => {
                setPosts(posts.filter(post => post.id !== postId));//note in this layout there are no comments to delete
            })
            .catch((err) => {
                setErrorMessage('Error deleting post: ' + err.message);
            });
    }

    return (<Container>
        {errorMessage ? <Alert variant='danger' dismissible onClick={() => setErrorMessage('')}>{errorMessage}</Alert> : ''}
        {posts.map(post => (

            <Card key={post.id} className="my-2">
                <Card.Header className="bg-dark text-white">
                    <Col>
                        <Card.Title>{post.title}</Card.Title>
                        <Card.Subtitle className="mb-2 text-white">  {post.timestamp}<br />{post.authorName}</Card.Subtitle>
                    </Col>
                </Card.Header>
                <Card.Body>
                    <Card.Text as="pre">{post.text}</Card.Text>

                </Card.Body>
                <Card.Footer>
                    <Link to={`/post/${post.id}`}>
                        <Card.Text>Comments: {post.numComments}/{post.maxComments}</Card.Text>
                    </Link>
                    {(props.loggedInTotp || (props.user && (props.user.id === post.userID))) &&
                        <Row>
                            <Col><Button onClick={() => handleDeletePost(post.id)}><i className="bi bi-trash"></i></Button></Col>
                        </Row>}
                </Card.Footer>
            </Card>

        ))
        }
    </Container >);
}



function CommentsLayout(props) {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newCommentText, setCommentText] = useState('');
    const { id } = useParams();
    const [errorMessage, setErrorMessage] = useState('');
    const [editedComment, setEditedComment] = useState(-1); // State to track what's the comment being edited
    const [editedCommentText, setEditedCommentText] = useState(''); // State to track the text of the comment being edited
    const [dirtyBit, setDirtyBit] = useState(false); //when true load comments (in case other users added comments meanwhile)

    useEffect(() => {
        //console.log('DEBUG: CommentsLayout useEffect called');
        const fetchPost = async () => {
            try {
                const postData = await API.getPost(id);
                setPost(postData);
                let commentsData = await API.getComments(id);
                if (props.loggedIn) {
                    const interestingID = new Set(await API.getInterestingComments(id));
                    //console.log('DEBUG: interestingID: ' + JSON.stringify(interestingID));
                    commentsData = commentsData.map(comment => ({
                        ...comment,
                        interesting: interestingID.has(comment.commentID)
                    }));
                }
                setComments(commentsData);

            } catch (err) {
                setErrorMessage('Error fetching post or comments: ' + err.message);
            }
        };
        fetchPost();
        setDirtyBit(false); // Reset dirty bit after fetching comments

    }, [id, dirtyBit]);//useEffect will run when the component mounts and when the id changes


    const handleAddComment = (event) => {
        event.preventDefault();
        setDirtyBit(true); // Set dirty bit to true to fetch comments after adding a new comment
        API.addComment(id, newCommentText)
            .then((newComment) => {
                setComments([newComment, ...comments]);
                setDirtyBit(true); // Set dirty bit to true to fetch comments after adding a new comment
            })
            .catch((err) => {
                setErrorMessage('Error adding comment: ' + err.message);
            });
        setCommentText(''); // Clear the input field
    }
    const handleShowEditCommentForm = (commentID) => {
        setEditedComment(commentID);
        setEditedCommentText(comments.find(c => c.commentID === commentID).commentText); // Set the text of the comment being edited
    }

    const handleSubmitEditComment = (event) => {
        event.preventDefault();
        console.log('DEBUG: handleSubmitEditComment called with commentID: ' + editedComment + ' and text: ' + editedCommentText);
        API.editComment(editedComment, editedCommentText)
            .then(() => {
                setComments(comments.map(c => c.commentID === editedComment ? { ...c, commentText: editedCommentText } : c));
                setEditedComment(-1); // Reset the edited comment state
                setEditedCommentText(''); // Clear the text input
            })
            .catch((err) => {
                setErrorMessage('Error editing comment: ' + err.message);
            });
    }

    const handleDeleteComment = (commentID) => {
        API.deleteComment(commentID)
            .then(() => {
                setComments(comments.filter(comment => comment.commentID !== commentID));
            })
            .catch((err) => {
                setErrorMessage('Error deleting comment: ' + err.message);
            });
        setDirtyBit(true); // Set dirty bit to true to fetch comments after deleting a comment
    }

    const handleAddInterestingComment = (commentID) => {
        API.addInterestingComment(commentID)
            .then(() => {
                setComments(comments.map(comment => comment.commentID === commentID ? { ...comment, interesting: true } : comment));
            })
            .catch((err) => {
                setErrorMessage('Error adding interesting comment: ' + err.message);
            });
    }

    if (!post) return <div>Loading...</div>;

    return (
        <Container>
            {errorMessage ? <Alert variant='danger' dismissible onClick={() => setErrorMessage('')}>{errorMessage}</Alert> : ''}
            <Card key={post.id} className="my-2">
                <Card.Header className="bg-dark text-white">
                    <Card.Title>{post.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-white">
                        {post.timestamp}<br />{post.authorName}
                    </Card.Subtitle>
                </Card.Header>
                <Card.Body>
                    <Card.Text as="pre">{post.text}</Card.Text>
                </Card.Body>
                <Card.Footer>
                    <Card.Text >Comments: {post.numComments}/{post.maxComments}</Card.Text>
                </Card.Footer>
            </Card>

            {(post.maxComments == null || post.numComments < post.maxComments) && <AddCommentForm handleAddComment={handleAddComment} newCommentText={newCommentText} setCommentText={setCommentText}></AddCommentForm>}

            {comments.map(comment => (
                <Card key={comment.commentID} className="mb-3 shadow-sm">
                    <Card.Body>
                        <Row>
                            <Col>{comment.authorName}:</Col>

                            <Col className="text-end">{comment.timestamp}</Col>

                        </Row>
                        <Row>
                            {
                                (editedComment === comment.commentID)
                                    ?
                                    (
                                        <Form className="mb-3" onSubmit={handleSubmitEditComment}>
                                            <Form.Control as="textarea" rows={2} value={editedCommentText} onChange={(e) => setEditedCommentText(e.target.value)} />
                                            <Button className='my-2' type='submit'>Edit</Button>
                                        </Form>
                                    )
                                    :
                                    (
                                        <>
                                            <Col><pre>{comment.commentText}</pre></Col>

                                        </>
                                    )
                            }
                            <Col className="text-end">
                                {/* since we don't have a userID in comments we check the name of the user */}
                                {(props.loggedInTotp || (props.user && (props.user.name === comment.authorName))) && (
                                    <>
                                            <Button onClick={() => handleShowEditCommentForm(comment.commentID)}><i className="bi bi-pencil-square"></i></Button>
                                            <Button onClick={() => handleDeleteComment(comment.commentID)}><i className="bi bi-trash"></i></Button>
                                    </>
                                )}
                                {props.loggedIn && (
                                    comment.interesting ? (
                                        <Button variant="success" disabled><i className="bi bi-flag-fill"></i></Button>
                                    ) : (
                                        <Button variant="outline-success" onClick={() => handleAddInterestingComment(comment.commentID)}><i className="bi bi-flag"></i></Button>
                                    )
                                )}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            ))
            }
        </Container>
    )
}

function AddCommentForm(props) {
    return (
        <Form onSubmit={props.handleAddComment}>
            <Row>
                <Col >
                    <Form.Group className="mb-3" controlId="commentText">
                        <Form.Control as="textarea" rows={2} placeholder="Write your comment here..." value={props.newCommentText} onChange={(e) => props.setCommentText(e.target.value)} />
                    </Form.Group>
                </Col>
                <Col xs="auto">
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Col>
            </Row>
        </Form>
    )
}

function CreatePostForm(props) {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [maxComments, setMaxComments] = useState(10); // Default max comments
    const [errorMessage, setErrorMessage] = useState('');
    const [enableMaxComments, setEnableMaxComments] = useState(false); // State to track if max comments input is enabled
    const navigate = useNavigate();
    const handlePostCreation = (event) => {
        event.preventDefault();
        //console.log('DEBUG: CreatePostForm handlePostCreation called with title: ' + title + ', text: ' + text + ', maxComments: ' + maxComments);
        if (enableMaxComments === false) {
            API.addPost(title, text, -1) // -1 means no limit on comments
                .then(() => {
                    navigate('/');
                })
                .catch((err) => {
                    setErrorMessage('Error creating post: ' + err.message);
                });
        } else {
            API.addPost(title, text, maxComments)
                .then(() => {
                    navigate('/');
                })
                .catch((err) => {
                    setErrorMessage('Error creating post: ' + err.message);
                });
        }
    }
    return (
        <Row>
            {errorMessage ? <Alert variant='danger' dismissible onClick={() => setErrorMessage('')}>{errorMessage}</Alert> : ''}
            <Col xs={4}></Col>
            <Col xs={4}>
                <Form onSubmit={handlePostCreation}>
                    <Form.Group>
                        <Form.Control as="textarea" rows={1} placeholder='Insert here the title' value={title} onChange={(e) => setTitle(e.target.value)} className="mb-2" />
                        <Form.Control as="textarea" rows={5} placeholder='Insert here the text' value={text} onChange={(e) => setText(e.target.value)} className="mb-2" />
                        <Form.Check
                            type="checkbox"
                            id="enable-max-comments"
                            label="Set a maximum number of comments"
                            checked={enableMaxComments}
                            onChange={(e) => setEnableMaxComments(e.target.checked)}
                            className="mb-2"
                        />

                        <Form.Control
                            type="number"
                            min={0}
                            value={maxComments}
                            onChange={(e) => setMaxComments(e.target.value)}
                            className="mb-2"
                            placeholder="Maximum number of comments"
                            disabled={!enableMaxComments}
                        />

                    </Form.Group>
                    <Form.Group>
                        <Row>
                            <Col>
                                <Button variant="primary" type="submit">Submit</Button>
                                <Link to="/"><Button variant="danger" >Cancel</Button></Link>
                            </Col>
                        </Row>
                    </Form.Group>
                </Form>
            </Col>
            <Col xs={4}></Col>
        </Row>
    )
}


export { PostsListLayout, CommentsLayout, CreatePostForm };