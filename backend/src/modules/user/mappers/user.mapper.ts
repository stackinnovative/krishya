import { User } from "../entities/user.entity.js";
import type { AdminUserView } from "../types/user.type.js";

export class UserMapper {
  static toDomain(userModelData: any): User | null {
    if (!userModelData) {
      return null;
    }
    const idString =
      userModelData._id?.toString() || userModelData.id?.toString();

    if (!idString) {
      console.error("User data from DB is missing an ID:", userModelData);
      return null;
    }

    return new User({
      id: idString,
      name: userModelData.name,
      email: userModelData.email,
      phone: userModelData.phone,
      role: userModelData.role,
      password: userModelData.password,
      googleId: userModelData.googleId,
      isBlocked: userModelData.isBlocked,
      isVerified: userModelData.isVerified,
      isGuest: userModelData.isGuest,
      address: userModelData.address,
      tokenVersion: userModelData.tokenVersion,
    });
  }

  static toPersistence(userEntity: User): any {
    return {
      name: userEntity.name,
      email: userEntity.email,
      phone: userEntity.phone,
      password: userEntity.password,
      tokenVersion: userEntity.tokenVersion,
      isVerified: userEntity.isVerified,
      role: userEntity.role,
      googleId: userEntity.googleId,
      isBlocked: userEntity.isBlocked,
      isGuest: userEntity.isGuest,
      address: userEntity.address,
    };
  }

  static toAdminView(userModelData: any): AdminUserView | null {
    if (!userModelData) return null;

    const id = userModelData._id?.toString() || userModelData.id?.toString();

    if (!id) {
      console.error("User data missing ID:", userModelData);
      return null;
    }

    return {
      id,
      name: userModelData.name,
      email: userModelData.email,
      phone: userModelData.phone,
      address: userModelData.address,
      role: userModelData.role,
      isBlocked: userModelData.isBlocked,
      createdAt: userModelData.createdAt,
    };
  }
}
