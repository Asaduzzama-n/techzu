import { Types } from 'mongoose'

export type IComment = {
    user: Types.ObjectId
    content: string
    createdAt?: Date
}

export type IPost = {
    author: Types.ObjectId
    content: string
    likes: Types.ObjectId[]
    comments: IComment[]
}
