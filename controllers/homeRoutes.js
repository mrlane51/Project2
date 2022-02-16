const router = require('express').Router();
const { BlogPost, User } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', async (req, res) =>{
    try {
        const blogData = await BlogPost.findAll({
            include: [
                {
                    model: User,
                    attributes: ['name']
                },
            ],
        });
        //serializing the data
        const blogPosts = blogData.map((blogPost) => blogPost.get({ plain: true }));

        res.render('homepage', {
            blogPosts,
            //should we have the user logged in here?
            logged_in: req.session.logged_in
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/blog_post/:id', async (req, res) => {
    try {
        const blogData = await BlogPost.findByPk(req.params.id, {
            include: [
                {
                model: User,
                attributes: ['name']
                },
            ],
        });
    const blogPost = blogData.get({ plain:true });

    res.render('blog_post', {
        blogPost,
        
        logged_in: req.session.logged_in
    });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/blogForm', withAuth, async(req,res) =>{
    console.log('this is the blogForm route')
    if (!req.session.logged_in) {
        res.redirect('/login');
        return;
    }
    res.render('blogForm');
});

//DO WE ADD A USER PROFILE PAGE ROUTE HERE?
router.get('/login', (req, res) => {
    if (req.session.logged_in) {
        res.redirect('/');
        return;
    }

    res.render('login');
});

router.post('/comment', async (req,res) => {
    console.log ('this is the comment route')
        try {
            const commentData = await Comments.create({
            ...req.body,
            user_id: req.session.user_id,
        });
        res.status(200).json({message: "comment successfully created"});
    } catch (err) {
        res.status(400).json({ message: "error posting comment"})
    }
})

router.post('/logout', (req, res) => {
    console.log('logout route before if statement')
    if (req.session.logged_in) {
        req.session.destroy(() => {
            //CAN I CREATE A LOGOUT MESSAGE HERE IN JSON???
            res.status(204).end();
        });
    } else {
        res.status(404).end();
    }
});



module.exports = router;