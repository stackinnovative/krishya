/** Shared by the DTO (request errors) and the entities (invariants). */
export const FAQ_LIMITS = {
    groupName: 60,
    question: 200,
    answer: 1000,
    /** Questions the home page shows at most. */
    homeMax: 6,
    /** Shown on the home page when the admin hasn't picked any. */
    homeFallback: 5,
} as const;

/** Heading on the FAQ page that questions sit under, e.g. "Orders & Delivery". */
export type FaqGroupProps = {
    id?: string | null;
    name: string;
    order: number;
    isActive?: boolean;
};

/**
 * One question. `answer` may contain {delivery}, {deliveryCharge} and
 * {freeAbove} - the storefront fills them from Business Settings, so a
 * delivery answer never goes out of date.
 */
export type FaqProps = {
    id?: string | null;
    question: string;
    answer: string;
    groupId: string;
    order: number;
    isActive?: boolean;
    showOnHome?: boolean;
};

export type FaqView = {
    id: string;
    question: string;
    answer: string;
    groupId: string;
    order: number;
    isActive: boolean;
    showOnHome: boolean;
};

/** Admin page: every group (hidden ones too) with all its questions, in order. */
export type AdminFaqGroupView = {
    id: string;
    name: string;
    order: number;
    isActive: boolean;
    faqs: FaqView[];
};

export type UserFaqView = {
    id: string;
    question: string;
    answer: string;
};

/** FAQ page: visible groups that have at least one visible question. */
export type UserFaqGroupView = {
    id: string;
    name: string;
    faqs: UserFaqView[];
};
