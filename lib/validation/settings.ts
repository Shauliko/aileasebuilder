import { z } from "zod";

export const appConfigSchema = z.object({
  appName: z.string().optional(),
  logoUrl: z.string().optional(),
  companyEmail: z.string().optional(),
  companyPhone: z.string().optional(),
  timezone: z.string().optional(),
});

export const billingConfigSchema = z.object({
  stripePublishableKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  stripeWebhookSecret: z.string().optional(),
  trialDays: z.number().optional(),
});

export const aiConfigSchema = z.object({
  claudeApiKey: z.string().optional(),
  model: z.string().optional(),
  maxTokensPerDoc: z.number().optional(),
  systemPrompt: z.string().optional(),
});

export const leaseConfigSchema = z.object({
  defaultTemplateId: z.string().optional(),
  autoFillTenantData: z.boolean().optional(),
  generateESignVersion: z.boolean().optional(),
});

export const automationConfigSchema = z.object({
  webhookUrl: z.string().optional(),
  zapierWebhookUrl: z.string().optional(),
  makeWebhookUrl: z.string().optional(),
  autoGenerateLeaseOnApplication: z.boolean().optional(),
  autoSendLeaseToTenant: z.boolean().optional(),
  autoNotifyLandlord: z.boolean().optional(),
});

export const userConfigSchema = z.object({
  maxTeamMembers: z.number().optional(),
  defaultRole: z.string().optional(),
  allowInvites: z.boolean().optional(),
  require2FA: z.boolean().optional(),
});

export const storageConfigSchema = z.object({
  provider: z.enum(["local", "s3"]).optional(),
  s3AccessKeyId: z.string().optional(),
  s3SecretAccessKey: z.string().optional(),
  s3Bucket: z.string().optional(),
  s3Region: z.string().optional(),
  encryptFiles: z.boolean().optional(),
  retentionDays: z.number().optional(),
});

export const monitoringConfigSchema = z.object({
  errorEmail: z.string().optional(),
  enableErrorEmails: z.boolean().optional(),
  slackWebhookUrl: z.string().optional(),
  enableSlackAlerts: z.boolean().optional(),
});

export const settingsUpdateSchema = z.object({
  appConfig: appConfigSchema.optional(),
  billingConfig: billingConfigSchema.optional(),
  aiConfig: aiConfigSchema.optional(),
  leaseConfig: leaseConfigSchema.optional(),
  automationConfig: automationConfigSchema.optional(),
  userConfig: userConfigSchema.optional(),
  storageConfig: storageConfigSchema.optional(),
  monitoringConfig: monitoringConfigSchema.optional(),
});
