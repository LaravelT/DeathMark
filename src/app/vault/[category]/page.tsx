"use client";

import React from "react";
import { useParams } from "next/navigation";
import CategoryView from "../components/CategoryView";

export default function VaultCategoryPage() {
  const params = useParams();
  const categoryId = params.category as string;

  return <CategoryView categoryId={categoryId} />;
}
