import { toSlug } from "../../../core/utils/to.slug.helper.js";
import {
  CATEGORY_ICON_NAMES,
  CATEGORY_LIMITS,
  type CategoryIconName,
  type CategoryProps,
} from "../types/category.type.js";


export class Category {
  public readonly id: string | null;
  public readonly name: string;
  public readonly slug: string;
  public readonly description: string;
  public readonly icon: CategoryIconName;
  public readonly sortOrder: number;
  public readonly isActive: boolean;

  constructor(props: CategoryProps) {
    const name = props.name.trim();

    if (!name) {
      throw new Error("Category name cannot be empty");
    }

    if (name.length < 2 || name.length > 100) {
      throw new Error("Category name must be between 2 and 100 characters");
    }

    if (props.description && props.description.trim().length > 200) {
      throw new Error("Category description cannot exceed 200 characters");
    }

    const slug = toSlug(props.slug, CATEGORY_LIMITS.slug);
    if (!slug) {
      throw new Error("Category slug needs at least one letter or number");
    }

    if (!CATEGORY_ICON_NAMES.includes(props.icon)) {
      throw new Error(`Category icon must be one of: ${CATEGORY_ICON_NAMES.join(", ")}`);
    }

    const sortOrder = props.sortOrder ?? 0;
    if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > CATEGORY_LIMITS.sortOrderMax) {
      throw new Error(`Category sort order must be a whole number from 0 to ${CATEGORY_LIMITS.sortOrderMax}`);
    }

    this.id = props.id;
    this.name = name;
    this.slug = slug;
    this.description = props.description?.trim() ?? "";
    this.icon = props.icon;
    this.sortOrder = sortOrder;
    this.isActive = props.isActive ?? true;
  }

  deactivate(): Category {
    if (!this.isActive) {
      throw new Error("Category already inactive");
    }

    return new Category({
      ...this,
      isActive: false,
    });
  }

  activate(): Category {
    if (this.isActive) {
      throw new Error("Category already active");
    }

    return new Category({
      ...this,
      isActive: true,
    });
  }
}
