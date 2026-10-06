import { HttpStatusCode } from "../../../core/constants/http.status.codes.js";
import { ResponseMessages } from "../../../core/constants/response.message.js";
import { CustomError } from "../../../core/errors/custom.error.js";
import { User } from "../entities/user.entity.js";
import { UserModel } from "../infrastructure/user.schema.js";
import { UserMapper } from "../mappers/user.mapper.js";
import type { IUserRepository } from "./user.repository.interface.js";
import type { IGetAllDocDB } from "../../../core/shared/interfaces/get.all.doc.interface.js";
import type { AdminUserView } from "../types/user.type.js";

export class UserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const persistenceData = UserMapper.toPersistence(user);
    const created = await UserModel.create(persistenceData);
    const domainUser = UserMapper.toDomain(created);
    if (!domainUser) {
      throw new CustomError(
        ResponseMessages.FAILED_TO_MAP,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    return domainUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    const foundDocument = await UserModel.findOne({
      email: email.toLowerCase(),
    }).lean();
    return UserMapper.toDomain(foundDocument);
  }

  async findByPhone(phone: string): Promise<User | null> {
    const foundDocument = await UserModel.findOne({ phone }).lean();
    return UserMapper.toDomain(foundDocument);
  }

  async findById(id: string): Promise<User | null> {
    const foundDocument = await UserModel.findOne({ _id: id }).lean();
    return UserMapper.toDomain(foundDocument);
  }

  async save(user: User): Promise<User> {
    if (!user.id) {
      throw new CustomError(
        ResponseMessages.ID_MISSING,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
    const persistenceData = UserMapper.toPersistence(user);
    const updatedDocument = await UserModel.findByIdAndUpdate(
      user.id,
      { $set: persistenceData },
      { new: true },
    ).lean();

    if (!updatedDocument) {
      throw new CustomError(
        ResponseMessages.USER_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    const domainUser = UserMapper.toDomain(updatedDocument);
    if (!domainUser) {
      throw new CustomError(
        ResponseMessages.FAILED_TO_MAP,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    return domainUser;
  }

  async getNewUsersCount(startDate: Date, endDate: Date): Promise<number> {
    return await UserModel.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });
  }

  async getDailyNewUsers(
    startDate: Date,
    endDate: Date,
  ): Promise<{ _id: string; count: number }[]> {
    return await UserModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getAdminUserList(allDoc: IGetAllDocDB): Promise<AdminUserView[]> {
    const { query, page, limit, sort } = allDoc;
    const skip = (page - 1) * limit;

    const documents = await UserModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return documents
      .map(UserMapper.toAdminView)
      .filter((u): u is AdminUserView => u !== null);
  }

  async getAdminUserDetail(userId: string): Promise<AdminUserView | null> {
    const document = await UserModel.findById(userId).lean();
    return UserMapper.toAdminView(document);
  }

  async countDocuments(query: Record<string, any>): Promise<number> {
    return UserModel.countDocuments(query);
  }
}
