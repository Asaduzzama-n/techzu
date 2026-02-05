import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { IPost } from './post.interface'
import { Post } from './post.model'
import { IPaginationOptions } from '../../../interfaces/pagination'
import { paginationHelper } from '../../../helpers/paginationHelper'
import { SortOrder, Types } from 'mongoose'
import { User } from '../user/user.model'
import { sendNotification } from '../../../helpers/notificationHelper'
import { JwtPayload } from 'jsonwebtoken'

const createPost = async (user: JwtPayload, payload: IPost) => {
    payload.author = user.authId
    const result = await Post.create(payload)
    return result
}

const getAllPosts = async (
    query: any,
    paginationOptions: IPaginationOptions,
) => {
    const { searchTerm, username, ...filterData } = query
    const { page, limit, skip, sortBy, sortOrder } =
        paginationHelper.calculatePagination(paginationOptions)

    const andConditions = []

    if (searchTerm) {
        andConditions.push({
            content: {
                $regex: searchTerm,
                $options: 'i',
            },
        })
    }



    if (Object.keys(filterData).length) {
        andConditions.push({
            $and: Object.entries(filterData).map(([field, value]) => ({
                [field]: value,
            })),
        })
    }

    const sortConditions: { [key: string]: SortOrder } = {}
    if (sortBy && sortOrder) {
        sortConditions[sortBy] = sortOrder
    }

    const whereConditions =
        andConditions.length > 0 ? { $and: andConditions } : {}

    const result = await Post.find(whereConditions)
        .populate('author', 'name profile')
        .populate('comments.user', 'name profile')
        .sort(sortConditions)
        .skip(skip)
        .limit(limit)

    const total = await Post.countDocuments(whereConditions)

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: result,
    }
}

const toggleLike = async (user: JwtPayload, postId: string) => {
    const post = await Post.findById(postId)
    if (!post) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found')
    }

    const isLiked = post.likes.includes(user.authId)
    let result

    if (isLiked) {
        result = await Post.findByIdAndUpdate(
            postId,
            { $pull: { likes: user.authId } },
            { new: true },
        )
    } else {
        result = await Post.findByIdAndUpdate(
            postId,
            { $addToSet: { likes: user.authId } },
            { new: true },
        )

        // Notify author
        // if (String(post.author) !== String(user.authId)) {
        const postAuthor = await User.findById(post.author).select('+fcmToken')
        console.log(postAuthor)
        if (postAuthor) {
            await sendNotification(
                { authId: user.authId, name: user.name },
                postAuthor._id.toString(),
                'New Like',
                `${user.name} liked your post`,
                ...(postAuthor.fcmToken ? [postAuthor.fcmToken] : []),
            )
        }
        // }
    }

    return result
}

const addComment = async (user: JwtPayload, postId: string, content: string) => {
    const post = await Post.findById(postId)
    if (!post) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found')
    }

    const comment = {
        user: user.authId,
        content,
    }

    const result = await Post.findByIdAndUpdate(
        postId,
        { $push: { comments: comment } },
        { new: true },
    )
        .populate('author', 'name profile')
        .populate('comments.user', 'name profile')

    // Notify author
    // if (String(post.author) !== String(user.authId)) {
    const postAuthor = await User.findById(post.author).select('+fcmToken')
    console.log(postAuthor)
    if (postAuthor) {
        await sendNotification(
            { authId: user.authId, name: user.name },
            postAuthor._id.toString(),
            'New Comment',
            `${user.name} commented on your post`,
            ...(postAuthor.fcmToken ? [postAuthor.fcmToken] : []),
        )
    }
    return result
}

const getMyPosts = async (user: JwtPayload, paginationOptions: IPaginationOptions) => {
    const { page, limit, skip, sortBy, sortOrder } =
        paginationHelper.calculatePagination(paginationOptions)

    const whereConditions = { author: new Types.ObjectId(user.authId) }

    const sortConditions: { [key: string]: SortOrder } = {}
    if (sortBy && sortOrder) {
        sortConditions[sortBy] = sortOrder
    }

    const result = await Post.find(whereConditions)
        .populate('author', 'name profile')
        .populate('comments.user', 'name profile')
        .sort(sortConditions)
        .skip(skip)
        .limit(limit)

    const total = await Post.countDocuments(whereConditions)

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: result,
    }
}

export const PostServices = {
    createPost,
    getAllPosts,
    toggleLike,
    addComment,
    getMyPosts,
}
