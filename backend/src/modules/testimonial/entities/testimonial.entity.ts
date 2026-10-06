import type { TestimonialProps } from "../types/testimonial.type.js";

export class Testimonial {
    public readonly id: string | null;
    public readonly comment: string;
    public readonly author: string;
    public readonly isActive: boolean;

    constructor(props: TestimonialProps) {
        const comment = props.comment.trim();
        const author = props.author.trim();

        if (!comment) {
            throw new Error("Testimonial comment cannot be empty");
        }

        if (comment.length < 5 || comment.length > 500) {
            throw new Error("Testimonial comment must be between 5 and 500 characters");
        }

        if (!author) {
            throw new Error("Testimonial author cannot be empty");
        }

        if (author.length < 2 || author.length > 100) {
            throw new Error("Testimonial author must be between 2 and 100 characters");
        }

        this.id = props.id ?? null;
        this.comment = comment;
        this.author = author;
        this.isActive = props.isActive ?? true;
    }

    activate(): Testimonial {
        if (this.isActive) {
            throw new Error("Testimonial is already active");
        }

        return new Testimonial({
            ...this,
            isActive: true,
        });
    }

    deactivate(): Testimonial {
        if (!this.isActive) {
            throw new Error("Testimonial is already inactive");
        }

        return new Testimonial({
            ...this,
            isActive: false,
        });
    }

    updateDetails(props: {
        comment: string;
        author: string;
    }): Testimonial {
        return new Testimonial({
            ...this,
            comment: props.comment,
            author: props.author,
        });
    }
}
