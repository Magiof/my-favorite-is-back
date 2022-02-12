const express = require("express");

const { Post, Tag, User } = require("../models");

const router = express.Router();

// 이미지 업로드 POST /api/post/image
router.post("/image", async (req, res, next) => {
  try {

  } catch(error) {
    console.error(error);
    next(error);
  };
});

// 포스트 작성 POST /api/post/new
router.post("/new", async (req, res, next) => {
  try {
    const { title, imageUrl, tags } = req.body;

    const post = await Post.create({
      title,
      imageUrl,
      userId: 1,  // test용으로 1번 유저 삽입
    });

    const tagCheck = await Promise.all(tags.map(tag => Tag.findOrCreate({
      where: { name: tag },
    }))); // result [ [tag {}, true], [tag {}, false] ]
    await post.addTags(tagCheck.map(tag => tag[0]));

    const newPost = await Post.findOne({
      where: { id: post.id },
      attributes: ["id", "title", "imageUrl"],
      include: [{
        model: Tag,
        attributes: ["name"],
      }, {
        model: User,
        attributes: ["id", "nickname"],
      }]
    })
    
    return res.status(201).send(newPost);
  } catch(error) {
    console.error(error);
    next(error);
  };
});

// 포스트 수정 PATCH /api/post/3
router.patch("/:postId", async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { title, tags } = req.body;

    const post = await Post.findOne({
      where: { id: postId },
      include: {
        model: Tag
      }
    });
    await post.update({  // 제목 수정
      title,
    });
    await post.removeTags(post.tags.map((tag => tag)));  // 기존 태그 삭제

    const tagCheck = await Promise.all(tags.map(tag => Tag.findOrCreate({
      where: { name: tag },
    })));
    await post.addTags(tagCheck.map(tag => tag[0]));

    const patchedPost = await Post.findOne({
      where: { id: postId },
      attributes: ["id", "title", "imageUrl"],
      include: [{
        model: Tag,
        attributes: ["name"],
      }, {
        model: User,
        attributes: ["id", "nickname"],
      }]
    })
    return res.status(200).json(patchedPost);
  } catch(error) {
    console.error(error);
    next(error);
  };
});

// 포스트 삭제 DELETE /api/post/3
router.delete("/:postId", async (req, res, next) => {
  try {
    const { postId } = req.params;

    const deletingPost = await Post.destroy({
      where: { id: postId },
    })
    if(!deletingPost) {
      return res.status(403).send("존재하지 않는 포스트입니다.");
    }

    return res.status(200).json({ result: "success" });
  } catch(error) {
    console.error(error);
    next(error);
  };
});

// 포스트 좋아요 누르기 GET /api/post/3/likes
router.get("/:postId/likes", async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.findOne({
      where: { id: postId },
    });
    const isLiking = await post.getLikers({
      where: { id: 1 },
    });
    if(isLiking) {
      return res.status(403).send("이미 좋아요를 한 포스트입니다.");
    }
    if(!post) {
      return res.status(403).send("존재하지 않는 포스트입니다.");
    };

    await post.addLikers(1); // test용으로 1번 유저 삽입

    return res.status(200).json({ result: "success" });
  } catch(error) {
    console.error(error);
    next(error);
  };
});

// 포스트 좋아요 취소 DELETE /api/post/3/likes
router.delete("/:postId/likes", async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.findOne({
      where: { id: postId },
    });
    if(!post) {
      return res.status(403).send("존재하지 않는 포스트입니다.");
    };

    await post.removeLikers(1);

    return res.status(200).json({ result: "success" });
  } catch(error) {
    console.error(error);
    next(error);
  };
});

router.post('/new', async (req, res) => {
  try {
    const { data } = req.body
    console.log(data)
    const { authorization } = req.headers
    const auth = authorization.split(' ')[1]
    const userId = jwt.decode(auth).userId
    // console.log(userId, '============', data)
    res.json({
      userId
    })
    // const nick = await User.findById(userId)
    // const nickname = nick.nickname
    // const date = new Date().toISOString()
  } catch (error) {

  }
})

module.exports = router;