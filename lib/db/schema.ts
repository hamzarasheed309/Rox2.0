import { z } from "zod";

// User schema
export const userSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["user", "admin"]).default("user"),
  plan: z.enum(["basic", "professional", "enterprise"]).default("basic"),
  createdAt: z.date(),
  updatedAt: z.date(),
  emailVerified: z.boolean().default(false),
  resetPasswordToken: z.string().nullable(),
  resetPasswordExpires: z.date().nullable(),
});

export type User = z.infer<typeof userSchema>;

// Project schema
export const projectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  userId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isArchived: z.boolean().default(false),
});

export type Project = z.infer<typeof projectSchema>;

// Dataset schema
export const datasetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Dataset name is required"),
  description: z.string().optional(),
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  fileUrl: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isArchived: z.boolean().default(false),
});

export type Dataset = z.infer<typeof datasetSchema>;

// Analysis schema
export const analysisSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Analysis name is required"),
  description: z.string().optional(),
  datasetId: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(["descriptive", "inferential", "survival", "custom"]),
  parameters: z.record(z.any()),
  results: z.record(z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
  isArchived: z.boolean().default(false),
});

export type Analysis = z.infer<typeof analysisSchema>;

// Subscription schema
export const subscriptionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  plan: z.enum(["basic", "professional", "enterprise"]),
  status: z.enum(["active", "canceled", "past_due", "trialing"]),
  currentPeriodStart: z.date(),
  currentPeriodEnd: z.date(),
  cancelAtPeriodEnd: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Subscription = z.infer<typeof subscriptionSchema>;

// Billing schema
export const billingSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  amount: z.number(),
  currency: z.string().default("USD"),
  status: z.enum(["succeeded", "pending", "failed", "refunded"]),
  paymentMethod: z.string(),
  invoiceUrl: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Billing = z.infer<typeof billingSchema>; 