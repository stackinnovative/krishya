import { injectable } from "tsyringe";
import type { IHeroRepository } from "./hero.repository.interface.js";
import { Hero } from "../entities/hero.entity.js";
import { HeroModel } from "../infrastructure/hero.schema.js";
import { HeroMapper } from "../mappers/hero.mapper.js";
import type { HeroView, UserHeroView } from "../types/hero.type.js";

@injectable()
export class HeroRepository implements IHeroRepository {
    async create(heroEntity: Hero): Promise<Hero> {
        const persistenceData = HeroMapper.toPersistence(heroEntity);
        const createdHero = await HeroModel.create(persistenceData);
        return HeroMapper.toDomain(createdHero)!;
    }

    async findById(id: string): Promise<Hero | null> {
        const hero = await HeroModel.findById(id).lean();
        if (!hero) return null;
        return HeroMapper.toDomain(hero);
    }

    async save(heroEntity: Hero): Promise<Hero> {
        const { id } = heroEntity;
        if (!id) {
            throw new Error("Cannot save hero without an ID");
        }

        const persistenceData = HeroMapper.toPersistence(heroEntity);
        const updatedHero = await HeroModel.findByIdAndUpdate(
            id,
            { $set: persistenceData },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedHero) {
            throw new Error("Hero not found for update");
        }

        return HeroMapper.toDomain(updatedHero)!;
    }

    async getHeroBannersForUser(): Promise<UserHeroView[]> {
        const heroes = await HeroModel.find({ isActive: true }).sort({ priority: 1, createdAt: -1 }).lean();
        return heroes
            .map((hero) => HeroMapper.toUserView(hero))
            .filter((hero): hero is UserHeroView => hero !== null);
    }

    async getHeroBannersForAdmin(): Promise<HeroView[]> {
        const heroes = await HeroModel.find().sort({ priority: 1, createdAt: -1 }).lean();
        return heroes
            .map((hero) => HeroMapper.toAdminView(hero))
            .filter((hero): hero is HeroView => hero !== null);
    }

    async findByPriority(priority: number, excludeId?: string | null): Promise<Hero | null> {
        const query: any = { priority };
        if (excludeId) query._id = { $ne: excludeId };
        const hero = await HeroModel.findOne(query).lean();
        if (!hero) return null;
        return HeroMapper.toDomain(hero);
    }

    async countDocuments(): Promise<number> {
        const count = await HeroModel.countDocuments();
        return count;
    }
}
