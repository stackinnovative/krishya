import { User } from "../entities/user.entity.js";
import type { IGetAllDocDB } from "../../../core/shared/interfaces/get.all.doc.interface.js";
import type { AdminUserView } from "../types/user.type.js";

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>
  findByPhone(phone: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  save(user: User): Promise<User>
  getNewUsersCount(startDate: Date, endDate: Date): Promise<number>;
  getDailyNewUsers(startDate: Date, endDate: Date): Promise<{ _id: string, count: number }[]>;
  getAdminUserList(allDoc: IGetAllDocDB): Promise<AdminUserView[]>;
  getAdminUserDetail(userId: string): Promise<AdminUserView | null>;
  countDocuments(query: Record<string, any>): Promise<number>;
}
