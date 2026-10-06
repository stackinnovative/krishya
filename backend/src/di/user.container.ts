import { container } from "tsyringe";
import type { IAdminLoginUseCase } from "../modules/user/use-cases/interfaces/admin.login.use-case.interface.js";
import { AdminLoginUseCase } from "../modules/user/use-cases/admin.login.use-case.js";
import type { IUserRepository } from "../modules/user/repositories/user.repository.interface.js";
import { UserRepository } from "../modules/user/repositories/user.repository.js";
import type { IGetCurrentUserUseCase } from "../modules/user/use-cases/interfaces/get.current.user.use-case.interface.js";
import { GetCurrentUserUseCase } from "../modules/user/use-cases/get.current.user.use-case.js";
import type { IUserRefreshTokenUseCase } from "../modules/user/use-cases/interfaces/user.refresh.token.use-case.interface.js";
import { UserRefreshTokenUseCase } from "../modules/user/use-cases/user.refresh.token.use-case.js";
import type { IGetAdminUsersUseCase } from "../modules/user/use-cases/interfaces/get.admin.users.use-case.interface.js";
import { GetAdminUsersUseCase } from "../modules/user/use-cases/get.admin.users.use-case.js";
import type { IGetAdminUserDetailUseCase } from "../modules/user/use-cases/interfaces/get.admin.user.detail.use-case.interface.js";
import { GetAdminUserDetailUseCase } from "../modules/user/use-cases/get.admin.user.detail.use-case.js";
import type { ICreateAdminUserUseCase } from "../modules/user/use-cases/interfaces/create.admin.user.use-case.interface.js";
import { CreateAdminUserUseCase } from "../modules/user/use-cases/create.admin.user.use-case.js";
import type { IUpdateAdminUserUseCase } from "../modules/user/use-cases/interfaces/update.admin.user.use-case.interface.js";
import { UpdateAdminUserUseCase } from "../modules/user/use-cases/update.admin.user.use-case.js";
import type { IBlockAdminUserUseCase } from "../modules/user/use-cases/interfaces/block.admin.user.use-case.interface.js";
import { BlockAdminUserUseCase } from "../modules/user/use-cases/block.admin.user.use-case.js";
import type { IUnblockAdminUserUseCase } from "../modules/user/use-cases/interfaces/unblock.admin.user.use-case.interface.js";
import { UnblockAdminUserUseCase } from "../modules/user/use-cases/unblock.admin.user.use-case.js";

export const registerUserDependencies = () => {
  container.register<IAdminLoginUseCase>("IAdminLoginUseCase", {
    useClass: AdminLoginUseCase,
  });
  container.register<IUserRepository>("IUserRepository", {
    useClass: UserRepository,
  });

  container.register<IGetCurrentUserUseCase>("IGetCurrentUserUseCase", {
    useClass: GetCurrentUserUseCase,
  });

  container.register<IUserRefreshTokenUseCase>("IUserRefreshTokenUseCase", {
    useClass: UserRefreshTokenUseCase
  })

  container.register<IGetAdminUsersUseCase>("IGetAdminUsersUseCase", {
    useClass: GetAdminUsersUseCase,
  });

  container.register<IGetAdminUserDetailUseCase>("IGetAdminUserDetailUseCase", {
    useClass: GetAdminUserDetailUseCase,
  });

  container.register<ICreateAdminUserUseCase>("ICreateAdminUserUseCase", {
    useClass: CreateAdminUserUseCase,
  });

  container.register<IUpdateAdminUserUseCase>("IUpdateAdminUserUseCase", {
    useClass: UpdateAdminUserUseCase,
  });

  container.register<IBlockAdminUserUseCase>("IBlockAdminUserUseCase", {
    useClass: BlockAdminUserUseCase,
  });

  container.register<IUnblockAdminUserUseCase>("IUnblockAdminUserUseCase", {
    useClass: UnblockAdminUserUseCase,
  });
};
