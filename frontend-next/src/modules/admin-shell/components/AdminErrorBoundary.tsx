"use client";

import { Component, type ReactNode } from "react";
import AdminErrorFallback from "./AdminErrorFallback";

type Props = {
  children: ReactNode;
  title?: string;
  message?: string;
  compact?: boolean;
};

type State = { hasError: boolean };

/**
 * Catches render-time crashes in whatever it wraps so one broken widget
 * (a bad chart calculation, an unexpected null field) can't blank out
 * sibling cards/tables on the same admin page - each gets its own boundary
 * instead of the whole route falling back to app/(admin)/admin/error.tsx.
 */
export default class AdminErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("[admin] widget crashed:", error, info);
  }

  private handleRetry = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <AdminErrorFallback
          title={this.props.title ?? "This section crashed"}
          message={this.props.message ?? "Something unexpected happened here. The rest of the page is unaffected."}
          onRetry={this.handleRetry}
          compact={this.props.compact}
        />
      );
    }
    return this.props.children;
  }
}
