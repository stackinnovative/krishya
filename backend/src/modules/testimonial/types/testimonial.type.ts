export type TestimonialProps = {
    id?: string | null;
    comment: string;
    author: string;
    isActive?: boolean;
};

export type TestimonialView = {
    id: string;
    comment: string;
    author: string;
    isActive: boolean;
};

export type UserTestimonialView = {
    id: string;
    comment: string;
    author: string;
};
