import { injectable } from "tsyringe";
import type { IAboutRepository } from "./about.repository.interface.js";
import type { About } from "../entities/about.entity.js";
import { AboutModel } from "../infrastructure/about.schema.js";
import { AboutMapper, type AboutRecord } from "../mappers/about.mapper.js";

@injectable()
export class AboutRepository implements IAboutRepository {
    async getAbout(): Promise<About> {
        const existing = await AboutModel.findOne().lean<AboutRecord>();
        if (existing) {
            return AboutMapper.toDomain(existing)!;
        }

        // First read ever for this store - materialize the singleton with the default story.
        const created = await AboutModel.create({});
        return AboutMapper.toDomain(created.toObject() as AboutRecord)!;
    }

    async updateAbout(aboutEntity: About): Promise<About> {
        const persistenceData = AboutMapper.toPersistence(aboutEntity);

        // Empty filter + upsert keeps this a true singleton, even under concurrent writes.
        const updated = await AboutModel.findOneAndUpdate(
            {},
            { $set: persistenceData },
            { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
        ).lean<AboutRecord>();

        return AboutMapper.toDomain(updated)!;
    }
}
