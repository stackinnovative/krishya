import "reflect-metadata";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Faq } from "../entities/faq.entity.js";
import { FaqGroup } from "../entities/faq.group.entity.js";
import { FaqMapper } from "../mappers/faq.mapper.js";
import { CreateFaqSchema, ReorderSchema } from "../dtos/faq.dto.js";
import type { IFaqRepository } from "../repositories/faq.repository.interface.js";
import { GetHomeFaqsUseCase } from "../use-cases/get.home.faqs.use-case.js";
import { CreateFaqUseCase } from "../use-cases/create.faq.use-case.js";
import { EditFaqUseCase } from "../use-cases/edit.faq.use-case.js";
import { DeleteFaqGroupUseCase } from "../use-cases/delete.faq.group.use-case.js";
import { ReorderFaqsUseCase } from "../use-cases/reorder.faqs.use-case.js";
import { CustomError } from "../../../core/errors/custom.error.js";

const G1 = "64c000000000000000000001";
const G2 = "64c000000000000000000002";
const faq = (id: string, groupId: string, order: number, extra: Partial<ConstructorParameters<typeof Faq>[0]> = {}) =>
    new Faq({ id, question: `Question ${id}?`, answer: `Answer ${id}.`, groupId, order, ...extra });

/** In-memory store - only what the use-cases touch. */
class FakeFaqRepository implements IFaqRepository {
    groups = new Map<string, FaqGroup>();
    faqs = new Map<string, Faq>();
    nextId = 100;
    constructor(groups: FaqGroup[] = [], faqs: Faq[] = []) {
        groups.forEach((g) => this.groups.set(g.id!, g));
        faqs.forEach((f) => this.faqs.set(f.id!, f));
    }
    async ensureSeeded() {}
    async findAllGroups() {
        return [...this.groups.values()].sort((a, b) => a.order - b.order);
    }
    async findGroupById(id: string) {
        return this.groups.get(id) ?? null;
    }
    async createGroup(g: FaqGroup) {
        const saved = new FaqGroup({ ...g, id: `g${this.nextId++}` });
        this.groups.set(saved.id!, saved);
        return saved;
    }
    async saveGroup(g: FaqGroup) {
        this.groups.set(g.id!, g);
        return g;
    }
    async deleteGroup(id: string) {
        this.groups.delete(id);
    }
    async nextGroupOrder() {
        return this.groups.size;
    }
    async setGroupOrder(ids: string[]) {
        ids.forEach((id, order) => this.groups.set(id, new FaqGroup({ ...this.groups.get(id)!, order })));
    }
    async findAllFaqs() {
        return [...this.faqs.values()].sort((a, b) => a.groupId.localeCompare(b.groupId) || a.order - b.order);
    }
    async findFaqById(id: string) {
        return this.faqs.get(id) ?? null;
    }
    async countFaqsInGroup(groupId: string) {
        return [...this.faqs.values()].filter((f) => f.groupId === groupId).length;
    }
    async countHomeFaqs(exceptId?: string | null) {
        return [...this.faqs.values()].filter((f) => f.onHomePage && f.id !== exceptId).length;
    }
    async createFaq(f: Faq) {
        const saved = new Faq({ ...f, id: `f${this.nextId++}` });
        this.faqs.set(saved.id!, saved);
        return saved;
    }
    async saveFaq(f: Faq) {
        this.faqs.set(f.id!, f);
        return f;
    }
    async deleteFaq(id: string) {
        this.faqs.delete(id);
    }
    async nextFaqOrder(groupId: string) {
        return [...this.faqs.values()].filter((f) => f.groupId === groupId).length;
    }
    async setFaqOrder(ids: string[]) {
        ids.forEach((id, order) => this.faqs.set(id, new Faq({ ...this.faqs.get(id)!, order })));
    }
}

const statusOf = async (promise: Promise<unknown>) => {
    try {
        await promise;
        return 0;
    } catch (err) {
        return err instanceof CustomError ? err.statusCode : -1;
    }
};

const twoGroups = () => [new FaqGroup({ id: G1, name: "Orders", order: 0 }), new FaqGroup({ id: G2, name: "Payments", order: 1 })];

describe("FAQ entities and DTO", () => {
    it("trims text and refuses an empty question or group name", () => {
        assert.equal(faq("a", G1, 0, { question: "  Why?  " }).question, "Why?");
        assert.throws(() => faq("a", G1, 0, { answer: "   " }), /answer is required/);
        assert.throws(() => new FaqGroup({ name: " ", order: 0 }), /name is required/);
    });

    it("reports request errors on the right field and rejects duplicate ids in a reorder", () => {
        const result = CreateFaqSchema.safeParse({ question: "", answer: "Yes.", groupId: "nope" });
        assert.equal(result.success, false);
        const paths = result.success ? [] : result.error.issues.map((i) => i.path.join("."));
        assert.deepEqual(paths.sort(), ["groupId", "question"]);
        assert.equal(ReorderSchema.safeParse({ ids: [G1, G1] }).success, false);
    });
});

describe("FaqMapper.toUserGroups", () => {
    it("drops hidden questions, hidden groups and groups left empty", () => {
        const groups = [...twoGroups(), new FaqGroup({ id: "64c000000000000000000003", name: "Hidden", order: 2, isActive: false })];
        const faqs = [faq("a", G1, 0), faq("b", G1, 1, { isActive: false }), faq("c", G2, 0, { isActive: false }), faq("d", "64c000000000000000000003", 0)];
        const view = FaqMapper.toUserGroups(groups, faqs);
        assert.deepEqual(
            view.map((g) => [g.name, g.faqs.map((f) => f.id)]),
            [["Orders", ["a"]]]
        );
    });
});

describe("GetHomeFaqsUseCase", () => {
    it("shows the picked questions in FAQ-page order, skipping hidden ones", async () => {
        const repo = new FakeFaqRepository(twoGroups(), [
            faq("a", G1, 0),
            faq("b", G1, 1, { showOnHome: true }),
            faq("c", G2, 0, { showOnHome: true, isActive: false }),
            faq("d", G2, 1, { showOnHome: true }),
        ]);
        const home = await new GetHomeFaqsUseCase(repo).execute();
        assert.deepEqual(
            home.map((f) => f.id),
            ["b", "d"]
        );
    });

    it("falls back to the first five visible questions when none are picked", async () => {
        const repo = new FakeFaqRepository(twoGroups(), Array.from({ length: 7 }, (_, i) => faq(`q${i}`, i < 4 ? G1 : G2, i)));
        const home = await new GetHomeFaqsUseCase(repo).execute();
        assert.deepEqual(
            home.map((f) => f.id),
            ["q0", "q1", "q2", "q3", "q4"]
        );
    });
});

describe("FAQ write use-cases", () => {
    it("adds a question to the end of its group", async () => {
        const repo = new FakeFaqRepository(twoGroups(), [faq("a", G1, 0), faq("b", G1, 1)]);
        await new CreateFaqUseCase(repo).execute({ question: "New?", answer: "Yes.", groupId: G1, isActive: true, showOnHome: false });
        const added = [...repo.faqs.values()].find((f) => f.question === "New?");
        assert.equal(added?.order, 2);
    });

    it("refuses a 7th home-page question but lets an existing one be re-saved", async () => {
        const six = Array.from({ length: 6 }, (_, i) => faq(`h${i}`, G1, i, { showOnHome: true }));
        const repo = new FakeFaqRepository(twoGroups(), six);
        const dto = { question: "New?", answer: "Yes.", groupId: G1, isActive: true, showOnHome: true };
        assert.equal(await statusOf(new CreateFaqUseCase(repo).execute(dto)), 400);
        assert.equal(await statusOf(new EditFaqUseCase(repo).execute("h0", { ...dto, question: "Edited?" })), 0);
        // A hidden question never takes a home slot.
        assert.equal(await statusOf(new CreateFaqUseCase(repo).execute({ ...dto, isActive: false })), 0);
    });

    it("moves a question to the end of another group", async () => {
        const repo = new FakeFaqRepository(twoGroups(), [faq("a", G1, 0), faq("b", G2, 0), faq("c", G2, 1)]);
        await new EditFaqUseCase(repo).execute("a", { question: "Question a?", answer: "Answer a.", groupId: G2, isActive: true, showOnHome: false });
        assert.equal(repo.faqs.get("a")?.groupId, G2);
        assert.equal(repo.faqs.get("a")?.order, 2);
    });

    it("won't delete a group that still has questions", async () => {
        const repo = new FakeFaqRepository(twoGroups(), [faq("a", G1, 0)]);
        assert.equal(await statusOf(new DeleteFaqGroupUseCase(repo).execute(G1)), 400);
        assert.equal(await statusOf(new DeleteFaqGroupUseCase(repo).execute(G2)), 0);
        assert.equal(repo.groups.has(G2), false);
    });

    it("reorders a group's questions only when the list matches exactly", async () => {
        const repo = new FakeFaqRepository(twoGroups(), [faq("a", G1, 0), faq("b", G1, 1), faq("c", G2, 0)]);
        const useCase = new ReorderFaqsUseCase(repo);
        assert.equal(await statusOf(useCase.execute(G1, { ids: ["a"] })), 409);
        assert.equal(await statusOf(useCase.execute(G1, { ids: ["b", "c"] })), 409);
        await useCase.execute(G1, { ids: ["b", "a"] });
        assert.equal(repo.faqs.get("b")?.order, 0);
        assert.equal(repo.faqs.get("a")?.order, 1);
    });
});
