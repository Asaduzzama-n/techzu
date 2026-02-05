import express from 'express'
import auth from '../../middleware/auth'
import validateRequest from '../../middleware/validateRequest'
import { PostValidation } from './post.validation'
import { PostController } from './post.controller'
import { USER_ROLES } from '../../../enum/user'

const router = express.Router()

router.post(
    '/',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    validateRequest(PostValidation.createPostZodSchema),
    PostController.createPost,
)

router.get(
    '/',
    PostController.getAllPosts,
)

router.get(
    '/my-posts',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    PostController.getMyPosts,
)

router.post(
    '/:id/like',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    PostController.toggleLike,
)

router.post(
    '/:id/comment',
    auth(USER_ROLES.USER, USER_ROLES.ADMIN),
    validateRequest(PostValidation.addCommentZodSchema),
    PostController.addComment,
)

export const PostRoutes = router
