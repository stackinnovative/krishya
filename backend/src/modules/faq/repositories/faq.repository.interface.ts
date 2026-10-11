import { Faq } from "../entities/faq.entity.js";
import { FaqGroup } from "../entities/faq.group.entity.js";

export interface IFaqRepository {
    /** Loads the starter questions the first time FAQs are ever read; a no-op afterwards. */
    ensureSeeded(): Promise<void>;

    /* ---------- groups ---------- */
    findAllGroups(): Promise<FaqGroup[]>;
    findGroupById(id: string): Promise<FaqGroup | null>;
    createGroup(group: FaqGroup): Promise<FaqGroup>;
    saveGroup(group: FaqGroup): Promise<FaqGroup>;
    deleteGroup(id: string): Promise<void>;
    /** The order a newly added group gets - after every existing one. */
    nextGroupOrder(): Promise<number>;
    /** Writes `order` = position in `ids` for each group. */
    setGroupOrder(ids: string[]): Promise<void>;

    /* ---------- questions ---------- */
    /** Every question, sorted by group then position. */
    findAllFaqs(): Promise<Faq[]>;
    findFaqById(id: string): Promise<Faq | null>;
    countFaqsInGroup(groupId: string): Promise<number>;
    /** Visible questions picked for the home page, excluding `exceptId`. */
    countHomeFaqs(exceptId?: string | null): Promise<number>;
    createFaq(faq: Faq): Promise<Faq>;
    saveFaq(faq: Faq): Promise<Faq>;
    deleteFaq(id: string): Promise<void>;
    nextFaqOrder(groupId: string): Promise<number>;
    /** Writes `order` = position in `ids` for each question. */
    setFaqOrder(ids: string[]): Promise<void>;
}
