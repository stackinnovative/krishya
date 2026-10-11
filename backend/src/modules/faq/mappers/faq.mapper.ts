import { Faq } from "../entities/faq.entity.js";
import { FaqGroup } from "../entities/faq.group.entity.js";
import type { AdminFaqGroupView, FaqView, UserFaqGroupView, UserFaqView } from "../types/faq.type.js";

type Id = { toString(): string } | string;

/** A group document as `.lean()` returns it. */
export type FaqGroupRecord = { _id?: Id; name: string; order?: number; isActive?: boolean };

/** A question document as `.lean()` returns it. */
export type FaqRecord = { _id?: Id; question: string; answer: string; group: Id; order?: number; isActive?: boolean; showOnHome?: boolean };

export class FaqMapper {
    static toGroupDomain(record: FaqGroupRecord | null): FaqGroup | null {
        const id = record?._id?.toString();
        if (!record || !id) return null;
        return new FaqGroup({ id, name: record.name, order: record.order ?? 0, isActive: record.isActive ?? true });
    }

    static toDomain(record: FaqRecord | null): Faq | null {
        const id = record?._id?.toString();
        if (!record || !id) return null;
        return new Faq({
            id,
            question: record.question,
            answer: record.answer,
            groupId: record.group.toString(),
            order: record.order ?? 0,
            isActive: record.isActive ?? true,
            showOnHome: record.showOnHome ?? false,
        });
    }

    static toGroupPersistence(entity: FaqGroup) {
        return { name: entity.name, order: entity.order, isActive: entity.isActive };
    }

    static toPersistence(entity: Faq) {
        return {
            question: entity.question,
            answer: entity.answer,
            group: entity.groupId,
            order: entity.order,
            isActive: entity.isActive,
            showOnHome: entity.showOnHome,
        };
    }

    static toView(entity: Faq): FaqView {
        return {
            id: entity.id ?? "",
            question: entity.question,
            answer: entity.answer,
            groupId: entity.groupId,
            order: entity.order,
            isActive: entity.isActive,
            showOnHome: entity.showOnHome,
        };
    }

    static toUserView(entity: Faq): UserFaqView {
        return { id: entity.id ?? "", question: entity.question, answer: entity.answer };
    }

    /** Every group with all its questions - both lists arrive already sorted by `order`. */
    static toAdminGroups(groups: FaqGroup[], faqs: Faq[]): AdminFaqGroupView[] {
        return groups.map((g) => ({
            id: g.id ?? "",
            name: g.name,
            order: g.order,
            isActive: g.isActive,
            faqs: faqs.filter((f) => f.groupId === g.id).map(FaqMapper.toView),
        }));
    }

    /** Only visible groups with visible questions; a group left empty is dropped. */
    static toUserGroups(groups: FaqGroup[], faqs: Faq[]): UserFaqGroupView[] {
        return groups
            .filter((g) => g.isActive)
            .map((g) => ({ id: g.id ?? "", name: g.name, faqs: faqs.filter((f) => f.groupId === g.id && f.isActive).map(FaqMapper.toUserView) }))
            .filter((g) => g.faqs.length > 0);
    }
}
