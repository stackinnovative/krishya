import { FAQ_LIMITS as L, type FaqGroupProps } from "../types/faq.type.js";

export class FaqGroup {
    public readonly id: string | null;
    public readonly name: string;
    public readonly order: number;
    public readonly isActive: boolean;

    constructor(props: FaqGroupProps) {
        const name = props.name.trim();
        if (!name) throw new Error("FAQ group name is required");
        if (name.length > L.groupName) throw new Error(`FAQ group name cannot exceed ${L.groupName} characters`);
        if (!Number.isInteger(props.order) || props.order < 0) throw new Error("FAQ group order must be a whole number");

        this.id = props.id ?? null;
        this.name = name;
        this.order = props.order;
        this.isActive = props.isActive ?? true;
    }

    updateDetails(props: { name: string; isActive: boolean }): FaqGroup {
        return new FaqGroup({ ...this, ...props });
    }
}
