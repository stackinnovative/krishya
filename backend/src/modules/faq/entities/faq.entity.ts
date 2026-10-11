import { FAQ_LIMITS as L, type FaqProps } from "../types/faq.type.js";

const fitText = (value: string, label: string, max: number): string => {
    const text = value.trim();
    if (!text) throw new Error(`FAQ ${label} is required`);
    if (text.length > max) throw new Error(`FAQ ${label} cannot exceed ${max} characters`);
    return text;
};

export class Faq {
    public readonly id: string | null;
    public readonly question: string;
    public readonly answer: string;
    public readonly groupId: string;
    public readonly order: number;
    public readonly isActive: boolean;
    public readonly showOnHome: boolean;

    constructor(props: FaqProps) {
        if (!props.groupId) throw new Error("FAQ needs a group");
        if (!Number.isInteger(props.order) || props.order < 0) throw new Error("FAQ order must be a whole number");

        this.id = props.id ?? null;
        this.question = fitText(props.question, "question", L.question);
        this.answer = fitText(props.answer, "answer", L.answer);
        this.groupId = props.groupId;
        this.order = props.order;
        this.isActive = props.isActive ?? true;
        this.showOnHome = props.showOnHome ?? false;
    }

    /** True when this question would take one of the home page's slots. */
    get onHomePage(): boolean {
        return this.isActive && this.showOnHome;
    }

    updateDetails(props: Pick<FaqProps, "question" | "answer" | "groupId" | "order" | "isActive" | "showOnHome">): Faq {
        return new Faq({ ...this, ...props });
    }
}
