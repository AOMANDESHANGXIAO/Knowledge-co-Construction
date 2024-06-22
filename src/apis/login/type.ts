interface SignInParams {
    class_id: number
    username: string
    nickname: string
    password: string
}

interface SignUpParams {
    username: string
    password: string
}

export type {
    SignUpParams,
    SignInParams,
}