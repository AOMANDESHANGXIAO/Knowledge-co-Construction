export interface UploadInput {
    student_id: number;
    is_public: number;
    topic_id: number;
}

export interface UploadCourseWorkInput {
    topic_id: number;
    student_id: number;
}