import { injectable } from "tsyringe";
import type { IFaqRepository } from "./faq.repository.interface.js";
import { Faq } from "../entities/faq.entity.js";
import { FaqGroup } from "../entities/faq.group.entity.js";
import { FaqGroupModel, FaqModel, FaqSeedModel } from "../infrastructure/faq.schema.js";
import { FAQ_SEED } from "../infrastructure/faq.seed.js";
import { FaqMapper, type FaqGroupRecord, type FaqRecord } from "../mappers/faq.mapper.js";

/** Once this process has confirmed the seed ran, reads skip the check. */
let seedChecked = false;

const toGroups = (records: FaqGroupRecord[]) => records.map((r) => FaqMapper.toGroupDomain(r)).filter((g): g is FaqGroup => g !== null);
const toFaqs = (records: FaqRecord[]) => records.map((r) => FaqMapper.toDomain(r)).filter((f): f is Faq => f !== null);

@injectable()
export class FaqRepository implements IFaqRepository {
    async ensureSeeded(): Promise<void> {
        if (seedChecked) return;

        // Upsert is atomic: only the one request that creates the marker loads the starter questions.
        const marker = await FaqSeedModel.updateOne({ _id: "faq" }, { $setOnInsert: { seededAt: new Date() } }, { upsert: true });
        if (marker.upsertedCount === 1) {
            try {
                for (const [order, seed] of FAQ_SEED.entries()) {
                    const group = await FaqGroupModel.create({ name: seed.group, order });
                    await FaqModel.insertMany(seed.faqs.map((f, i) => ({ ...f, group: group._id, order: i })));
                }
            } catch (error) {
                // Let the next read try again instead of leaving a half-loaded FAQ for good.
                await Promise.all([FaqSeedModel.deleteOne({ _id: "faq" }), FaqGroupModel.deleteMany({}), FaqModel.deleteMany({})]);
                throw error;
            }
        }
        seedChecked = true;
    }

    /* ---------- groups ---------- */

    async findAllGroups(): Promise<FaqGroup[]> {
        const records = await FaqGroupModel.find().sort({ order: 1, _id: 1 }).lean<FaqGroupRecord[]>();
        return toGroups(records);
    }

    async findGroupById(id: string): Promise<FaqGroup | null> {
        const record = await FaqGroupModel.findById(id).lean<FaqGroupRecord>();
        return FaqMapper.toGroupDomain(record);
    }

    async createGroup(group: FaqGroup): Promise<FaqGroup> {
        const created = await FaqGroupModel.create(FaqMapper.toGroupPersistence(group));
        return FaqMapper.toGroupDomain(created.toObject() as FaqGroupRecord)!;
    }

    async saveGroup(group: FaqGroup): Promise<FaqGroup> {
        if (!group.id) throw new Error("Cannot save FAQ group without an ID");
        const updated = await FaqGroupModel.findByIdAndUpdate(group.id, { $set: FaqMapper.toGroupPersistence(group) }, { new: true, runValidators: true }).lean<FaqGroupRecord>();
        if (!updated) throw new Error("FAQ group not found for update");
        return FaqMapper.toGroupDomain(updated)!;
    }

    async deleteGroup(id: string): Promise<void> {
        await FaqGroupModel.findByIdAndDelete(id);
    }

    async nextGroupOrder(): Promise<number> {
        const last = await FaqGroupModel.findOne().sort({ order: -1 }).lean<FaqGroupRecord>();
        return (last?.order ?? -1) + 1;
    }

    async setGroupOrder(ids: string[]): Promise<void> {
        await FaqGroupModel.bulkWrite(ids.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { $set: { order } } } })));
    }

    /* ---------- questions ---------- */

    async findAllFaqs(): Promise<Faq[]> {
        const records = await FaqModel.find().sort({ group: 1, order: 1, _id: 1 }).lean<FaqRecord[]>();
        return toFaqs(records);
    }

    async findFaqById(id: string): Promise<Faq | null> {
        const record = await FaqModel.findById(id).lean<FaqRecord>();
        return FaqMapper.toDomain(record);
    }

    async countFaqsInGroup(groupId: string): Promise<number> {
        return FaqModel.countDocuments({ group: groupId });
    }

    async countHomeFaqs(exceptId?: string | null): Promise<number> {
        return FaqModel.countDocuments({ showOnHome: true, isActive: true, ...(exceptId ? { _id: { $ne: exceptId } } : {}) });
    }

    async createFaq(faq: Faq): Promise<Faq> {
        const created = await FaqModel.create(FaqMapper.toPersistence(faq));
        return FaqMapper.toDomain(created.toObject() as FaqRecord)!;
    }

    async saveFaq(faq: Faq): Promise<Faq> {
        if (!faq.id) throw new Error("Cannot save FAQ without an ID");
        const updated = await FaqModel.findByIdAndUpdate(faq.id, { $set: FaqMapper.toPersistence(faq) }, { new: true, runValidators: true }).lean<FaqRecord>();
        if (!updated) throw new Error("FAQ not found for update");
        return FaqMapper.toDomain(updated)!;
    }

    async deleteFaq(id: string): Promise<void> {
        await FaqModel.findByIdAndDelete(id);
    }

    async nextFaqOrder(groupId: string): Promise<number> {
        const last = await FaqModel.findOne({ group: groupId }).sort({ order: -1 }).lean<FaqRecord>();
        return (last?.order ?? -1) + 1;
    }

    async setFaqOrder(ids: string[]): Promise<void> {
        await FaqModel.bulkWrite(ids.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { $set: { order } } } })));
    }
}
