import { Request, Response } from 'express'
import catchAsync from '../../../shared/catchAsync'
import { PostServices } from './post.service'
import sendResponse from '../../../shared/sendResponse'
import { StatusCodes } from 'http-status-codes'
import pick from '../../../shared/pick'

const createPost = catchAsync(async (req: Request, res: Response) => {
    const result = await PostServices.createPost(req.user!, req.body)
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Post created successfully',
        data: result,
    })
})

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
    const query = pick(req.query, ['searchTerm'])
    const paginationOptions = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder'])

    const result = await PostServices.getAllPosts(query, paginationOptions)

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Posts retrieved successfully',
        meta: result.meta,
        data: result.data,
    })
})

const toggleLike = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const result = await PostServices.toggleLike(req.user!, id)
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Like toggled successfully',
        data: result,
    })
})

const addComment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const { content } = req.body
    const result = await PostServices.addComment(req.user!, id, content)
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Comment added successfully',
        data: result,
    })
})

const getMyPosts = catchAsync(async (req: Request, res: Response) => {
    const paginationOptions = pick(req.query, [
        'page',
        'limit',
        'sortBy',
        'sortOrder',
    ])

    const result = await PostServices.getMyPosts(req.user!, paginationOptions)

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'My posts retrieved successfully',
        meta: result.meta,
        data: result.data,
    })
})

export const PostController = {
    createPost,
    getAllPosts,
    toggleLike,
    addComment,
    getMyPosts,
}
