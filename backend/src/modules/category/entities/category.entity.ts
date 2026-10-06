import type { CategoryProps } from "../types/category.type.js";


export class Category {
  public readonly id: string | null;
  public readonly name: string;
  public readonly description: string;
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

    this.id = props.id;
    this.name = name;
    this.description = props.description?.trim();
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
